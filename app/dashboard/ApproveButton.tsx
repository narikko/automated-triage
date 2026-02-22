"use client"; // This tells Next.js this part runs in the browser

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ ticketId }: { ticketId: string }) {
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });

      if (res.ok) {
        // Refresh the page to show the updated "resolved" status
        router.refresh(); 
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={isSending}
      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
    >
      {isSending ? "Sending..." : "Approve & Send Reply"}
    </button>
  );
}