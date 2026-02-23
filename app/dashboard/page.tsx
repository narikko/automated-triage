import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import ApproveButton from './ApproveButton';
import SignOutButton from './SignOutButton';

// Ensures Next.js doesn't cache stale data
export const revalidate = 0; 

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. SECURE THE ROUTE: Check if the user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser(); //
  
  if (authError || !user) {
    // If they aren't logged in, kick them back to the login screen
    redirect('/login');
  }

  // 2. IDENTIFY THE TENANT: Get the specific merchant profile for this user
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, store_name')
    .eq('id', user.id)
    .single();

  if (merchantError || !merchant) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center text-red-500">
        Error: No merchant profile linked to this account.
      </div>
    );
  }

  // 3. FETCH ISOLATED DATA: Get only the tickets for this specific merchant
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  if (ticketsError) {
    return <div className="p-8 text-red-500">Error loading tickets.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Dynamic Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{merchant.store_name} Triage</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
              Logged in as {user.email}
            </div>
            <SignOutButton />
          </div>
          
        </div>
        
        <div className="space-y-6">
          {tickets?.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{ticket.subject || 'No Subject'}</h2>
                  <p className="text-sm text-gray-500">{ticket.customer_email}</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {ticket.ai_category || 'Uncategorized'}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Original Message</h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{ticket.original_message}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-900 mb-2">AI Draft Reply</h3>
                  <p className="text-indigo-800 text-sm whitespace-pre-wrap">{ticket.ai_draft || 'Processing...'}</p>
                  
                  {ticket.status !== 'resolved' && ticket.ai_draft && (
                    <ApproveButton ticketId={ticket.id} />
                  )}
                </div>
              </div>

            </div>
          ))}

          {(!tickets || tickets.length === 0) && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              No tickets yet. You are all caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}