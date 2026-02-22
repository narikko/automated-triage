import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const sender = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('text') as string;

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          customer_email: sender, 
          subject: subject, 
          message_body: body,
          status: 'pending' 
        },
      ]);

    if (error) throw error;

    console.log("Ticket saved to Supabase for:", sender);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error saving to database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}