'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyInviteButtonProps {
  matchId: string;
}

export default function CopyInviteButton({ matchId }: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/match/${matchId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Invite link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Button
      onClick={copyToClipboard}
      variant="outline"
      className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Copy Invite Link
        </>
      )}
    </Button>
  );
}