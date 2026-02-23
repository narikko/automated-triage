import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  // Await the URL parameters to catch specific errors
  const searchParams = await props.searchParams;
  const errorMessage = searchParams?.error;
  
  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Pass the EXACT error message to the URL
      return redirect(`/login?error=${error.message}`)
    }
    
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Log in to ShopSift</h1>
        
        {/* NEW: Dynamic Error Banner */}
        {errorMessage && errorMessage !== 'true' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            <strong>Login Failed:</strong> {errorMessage}
          </div>
        )}
        {errorMessage === 'true' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            <strong>Login Failed:</strong> Invalid email or password.
          </div>
        )}
        
        <form action={signIn} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
              placeholder="owner@store.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 placeholder-gray-400 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mt-2 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}