import { createClient } from '../../utils/supabase/server';
import EditableDraft from './EditableDraft';
import Link from 'next/link';
import { Inbox, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

export const revalidate = 0; 

export default async function DashboardPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams?.tab || 'pending';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: merchant } = await supabase.from('merchants').select('id').eq('id', user.id).single();
  if (!merchant) return null;

  const { data: allTickets } = await supabase.from('tickets').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false });
  const tickets = allTickets || [];
  
  const pendingTickets = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const displayTickets = currentTab === 'resolved' ? resolvedTickets : pendingTickets;

  const categoryCounts = pendingTickets.reduce((acc, ticket) => {
    const cat = ticket.ai_category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let topCategory = 'None currently';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts) as [string, number][]) {
    if (count > maxCount) { topCategory = cat; maxCount = count; }
  }

  return (
    <>
      {/* HEADER */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-8 shrink-0 transition-colors">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Triage Desk</h1>
      </header>

      <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
        
        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Inbox className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Needs Attention</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTickets.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{resolvedTickets.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trending Issue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate w-32" title={topCategory}>{topCategory}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex space-x-6 border-b border-gray-200 dark:border-gray-800 mb-6">
          <Link href="/dashboard?tab=pending" className={`pb-3 text-sm font-medium border-b-2 transition-all ${
              currentTab !== 'resolved' ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
            Needs Attention ({pendingTickets.length})
          </Link>
          <Link href="/dashboard?tab=resolved" className={`pb-3 text-sm font-medium border-b-2 transition-all ${
              currentTab === 'resolved' ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
            Resolved ({resolvedTickets.length})
          </Link>
        </div>
        
        {/* TICKET FEED */}
        <div className="space-y-4">
          {displayTickets?.map((ticket) => (
            <div key={ticket.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {ticket.customer_email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{ticket.subject || 'No Subject'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.customer_email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-md border border-gray-200 dark:border-gray-700">
                    {ticket.ai_category || 'Uncategorized'}
                  </span>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Customer Message</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap border border-gray-100 dark:border-gray-800">
                    {ticket.original_message}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> ShopSift AI Draft
                  </h3>
                  <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-gray-900">
                    {ticket.status === 'resolved' ? (
                      <div className="p-4 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap bg-indigo-50/30 dark:bg-indigo-900/20 rounded-lg">
                        {ticket.ai_draft}
                      </div>
                    ) : ticket.ai_draft ? (
                      <div className="p-1">
                        {/* Make sure your EditableDraft component handles dark mode internally if needed! */}
                        <EditableDraft ticketId={ticket.id} initialDraft={ticket.ai_draft} />
                      </div>
                    ) : (
                      <p className="p-4 text-gray-500 dark:text-gray-400 text-sm italic animate-pulse">Processing AI draft...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!displayTickets || displayTickets.length === 0) && (
            <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed transition-colors">
              <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">You're all caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No tickets in this view.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}