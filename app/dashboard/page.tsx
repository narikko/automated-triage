import { createClient } from '../../utils/supabase/server';
import EditableDraft from './EditableDraft';
import Link from 'next/link';
import { Inbox, CheckCircle2, Sparkles, TrendingUp, User, Bot, Send } from 'lucide-react';

export const revalidate = 0; 

export default async function DashboardPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams?.tab || 'pending';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: merchant } = await supabase.from('merchants').select('id').eq('id', user.id).single();
  if (!merchant) return null;

  // THE MAGIC QUERY: Notice how we are fetching *, plus the ticket_messages!
  const { data: allTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_messages (
        id,
        sender_type,
        body,
        created_at
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

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
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-8 shrink-0 transition-colors">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Triage Desk</h1>
      </header>

      <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
        
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
        
        {/* TICKET FEED - NOW A TIMELINE! */}
        <div className="space-y-8">
          {displayTickets?.map((ticket) => {
            // Sort messages chronologically (oldest at the top, newest at the bottom)
            const messages = ticket.ticket_messages?.sort((a: any, b: any) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ) || [];

            return (
              <div key={ticket.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors flex flex-col">
                
                {/* Header Strip */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {ticket.customer_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{ticket.subject || 'No Subject'}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.customer_email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700">
                    {ticket.ai_category || 'Uncategorized'}
                  </span>
                </div>

                {/* The Chat Timeline Area */}
                <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto bg-gray-50/30 dark:bg-gray-950/30">
                  {messages.map((msg: any) => {
                    const isCustomer = msg.sender_type === 'customer';
                    const isDraft = msg.sender_type === 'ai_draft';
                    
                    return (
                      <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                          isCustomer 
                            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm' 
                            : isDraft 
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200 rounded-tr-sm ring-1 ring-indigo-500/20'
                              : 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-sm' // Sent message
                        }`}>
                          
                          {/* Sender Badge */}
                          <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${isCustomer ? 'text-gray-400' : isDraft ? 'text-indigo-500' : 'text-indigo-200'}`}>
                            {isCustomer && <><User className="w-3.5 h-3.5"/> Customer</>}
                            {isDraft && <><Sparkles className="w-3.5 h-3.5"/> AI Draft</>}
                            {!isCustomer && !isDraft && <><Send className="w-3.5 h-3.5"/> Sent Message</>}
                          </div>
                          
                          {/* Message Body OR Editable Component */}
                          {isDraft && ticket.status !== 'resolved' ? (
                            <div className="mt-2">
                              {/* We pass the initial draft to your existing component */}
                              <EditableDraft ticketId={ticket.id} messageId={msg.id} initialDraft={msg.body} />
                            </div>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</div>
                          )}
                          
                        </div>
                      </div>
                    );
                  })}

                  {messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-10 opacity-50">
                       <Bot className="w-8 h-8 mb-2" />
                       <p className="text-sm italic">Waiting for incoming messages...</p>
                     </div>
                  )}
                </div>
              </div>
            );
          })}

          {(!displayTickets || displayTickets.length === 0) && (
            <div className="flex flex-col justify-center items-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed transition-colors">
              <CheckCircle2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Inbox Zero</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">No tickets in this view right now.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}