'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Container from '@/components/Container';
import MatchForm from '@/components/MatchForm';
import { type MatchForm as MatchFormType } from '@/lib/validations';
import { createMatch } from '@/lib/api-client';
import { toast } from 'sonner';

export default function CreateMatchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: MatchFormType) => {
    setIsLoading(true);
    
    try {
      // Store match data in sessionStorage for the team names step
      sessionStorage.setItem('matchData', JSON.stringify(data));
      
      router.push('/create/teams');
    } catch (error) {
      toast.error('Failed to prepare match creation. Please try again.');
      console.error('Error storing match data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      <Container className="py-12">
        <MatchForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Container>
    </div>
  );
}