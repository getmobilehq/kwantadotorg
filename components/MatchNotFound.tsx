'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MatchNotFound() {
  return (
    <Alert className="max-w-md mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Match not found or has been deleted.
      </AlertDescription>
    </Alert>
  );
}