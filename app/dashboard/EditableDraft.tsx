'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Send, Save, Loader2 } from 'lucide-react';

export default function EditableDraft({ 
  ticketId, 
  messageId, 
  initialDraft 
}: { 
  ticketId: string; 
  messageId: string; 
  initialDraft: string; 
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    // 1. Update the specific message bubble in the new table
    await supabase
      .from('ticket_messages')
      .update({ body: draft })
      .eq('id', messageId);
      
    setIsSaving(false);
    router.refresh();
  };

  const handleApproveAndSend = async () => {
    setIsSending(true);
    
    // 1. Update the text AND change the sender_type so the UI bubble flips colors
    await supabase
      .from('ticket_messages')
      .update({ 
        body: draft,
        sender_type: 'merchant' 
      })
      .eq('id', messageId);

    // 2. Mark the overarching ticket as resolved
    await supabase
      .from('tickets')
      .update({ status: 'resolved' })
      .eq('id', ticketId);

    // 3. (KEEP YOUR EXISTING SENDGRID/EMAIL LOGIC HERE!)
    // await fetch('/api/send-email', { ... })

    setIsSending(false);
    router.refresh(); // This forces the UI to move the ticket to the "Resolved" tab
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full min-h-[150px] p-4 text-sm bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 dark:text-gray-200 resize-y transition-colors shadow-inner"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || isSending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Edits
        </button>
        <button
          onClick={handleApproveAndSend}
          disabled={isSaving || isSending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Approve & Send
        </button>
      </div>
    </div>
  );
}