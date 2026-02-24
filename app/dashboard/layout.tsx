import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';
import Link from 'next/link';
import { LayoutDashboard, Settings, Store, Sparkles } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) redirect('/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, store_name')
    .eq('id', user.id)
    .single();

  if (!merchant) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">Error: No profile found.</div>;
  }

  return (
    // NEW: Added dark:bg-[#0a0a0a] to the main background!
    <div className="flex h-screen bg-[#fafafa] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Sleek Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0 transition-colors duration-200">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 mb-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-lg tracking-tight">ShopSift</span>
            </div>
          </div>
          
          <nav className="px-3 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Workspace
            </div>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Triage Desk
            </Link>
            <Link href="/dashboard/policies" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Store className="w-4 h-4" />
              Store Policies
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{merchant.store_name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 overflow-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}