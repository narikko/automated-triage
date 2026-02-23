import Link from 'next/link';
import { ArrowRight, Sparkles, Inbox, Zap, ShieldCheck, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-xl tracking-tight text-gray-900">ShopSift</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hidden sm:block text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
              Create Workspace
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Now available in early access</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            Your customer inbox, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              sorted on autopilot.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            ShopSift reads your incoming support emails, categorizes the issue, and drafts the perfect reply based on your store's exact policies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 text-lg">
              Start Automating <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-xl border border-gray-200 transition-all shadow-sm text-lg">
              See How it Works
            </a>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How ShopSift saves you hours</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Stop typing the same refund policy over and over again. Let your smart triage desk do the heavy lifting.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-[#fafafa] border border-gray-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Triage</h3>
                <p className="text-gray-500 leading-relaxed">Every email is instantly read and tagged. Know exactly what needs your attention first.</p>
              </div>

              <div className="p-8 rounded-2xl bg-[#fafafa] border border-gray-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Policy-Aware Drafts</h3>
                <p className="text-gray-500 leading-relaxed">Our engine learns your specific shipping and return policies, drafting replies in your brand's unique voice.</p>
              </div>

              <div className="p-8 rounded-2xl bg-[#fafafa] border border-gray-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Human in the Loop</h3>
                <p className="text-gray-500 leading-relaxed">No rogue AI sending emails. You review, edit, and approve every single draft before it reaches your customer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-gray-500">Choose the plan that fits your store's volume.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="p-8 rounded-2xl bg-white border border-gray-200 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> 50 AI drafts per month</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> Basic triage tagging</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> 1 Support Agent</li>
                </ul>
                <Link href="/signup" className="w-full py-3 px-4 border border-gray-200 rounded-xl text-center font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="p-8 rounded-2xl bg-white border-2 border-indigo-600 flex flex-col relative">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">$49</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-indigo-500" /> Unlimited AI drafts</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-indigo-500" /> Advanced sentiment analysis</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-indigo-500" /> Priority support</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-indigo-500" /> Custom brand voice training</li>
                </ul>
                <Link href="/signup" className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl text-center font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                  Go Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">ShopSift</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/legal" className="hover:text-gray-900 transition-colors">Privacy & Terms</Link>
            {/* Updated from mailto to a proper internal link */}
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}