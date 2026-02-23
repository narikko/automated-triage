import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import Link from 'next/link'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
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
      return redirect(`/login?error=${error.message}`)
    }
    
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to your triage desk.</p>
        </div>
        
        <div className="p-8">
          {/* Dynamic Error Banner */}
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
          
          <form action={signIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Email
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="owner@store.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" /> Password
              </label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl mt-4 transition-all shadow-md">
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick link to signup */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors">
              Create your workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}