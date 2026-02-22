import { createClient } from '@supabase/supabase-js';
import ApproveButton from './ApproveButton';

// This tells Next.js NOT to cache this page, ensuring you always see fresh emails.
export const revalidate = 0; 

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardPage() {
  // Fetch tickets from the database, ordered by newest first
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading tickets. Check your database connection.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">ShopSift Triage</h1>
        
        <div className="space-y-6">
          {tickets?.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              
              {/* Header: Subject, Email, and Badges */}
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
                    ticket.status === 'triaged' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              {/* Body: Original Message vs AI Draft */}
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

          {/* Empty State */}
          {(!tickets || tickets.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              No tickets yet. Send an email to test the pipeline!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}