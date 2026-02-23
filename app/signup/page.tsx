'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signUpUser } from './actions';
import { User, Store, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

function WizardForm() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const [step, setStep] = useState(1);

  const nextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Find the specific step container we are currently looking at
    const currentStepContainer = e.currentTarget.closest('.step-container');
    
    if (currentStepContainer) {
      // Grab only the inputs and selects inside THIS specific step
      const inputs = currentStepContainer.querySelectorAll('input, select');
      let isValid = true;

      for (const input of inputs) {
        const el = input as HTMLInputElement | HTMLSelectElement;
        if (!el.checkValidity()) {
          el.reportValidity(); 
          isValid = false;
          break; 
        }
      }

      // If any field on this step failed, stop them from moving forward
      if (!isValid) return; 
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  return (
    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">Welcome to ShopSift</h1>
          <p className="text-sm text-gray-500">Let's set up your AI support agent.</p>
        </div>
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      <div className="p-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <form action={signUpUser} className="space-y-6">
          
          {/* STEP 1: ACCOUNT */}
          {/* NEW: We use CSS 'hidden' instead of React conditional rendering */}
          <div className={`step-container space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <User className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Account Details</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login Email</label>
              <input type="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-colors" placeholder="owner@store.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-colors" placeholder="••••••••" />
            </div>
            <button onClick={nextStep} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl mt-6 transition-all shadow-md hover:shadow-lg">
              Continue to Store Info <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 2: STORE INFO */}
          <div className={`step-container space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <Store className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Brand Identity</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input type="text" name="storeName" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500" placeholder="e.g. Bob's Bikes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input type="text" name="agentName" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500" placeholder="e.g. Bob" />
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email Prefix</label>
              <div className="flex shadow-sm rounded-xl overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500">
                <input type="text" name="routingPrefix" required className="w-1/2 px-4 py-3 focus:outline-none text-right text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white" placeholder="bobsbikes" />
                <span className="w-1/2 px-4 py-3 bg-gray-100 border-l border-gray-300 text-gray-600 text-sm flex items-center">
                  @inbound.shopsift.app
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} className="w-1/3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={nextStep} className="w-2/3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                Set Store Policies <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 3: AI BRAIN */}
          <div className={`step-container space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 ${step === 3 ? 'block' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Support Policies</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What is your shipping policy?</label>
              <input type="text" name="shipping" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 text-sm" placeholder="e.g. We ship all orders within 24 hours via USPS." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What is your return policy?</label>
              <input type="text" name="returns" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 text-sm" placeholder="e.g. 30-day free returns. Customer prints label." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What tone should the AI use?</label>
              <select name="tone" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 focus:bg-white text-gray-900">
                <option value="Friendly, energetic, and uses emojis">Friendly & Energetic 🚀</option>
                <option value="Highly professional, concise, and formal">Professional & Formal 👔</option>
                <option value="Apologetic, highly empathetic, and warm">Empathetic & Warm ☕</option>
              </select>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="w-1/3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" className="w-2/3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                Launch Dashboard <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <Suspense fallback={<div className="text-gray-500">Loading wizard...</div>}>
        <WizardForm />
      </Suspense>
    </div>
  );
}