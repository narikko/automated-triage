import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 mb-8 hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get in touch</h1>
          <p className="text-gray-500 mb-10">Have questions about ShopSift? We're here to help you automate your support desk.</p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email us</h3>
                <p className="text-sm text-gray-500 mb-2">For support or enterprise inquiries.</p>
                <a href="mailto:hello@shopsift.app" className="text-indigo-600 font-medium hover:underline">
                  hello@shopsift.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Response time</h3>
                <p className="text-sm text-gray-500">
                  We typically respond within 2 hours during business hours (EST).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Are you an existing customer? <br />
              <Link href="/login" className="text-indigo-600 hover:underline">Sign in to your dashboard</Link> for priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}