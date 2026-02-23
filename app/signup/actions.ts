'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function signUpUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const storeName = formData.get('storeName') as string
  const agentName = formData.get('agentName') as string
  const routingPrefix = formData.get('routingPrefix') as string
  
  // We grab the friendly wizard answers and combine them into the AI "Brain" prompt
  const returns = formData.get('returns') as string
  const shipping = formData.get('shipping') as string
  const tone = formData.get('tone') as string
  const storeContext = `Shipping Policy: ${shipping}\nReturn Policy: ${returns}\nBrand Tone: ${tone}`
  
  const routingEmail = `${routingPrefix.toLowerCase().trim()}@inbound.shopsift.app`

  const supabase = await createClient()

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    redirect(`/signup?error=${authError?.message || 'Account creation failed'}`)
  }

  // 2. Admin Bypass to save the profile
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
    redirect(`/signup?error=${insertError.message || 'Profile creation failed'}`)
  }

  // 3. Success!
  redirect('/dashboard')
}