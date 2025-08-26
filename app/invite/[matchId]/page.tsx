'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitePage() {
  const { matchId } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to match page
    if (matchId) {
      router.replace(`/match/${matchId}`);
    }
  }, [matchId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to match...</p>
      </div>
    </div>
  );
}