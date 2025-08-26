import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FirestoreMatch, FirestoreTeam, FirestorePlayer, Match, Team, Player } from '@/lib/types/backend';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;

    if (!matchId) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Get match, teams, and players in parallel
    const [matchDoc, teamsSnapshot, playersSnapshot] = await Promise.all([
      adminDb.collection('matches').doc(matchId).get(),
      adminDb.collection('teams').where('matchId', '==', matchId).get(),
      adminDb.collection('players').where('matchId', '==', matchId).get()
    ]);

    if (!matchDoc.exists) {
      return NextResponse.json(
        { error: 'not_found', message: 'Match not found' },
        { status: 404 }
      );
    }

    const matchData = matchDoc.data() as FirestoreMatch;
    const teamsData = teamsSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestoreTeam);
    const playersData = playersSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestorePlayer);

    // Transform data to frontend format
    const teams: Team[] = teamsData
      .sort((a: FirestoreTeam, b: FirestoreTeam) => a.index - b.index) // Ensure team order (A=0, B=1)
      .map((team: FirestoreTeam) => {
        // Create array with teamSize slots, filled with players or undefined
        const players: (Player | undefined)[] = new Array(matchData.teamSize).fill(undefined);
        
        // Fill players in their correct slots
        playersData
          .filter((player: FirestorePlayer) => player.teamId === team.id)
          .forEach((player: FirestorePlayer) => {
            const slotIndex = player.slotNumber - 1; // Convert to 0-based index
            if (slotIndex >= 0 && slotIndex < matchData.teamSize) {
              const initials = player.name
                .split(' ')
                .map((part: string) => part[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);

              players[slotIndex] = {
                id: player.id,
                name: player.name,
                email: player.email,
                phone: player.phone,
                initials
              };
            }
          });

        return {
          id: team.id,
          name: team.name,
          players: players.filter((p): p is Player => p !== undefined) // Keep sparse array structure but typed correctly
        };
      });

    const match: Match = {
      id: matchData.id,
      title: matchData.title,
      date: matchData.dateISO,
      time: matchData.timeISO,
      location: matchData.location,
      teamSize: matchData.teamSize,
      teams,
      createdAt: matchData.createdAt
    };

    return NextResponse.json(match);

  } catch (error) {
    console.error('Error getting match:', error);
    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to retrieve match. Please try again.' 
      },
      { status: 500 }
    );
  }
}