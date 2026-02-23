import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export default async function SignUpPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMessage = searchParams?.error;
  
  const signUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const storeName = formData.get('storeName') as string
    const agentName = formData.get('agentName') as string
    const routingPrefix = formData.get('routingPrefix') as string
    const storeContext = formData.get('storeContext') as string
    const routingEmail = `${routingPrefix.toLowerCase().trim()}@inbound.shopsift.app`

    const supabase = await createClient()

    // 1. Try to create the Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return redirect(`/signup?error=${authError?.message || 'Account creation failed'}`)
    }

    // 2. NEW: Create an Admin client to bypass RLS just for saving the initial profile
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Try to save the Store Profile using the Admin client
    const { error: insertError } = await supabaseAdmin
      .from('merchants')
      .insert([{
        id: authData.user.id,
        email: email,
        store_name: storeName,
        routing_email: routingEmail,
        agent_name: agentName,
        store_context: storeContext
      }])

    if (insertError) {
      return redirect(`/signup?error=${insertError.message || 'Profile creation failed'}`)
    }

    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Create your ShopSift Account</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Automate your customer support in seconds.</p>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        
        <form action={signUp} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login Email</label>
              <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 bg-white" placeholder="owner@store.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 bg-white" placeholder="••••••••" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" name="storeName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 bg-white" placeholder="e.g. Bob's Bikes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input type="text" name="agentName" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 bg-white" placeholder="e.g. Bob" />
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Routing Address</label>
            <div className="flex">
              <input type="text" name="routingPrefix" required className="w-1/3 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 text-right text-gray-900 placeholder-gray-400 bg-white" placeholder="bobsbikes" />
              <span className="w-2/3 px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                @inbound.shopsift.app
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">You will forward your customer emails to this address.</p>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Policies (The AI Brain)</label>
            <textarea 
              name="storeContext" 
              required 
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 bg-white" 
              placeholder="Explain your shipping times, return policies, and general tone here..."
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg mt-4 transition-colors">
            Sign Up & Launch Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}