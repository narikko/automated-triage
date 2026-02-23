import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto text-gray-800">
      <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-8 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-6">Legal Information</h1>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
        <p className="text-gray-600">At ShopSift, we take your data seriously. We only access the email data necessary to provide triage and drafting services for your store.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
        <p className="text-gray-600">By using ShopSift, you agree to use our AI-generated drafts responsibly. Always review AI suggestions before sending to customers.</p>
      </section>
      
      <p className="mt-12 text-sm text-gray-400 italic">Last updated: February 2026</p>
    </div>
  );
}