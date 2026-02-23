import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';
import EditableDraft from './EditableDraft';
import Link from 'next/link';
import { LayoutDashboard, Inbox, CheckCircle2, Settings, Store, Sparkles, TrendingUp } from 'lucide-react';

export const revalidate = 0; 

export default async function DashboardPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams?.tab || 'pending';

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) redirect('/login');

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, store_name')
    .eq('id', user.id)
    .single();

  if (merchantError || !merchant) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">Error: No profile found.</div>;
  }

  // 1. Fetch ALL tickets for this merchant to calculate real stats
  const { data: allTickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  const tickets = allTickets || [];
  
  // 2. Do the math!
  const pendingTickets = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const displayTickets = currentTab === 'resolved' ? resolvedTickets : pendingTickets;

  // 3. Find the most common issue in the pending queue
  const categoryCounts = pendingTickets.reduce((acc, ticket) => {
    const cat = ticket.ai_category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let topCategory = 'None currently';
  let maxCount = 0;
  
  for (const [cat, count] of Object.entries(categoryCounts) as [string, number][]) {
    if (count > maxCount) {
      topCategory = cat;
      maxCount = count;
    }
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-gray-900">
      
      {/* Sleek Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-lg tracking-tight">ShopSift</span>
            </div>
          </div>
          
          <nav className="px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Workspace
            </div>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Triage Desk
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md text-sm font-medium transition-colors cursor-not-allowed opacity-60">
              <Store className="w-4 h-4" />
              Store Policies
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md text-sm font-medium transition-colors cursor-not-allowed opacity-60">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-gray-900 truncate">{merchant.store_name}</span>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 overflow-auto flex flex-col">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">Triage Desk</h1>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
          
          {/* NEW: Actionable Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Inbox className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Needs Attention</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTickets.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedTickets.length}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trending Issue</p>
                <p className="text-xl font-bold text-gray-900 capitalize truncate w-32" title={topCategory}>{topCategory}</p>
              </div>
            </div>
          </div>

          {/* Vercel-style Tabs */}
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            <Link href="/dashboard?tab=pending" className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                currentTab !== 'resolved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}>
              Needs Attention ({pendingTickets.length})
            </Link>
            <Link href="/dashboard?tab=resolved" className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                currentTab === 'resolved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}>
              Resolved ({resolvedTickets.length})
            </Link>
          </div>
          
          {/* Ticket Feed */}
          <div className="space-y-4">
            {displayTickets?.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {ticket.customer_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 leading-tight">{ticket.subject || 'No Subject'}</h2>
                      <p className="text-sm text-gray-500">{ticket.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md border border-gray-200">
                      {ticket.ai_category || 'Uncategorized'}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                      ticket.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Message</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                      {ticket.original_message}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> ShopSift AI Draft
                    </h3>
                    <div className="rounded-lg border border-indigo-100 bg-white">
                      {ticket.status === 'resolved' ? (
                        <div className="p-4 text-gray-700 text-sm whitespace-pre-wrap bg-indigo-50/30 rounded-lg">
                          {ticket.ai_draft}
                        </div>
                      ) : ticket.ai_draft ? (
                        <div className="p-1">
                          <EditableDraft ticketId={ticket.id} initialDraft={ticket.ai_draft} />
                        </div>
                      ) : (
                        <p className="p-4 text-gray-500 text-sm italic animate-pulse">Processing AI draft...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!displayTickets || displayTickets.length === 0) && (
              <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
                <p className="text-gray-500 text-sm mt-1">No tickets in this view.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}