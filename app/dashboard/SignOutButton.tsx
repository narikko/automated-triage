import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';

export default function SignOutButton() {
  // This Server Action runs securely on the backend
  const signOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut(); //
    redirect('/');
  };

  return (
    <form action={signOut}>
      <button 
        type="submit" 
        className="text-sm font-medium text-gray-500 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
}