'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Container from '@/components/Container';
import TeamForm from '@/components/TeamForm';
import { type TeamForm as TeamFormType } from '@/lib/validations';
import { createMatch } from '@/lib/api-client';
import { toast } from 'sonner';
import { isAuthenticated } from '@/lib/auth-enhanced';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CreateTeamsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    const authenticated = isAuthenticated();
    setUserAuthenticated(authenticated);
    setAuthChecked(true);

    if (!authenticated) {
      return; // Don't proceed if not authenticated
    }

    // Then check for match data in session storage
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
    if (!userAuthenticated) {
      toast.error('Please log in as League Owner or Admin to create matches.');
      return;
    }

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

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Show authentication required if not authenticated
  if (!userAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-6">
                  You need to be logged in as a League Owner or Admin to create matches.
                </p>
                <div className="space-y-3">
                  <Link href="/admin/login">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Login as Admin or League Owner
                    </Button>
                  </Link>
                  <Link href="/admin/signup">
                    <Button variant="outline" className="w-full">
                      Sign up as League Owner
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading match data...</p>
          </div>
        </Container>
      </div>
    );
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