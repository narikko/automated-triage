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

    // 2. CHECK FOR EXISTING THREAD (The Magic Threading Logic)
    let ticketId;
    
    // Look for the most recent ticket from this customer
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id, status')
      .eq('merchant_id', merchant.id)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingTicket) {
      ticketId = existingTicket.id;
      // If the ticket was resolved, wake it back up!
      if (existingTicket.status === 'resolved') {
        await supabase.from('tickets').update({ status: 'pending' }).eq('id', ticketId);
      }
    } else {
      // No existing ticket found, create a brand new one
      const { data: newTicket, error: insertError } = await supabase
        .from('tickets')
        .insert([{ 
          merchant_id: merchant.id, 
          customer_email: customerEmail, 
          subject: subject, 
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

    // 5. ASK AI WITH FULL CONTEXT
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are ${merchant.agent_name}, an expert customer support agent for ${merchant.store_name}.
          
          Use this knowledge base to answer the customer:
          ${merchant.store_context}
          
          RULES:
          1. Return JSON with 'category' (one word) and 'draft' (the email reply).
          2. NEVER use placeholders. Sign off as ${merchant.agent_name}.
          3. Read the chat history carefully to understand the context of the conversation.
          4. CRITICAL: You MUST write your final email 'draft' entirely in ${targetLanguage}.` 
        },
        { 
          role: "user", 
          content: `Customer Name: ${customerName}\nSubject: ${subject}\n\nChat History:\n${formattedHistory}\n\nPlease draft the next reply.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content || "{}");

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