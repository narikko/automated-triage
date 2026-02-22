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

    // 2. ASK THE AI BRAIN
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Shopify support assistant. Categorize the email and draft a helpful, professional reply. Return your answer as JSON with keys: 'category' and 'draft'."
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nMessage: ${body}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content || "{}");

    await supabase
      .from('tickets')
      .update({
        ai_category: aiResult.category,
        ai_draft: aiResult.draft,
        status: 'triaged'
      })
      .eq('id', ticket.id);

    console.log(`AI triaged ticket from: ${sender}`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}