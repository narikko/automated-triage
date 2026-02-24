'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Save, Loader2, BookOpen, Truck, RotateCcw, Wand2 } from 'lucide-react';

export default function PoliciesPage() {
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [brandTone, setBrandTone] = useState('Friendly & Energetic 🚀');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function loadPolicies() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('merchants')
          .select('store_context')
          .eq('id', user.id)
          .single();
        
        if (data?.store_context) {
          const text = data.store_context;
          if (text.includes('Shipping Policy:') && text.includes('Return Policy:') && text.includes('Brand Tone:')) {
            setShippingPolicy(text.substring(text.indexOf('Shipping Policy:') + 16, text.indexOf('\nReturn Policy:')).trim());
            setReturnPolicy(text.substring(text.indexOf('Return Policy:') + 14, text.indexOf('\nBrand Tone:')).trim());
            setBrandTone(text.substring(text.indexOf('Brand Tone:') + 11).trim());
          } else {
            setShippingPolicy(text);
          }
        }
      }
      setIsLoading(false);
    }
    loadPolicies();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    const combinedContext = `Shipping Policy: ${shippingPolicy}\nReturn Policy: ${returnPolicy}\nBrand Tone: ${brandTone}`;
    
    if (user) {
      const { error } = await supabase.from('merchants').update({ store_context: combinedContext }).eq('id', user.id);
      if (!error) {
        setSaveMessage('Policies saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000); 
      } else {
        setSaveMessage('Error saving policies.');
      }
    }
    setIsSaving(false);
  };

  return (
    <>
      {/* HEADER: Added dark:bg-gray-900 and dark:border-gray-800 */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-8 shrink-0 transition-colors">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Store Policies
        </h1>
      </header>

      <div className="p-8 max-w-3xl w-full mx-auto">
        <div className="mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            Keep your AI up to date. Update your shipping, returns, and brand tone below so ShopSift knows exactly how to draft your replies.
          </p>
        </div>

        {/* MAIN CARD: Added dark:bg-gray-900 and dark:border-gray-800 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="p-8">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Shipping Policy */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                    <Truck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> What is your shipping policy?
                  </label>
                  <textarea
                    value={shippingPolicy}
                    onChange={(e) => setShippingPolicy(e.target.value)}
                    className="w-full h-24 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-600 text-sm text-gray-800 dark:text-gray-200 transition-colors resize-none"
                  />
                </div>

                {/* Return Policy */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                    <RotateCcw className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> What is your return policy?
                  </label>
                  <textarea
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    className="w-full h-24 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-600 text-sm text-gray-800 dark:text-gray-200 transition-colors resize-none"
                  />
                </div>

                {/* Brand Tone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                    <Wand2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> What tone should the AI use?
                  </label>
                  <select
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-600 text-sm text-gray-800 dark:text-gray-200 transition-colors appearance-none"
                  >
                    <option value="Friendly & Energetic 🚀">Friendly & Energetic 🚀</option>
                    <option value="Professional & Formal 👔">Professional & Formal 👔</option>
                    <option value="Empathetic & Warm ☕">Empathetic & Warm ☕</option>
                  </select>
                </div>

              </div>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-5 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className={`text-sm font-medium transition-opacity ${saveMessage ? 'opacity-100' : 'opacity-0'} ${saveMessage.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {saveMessage}
            </span>
            <button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Policies
            </button>
          </div>
        </div>
      </div>
    </>
  );
}