'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Container from '@/components/Container';
import TeamForm from '@/components/TeamForm';
import { type TeamForm as TeamFormType } from '@/lib/validations';
import { createMatch } from '@/lib/api-client';
import { toast } from 'sonner';

export default function CreateTeamsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('matchData');
    if (!stored) {
      router.push('/create');
      return;
    }
    
    try {
      const parsed = JSON.parse(stored);
      setMatchData(parsed);
    } catch (error) {
      console.error('Failed to parse match data from session storage:', error);
      sessionStorage.removeItem('matchData');
      router.push('/create');
    }
  }, [router]);

  const handleSubmit = async (data: TeamFormType) => {
    if (!matchData) return;
    
    setIsLoading(true);
    
    try {
      // Now create the match with teams in one API call
      const matchId = await createMatch(matchData, data);
      
      // Clear session storage
      sessionStorage.removeItem('matchData');
      
      toast.success('Match created successfully!');
      router.push(`/match/${matchId}`);
    } catch (error) {
      toast.error('Failed to create match. Please try again.');
      console.error('Error creating match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!matchData) {
    return null; // Or loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      <Container className="py-12">
        <TeamForm 
          onSubmit={handleSubmit} 
          matchDetails={matchData}
          isLoading={isLoading}
        />
      </Container>
    </div>
  );
}