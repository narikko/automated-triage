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

    // 1. EXTRACT EMAILS CLEANLY
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

    // 2. FIND THE MERCHANT (The Multi-Tenant Magic)
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('routing_email', routingEmail)
      .single();

    if (merchantError || !merchant) {
      console.error("Unrecognized routing address:", routingEmail);
      return NextResponse.json({ error: "Routing address not registered" }, { status: 404 });
    }

    console.log(`Processing ticket for merchant: ${merchant.store_name}`);

    // 3. SAVE TICKET WITH MERCHANT ID
    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert([{ 
        merchant_id: merchant.id, // Linked to Sarah's Shoes!
        customer_email: sender, 
        subject: subject, 
        original_message: body,
        status: 'pending' 
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. ASK AI WITH DYNAMIC CONTEXT
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
          2. NEVER use placeholders. Sign off as ${merchant.agent_name} from ${merchant.store_name}.
          3. Be empathetic and professional.` 
        },
        { 
          role: "user", 
          content: `Customer Name: ${customerName}\nSubject: ${subject}\n\nMessage: ${body}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content || "{}");

    // 5. UPDATE TICKET
    await supabase
      .from('tickets')
      .update({
        ai_category: aiResult.category,
        ai_draft: aiResult.draft,
        status: 'triaged'
      })
      .eq('id', ticket.id);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Pipeline Error:", error.message || error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}