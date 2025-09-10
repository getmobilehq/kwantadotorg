'use client';

import { useState, useEffect } from 'react';
import FieldView from '@/components/FieldView';
import RegistrationModal from '@/components/RegistrationModal';
import CopyInviteButton from '@/components/CopyInviteButton';
import { claimSlot, leaveSlot, type Match } from '@/lib/api-client';
import { type RegistrationForm } from '@/lib/validations';
import { toast } from 'sonner';

interface MatchClientPageProps {
  initialMatch: Match;
  matchId: string;
}

export default function MatchClientPage({ initialMatch, matchId }: MatchClientPageProps) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [registrationModal, setRegistrationModal] = useState<{
    isOpen: boolean;
    teamId: string;
    slotIndex: number;
    teamName: string;
    teamColor: 'emerald' | 'blue';
  }>({
    isOpen: false,
    teamId: '',
    slotIndex: 0,
    teamName: '',
    teamColor: 'emerald',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlotClick = async (teamId: string, slotIndex: number) => {
    if (!match) return;

    const team = match.teams.find(t => t.id === teamId);
    if (!team) return;

    const existingPlayer = team.players[slotIndex];
    
    if (existingPlayer) {
      // Confirm removal
      const confirmed = window.confirm(
        `Remove ${existingPlayer.name} from this slot?`
      );
      
      if (confirmed) {
        try {
          await leaveSlot(matchId, teamId, slotIndex);
          
          // Refresh match data from server to ensure consistency
          const response = await fetch(`/api/matches/${matchId}`);
          if (response.ok) {
            const refreshedMatch = await response.json();
            setMatch(refreshedMatch);
          }
          
          toast.success('Slot is now available!');
        } catch (err: any) {
          toast.error(err.message || 'Failed to leave slot');
        }
      }
    } else {
      // Open registration modal
      setRegistrationModal({
        isOpen: true,
        teamId,
        slotIndex,
        teamName: team.name,
        teamColor: teamId === 'team-a' ? 'emerald' : 'blue',
      });
    }
  };

  const handleRegistration = async (data: RegistrationForm) => {
    if (!match) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to claim slot
      const updatedMatch = await claimSlot(
        matchId, 
        registrationModal.teamId,
        registrationModal.slotIndex,
        {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
        }
      );
      
      // Update local state with the server response
      // This ensures we have the latest data and handles race conditions
      if (updatedMatch) {
        setMatch(updatedMatch);
      }
      
      setRegistrationModal(prev => ({ ...prev, isOpen: false }));
      toast.success(`Welcome to ${registrationModal.teamName}!`);
    } catch (err: any) {
      // Check if the error has occupying player information
      if (err.errorData?.error === 'slot_taken' && err.errorData?.occupyingPlayer) {
        const { initials, name } = err.errorData.occupyingPlayer;
        
        // Refresh the match data to show current state immediately
        try {
          const response = await fetch(`/api/matches/${matchId}`);
          if (response.ok) {
            const refreshedMatch = await response.json();
            setMatch(refreshedMatch);
          }
        } catch (refreshError) {
          console.error('Failed to refresh match data:', refreshError);
        }
        
        toast.error(`This slot is taken by ${name} (${initials}). Please choose a different slot.`);
      } else if (err.message?.includes('already taken') || err.message?.includes('occupied') || err.message?.includes('taken')) {
        // Fallback for generic slot taken errors
        try {
          const response = await fetch(`/api/matches/${matchId}`);
          if (response.ok) {
            const refreshedMatch = await response.json();
            setMatch(refreshedMatch);
          }
        } catch (refreshError) {
          console.error('Failed to refresh match data:', refreshError);
        }
        toast.error('This slot was just taken by another player. Please choose a different slot.');
      } else {
        toast.error(err.message || 'Failed to claim slot');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex justify-center mb-8">
        <CopyInviteButton matchId={matchId} />
      </div>

      {/* Field View */}
      <FieldView match={match} onSlotClick={handleSlotClick} />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={registrationModal.isOpen}
        onClose={() => setRegistrationModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleRegistration}
        teamName={registrationModal.teamName}
        teamColor={registrationModal.teamColor}
        isLoading={isSubmitting}
      />
    </div>
  );
}