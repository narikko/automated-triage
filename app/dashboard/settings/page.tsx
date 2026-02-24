'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { User, CreditCard, Settings as SettingsIcon, Globe, Lock, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [language, setLanguage] = useState('English');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingLang, setIsSavingLang] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const supabase = createClient();

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
        
        const { data } = await supabase
          .from('merchants')
          .select('store_name, response_language')
          .eq('id', user.id)
          .single();
          
        if (data) {
          if (data.store_name) setStoreName(data.store_name);
          if (data.response_language) setLanguage(data.response_language);
        }
      }
    }
    getUserData();
  }, [supabase]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleUpdateLanguage = async () => {
    setIsSavingLang(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('merchants')
        .update({ response_language: language })
        .eq('id', user.id);
        
      if (error) showMessage('Failed to update language.', 'error');
      else showMessage('Language preference updated!', 'success');
    }
    setIsSavingLang(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error');
      return;
    }
    
    setIsSavingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      showMessage(error.message, 'error');
    } else {
      showMessage('Password updated successfully!', 'success');
      setNewPassword(''); // Clear the field
    }
    setIsSavingPass(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600" />
          Settings
        </h1>
        {/* Global Toast Message */}
        {message.text && (
          <span className={`text-sm font-medium px-4 py-2 rounded-full ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </span>
        )}
      </header>

      <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
            <p className="text-sm text-gray-500 mb-4">Your current profile information.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium text-gray-700">
                  {email || 'Loading...'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Workspace Name</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium text-gray-700">
                  {storeName || 'Loading...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Language Preference */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-semibold text-gray-900">AI Output Language</h2>
            <p className="text-sm text-gray-500 mb-4">Choose the default language ShopSift should use when drafting replies to customers.</p>
            
            <div className="flex gap-4 items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 max-w-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-sans text-gray-800 transition-colors"
              >
                <option value="English">English</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="German">Deutsch (German)</option>
                <option value="Italian">Italiano (Italian)</option>
              </select>
              <button 
                onClick={handleUpdateLanguage}
                disabled={isSavingLang}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSavingLang ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Language'}
              </button>
            </div>
          </div>
        </div>

        {/* Security / Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500 mb-4">Update your password.</p>
            
            <div className="flex gap-4 items-center">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 max-w-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm font-sans text-gray-800 transition-colors"
              />
              <button 
                onClick={handleUpdatePassword}
                disabled={isSavingPass || !newPassword}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSavingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Billing Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 opacity-75">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Billing & Plan</h2>
            <p className="text-sm text-gray-500 mb-3">You are currently on the Early Access plan. Billing management and wallets will be available soon.</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Pro Tier (Beta)
            </span>
          </div>
        </div>

      </div>
    </>
  );
}