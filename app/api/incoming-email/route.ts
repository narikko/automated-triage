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
    const subject = formData.get('subject') as string;
    const body = formData.get('text') as string;

    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert([{ 
        customer_email: sender, 
        subject: subject, 
        original_message: body,
        status: 'pending' 
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    console.log("✅ Email saved. ID:", ticket.id);

    console.log("Calling OpenAI...");
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert Shopify support assistant. Analyze the email and return a JSON object with 'category' (one word) and 'draft' (the reply)." 
        },
        { role: "user", content: body }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content || "{}");
    console.log("AI Generated Draft:", aiResult.category);

    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        ai_category: aiResult.category,
        ai_draft: aiResult.draft,
        status: 'triaged'
      })
      .eq('id', ticket.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}