import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';
import EditableDraft from './EditableDraft';
import Link from 'next/link';

export const revalidate = 0; 

// 1. Accept searchParams to know which tab we are on
export default async function DashboardPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams?.tab || 'pending'; // Default to pending

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

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

  // 2. Filter the database query based on the active tab
  let query = supabase
    .from('tickets')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  if (currentTab === 'resolved') {
    query = query.eq('status', 'resolved');
  } else {
    query = query.neq('status', 'resolved'); // Show everything else in pending
  }

  const { data: tickets, error: ticketsError } = await query;

  if (ticketsError) {
    return <div className="p-8 text-red-500">Error loading tickets.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Dynamic Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{merchant.store_name} Triage</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
              Logged in as {user.email}
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* 3. The Tabs Navigation UI */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          <Link 
            href="/dashboard?tab=pending" 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentTab !== 'resolved' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Needs Attention
          </Link>
          <Link 
            href="/dashboard?tab=resolved" 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentTab === 'resolved' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resolved
          </Link>
        </div>
        
        {/* Tickets Feed */}
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
                  
                  {ticket.status === 'resolved' ? (
                    <p className="text-indigo-800 text-sm whitespace-pre-wrap">{ticket.ai_draft}</p>
                  ) : ticket.ai_draft ? (
                    <EditableDraft ticketId={ticket.id} initialDraft={ticket.ai_draft} />
                  ) : (
                    <p className="text-indigo-800 text-sm italic">Processing AI draft...</p>
                  )}
                  
                </div>
              </div>

            </div>
          ))}

          {/* Empty States */}
          {(!tickets || tickets.length === 0) && currentTab !== 'resolved' && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              🎉 Inbox zero! No pending tickets.
            </div>
          )}
          
          {(!tickets || tickets.length === 0) && currentTab === 'resolved' && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
              No resolved tickets yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}