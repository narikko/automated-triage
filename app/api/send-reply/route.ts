import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { ticketId } = await request.json();

        const {data: ticket, error: fetchError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (fetchError || !ticket) throw new Error("Ticket not found");

        const customerEmail = ticket.customer_email.match(/<(.+)>/)?.[1] || ticket.customer_email;

        const msg = {
            to: customerEmail,
            from: 'support@shopsift.app', 
            subject: `Re: ${ticket.subject}`,
            text: ticket.ai_draft,
        };
        await sgMail.send(msg);

        await supabase
            .from('tickets')
            .update({ status: 'resolved' })
            .eq('id', ticketId);

        console.log("Reply sent successfully to:", customerEmail);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Failed to send reply:", error.message || error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}