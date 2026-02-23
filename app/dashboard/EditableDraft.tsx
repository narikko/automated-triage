'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditableDraft({ ticketId, initialDraft }: { ticketId: string, initialDraft: string }) {
  // Store the draft in "state" so the user can edit it freely
  const [draft, setDraft] = useState(initialDraft);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleApproveAndSend = async () => {
    setIsSending(true);

    try {
      // Send the EDITED draft to your API, not just the ticket ID
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticketId: ticketId,
          customDraft: draft // This is the new, edited text!
        }),
      });

      if (response.ok) {
        // Refresh the page so the ticket moves to "resolved"
        router.refresh();
      } else {
        alert("Failed to send email. Check the console.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full min-h-[150px] p-3 text-sm text-gray-800 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
      <button 
        onClick={handleApproveAndSend}
        disabled={isSending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {isSending ? 'Sending...' : 'Approve & Send Reply'}
      </button>
    </div>
  );
}