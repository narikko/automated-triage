import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Initialize Supabase admin client 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Grab the ticket ID AND the new edited draft from the frontend
    const { ticketId, customDraft } = await request.json();

    if (!ticketId || !customDraft) {
      return NextResponse.json({ error: 'Missing ticket ID or draft' }, { status: 400 });
    }

    // 2. Fetch the ticket details (we still need the customer's email and store info)
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('*, merchants(store_name, routing_email, agent_name)')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 3. Send the email using SendGrid, but use the CUSTOM DRAFT
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
      to: ticket.customer_email,
      from: {
        email: 'support@shopsift.app', // <-- MUST BE YOUR VERIFIED SENDGRID EMAIL
        name: `${ticket.merchants.agent_name} from ${ticket.merchants.store_name}`,
      },
      replyTo: ticket.merchants.routing_email, // If they reply, it routes back to Jimmy!
      subject: `Re: ${ticket.subject}`,
      text: customDraft, 
    };

    await sgMail.send(msg);
    // 4. Update the database: Mark it resolved AND save the final edited text
    const { error: updateError } = await supabaseAdmin
      .from('tickets')
      .update({ 
        status: 'resolved',
        ai_draft: customDraft // Overwrite the original AI draft with the human-approved version
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Failed to update ticket status:', updateError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}