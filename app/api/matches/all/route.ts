import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FirestoreMatch, FirestoreTeam, FirestorePlayer, Match, Team, Player } from '@/lib/types/backend';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get all matches, teams, and players
    const [matchesSnapshot, teamsSnapshot, playersSnapshot] = await Promise.all([
      adminDb.collection('matches').orderBy('createdAt', 'desc').get(),
      adminDb.collection('teams').get(),
      adminDb.collection('players').get()
    ]);

    const matchesData = matchesSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestoreMatch);
    const teamsData = teamsSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestoreTeam);
    const playersData = playersSnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as FirestorePlayer);

    // Transform data to frontend format
    const matches: Match[] = matchesData.map((matchData: FirestoreMatch) => {
      // Find teams for this match
      const matchTeams = teamsData
        .filter((team: FirestoreTeam) => team.matchId === matchData.id)
        .sort((a: FirestoreTeam, b: FirestoreTeam) => a.index - b.index);

      // Transform teams with players
      const teams: Team[] = matchTeams.map((team: FirestoreTeam) => {
        // Get players for this team
        const teamPlayers = playersData
          .filter((player: FirestorePlayer) => player.matchId === matchData.id && player.teamId === team.id)
          .sort((a: FirestorePlayer, b: FirestorePlayer) => a.slotNumber - b.slotNumber);

        // Create player array with proper slot positions
        const players: Player[] = teamPlayers.map((player: FirestorePlayer) => {
          const initials = player.name
            .split(' ')
            .map((part: string) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          return {
            id: player.id,
            name: player.name,
            email: player.email,
            phone: player.phone,
            initials
          };
        });

        return {
          id: team.id,
          name: team.name,
          players
        };
      });

      return {
        id: matchData.id,
        title: matchData.title,
        date: matchData.dateISO,
        time: matchData.timeISO,
        location: matchData.location,
        teamSize: matchData.teamSize,
        teams,
        createdAt: matchData.createdAt
      };
    });

    return NextResponse.json({ matches });

  } catch (error) {
    console.error('Error getting all matches:', error);
    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to retrieve matches. Please try again.' 
      },
      { status: 500 }
    );
  }
}