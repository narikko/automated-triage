import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sender = formData.get('from') as string;
    const toField = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('text') as string;

    const extractEmail = (str: string) => {
      const match = str.match(/<(.+)>/);
      return match ? match[1].trim() : str.trim();
    };
    const customerEmail = extractEmail(sender);
    const routingEmail = extractEmail(toField);

    let customerName = "Customer";
    const nameMatch = sender.match(/^([^<]+)</);
    if (nameMatch && nameMatch[1]) {
      customerName = nameMatch[1].trim();
    }

    // 1. FIND MERCHANT & LANGUAGE
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('routing_email', routingEmail)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: "Routing address not registered" }, { status: 404 });
    }

    const targetLanguage = merchant.response_language || 'English';

    // 2. CHECK FOR EXISTING THREAD (The Watermark Method)
    let ticketId;
    
    // Look for our exact UUID watermark in the incoming email body
    // UUIDs look like: 123e4567-e89b-12d3-a456-426614174000
    const watermarkMatch = body.match(/Ref ID:\s*([a-f0-9\-]{36})/i);
    
    if (watermarkMatch && watermarkMatch[1]) {
      const extractedId = watermarkMatch[1];
      
      // Verify this ticket actually exists and belongs to this merchant
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('id, status')
        .eq('merchant_id', merchant.id)
        .eq('id', extractedId)
        .single();

      if (existingTicket) {
        ticketId = existingTicket.id;
        // Wake it up if it was resolved
        if (existingTicket.status === 'resolved') {
          await supabase.from('tickets').update({ status: 'pending' }).eq('id', ticketId);
        }
      }
    }

    // If we didn't find a valid watermark, it MUST be a brand new ticket!
    if (!ticketId) {
      const finalSubject = subject && subject.trim() !== '' ? subject : 'No Subject';
      
      const { data: newTicket, error: insertError } = await supabase
        .from('tickets')
        .insert([{ 
          merchant_id: merchant.id, 
          customer_email: customerEmail, 
          subject: finalSubject, 
          status: 'pending' 
        }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      ticketId = newTicket.id;
    }

    // 3. SAVE THE NEW INCOMING MESSAGE
    await supabase.from('ticket_messages').insert([{
      ticket_id: ticketId,
      sender_type: 'customer',
      body: body
    }]);

    // 4. FETCH FULL CHAT HISTORY FOR THE AI
    const { data: chatHistory } = await supabase
      .from('ticket_messages')
      .select('sender_type, body')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    // Format the history so the AI can read it like a script
    const formattedHistory = chatHistory?.map(msg => {
      const role = msg.sender_type === 'customer' ? 'Customer' : 'Agent';
      return `${role}: ${msg.body}`;
    }).join('\n\n') || `Customer: ${body}`;

    // 5. ASK THE PYTHON AGENT WITH FULL CONTEXT
    // Note: We combine the system prompt and the user prompt into one big task for the smolagent.
    const agentPrompt = `
      You are ${merchant.agent_name}, an expert customer support agent for ${merchant.store_name}.
      Your job is to read the customer's email and draft a reply. 
      If they are asking about a product, USE YOUR SHOPIFY TOOL to check the store's data before replying!
      
      Customer Name: ${customerName}
      Subject: ${subject}
      Chat History:
      ${formattedHistory}
      
      RULES:
      1. Investigate the issue using your tools if needed.
      2. Return JSON with 'category' (one word representing the ticket type) and 'draft' (the actual email reply to the customer).
      3. CRITICAL: Your final answer MUST be valid JSON and nothing else.
    `;

    // Make a POST request to your friend's Python microservice
    // (We use localhost for testing, but later this will be their deployed URL like Render/Railway)
    const pythonAgentUrl = process.env.PYTHON_AGENT_URL || 'http://127.0.0.1:8000/ask-agent';
    
    const agentResponse = await fetch(pythonAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: agentPrompt })
    });

    if (!agentResponse.ok) {
      throw new Error("Python Agent failed to respond");
    }

    const agentData = await agentResponse.json();
    
    // The Python agent sends back {"reply": "{ \"category\": \"...\", \"draft\": \"...\" }"}
    // We parse the inner reply string into actual JSON we can use in the database
    const aiResult = JSON.parse(agentData.reply || "{}");

    // 6. SAVE THE AI DRAFT AS A NEW MESSAGE IN THE TIMELINE
    await supabase.from('ticket_messages').insert([{
      ticket_id: ticketId,
      sender_type: 'ai_draft',
      body: aiResult.draft
    }]);

    // 7. UPDATE TICKET CATEGORY
    await supabase.from('tickets').update({
      ai_category: aiResult.category,
      status: 'triaged'
    }).eq('id', ticketId);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Pipeline Error:", error.message || error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}