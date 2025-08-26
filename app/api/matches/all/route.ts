import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FirestoreMatch, FirestoreTeam, FirestorePlayer, Match, Team, Player } from '@/lib/types/backend';

export async function GET(request: NextRequest) {
  try {
    // Get all matches, teams, and players
    const [matchesSnapshot, teamsSnapshot, playersSnapshot] = await Promise.all([
      adminDb.collection('matches').orderBy('createdAt', 'desc').get(),
      adminDb.collection('teams').get(),
      adminDb.collection('players').get()
    ]);

    const matchesData = matchesSnapshot.docs.map(doc => doc.data() as FirestoreMatch);
    const teamsData = teamsSnapshot.docs.map(doc => doc.data() as FirestoreTeam);
    const playersData = playersSnapshot.docs.map(doc => doc.data() as FirestorePlayer);

    // Transform data to frontend format
    const matches: Match[] = matchesData.map(matchData => {
      // Find teams for this match
      const matchTeams = teamsData
        .filter(team => team.matchId === matchData.id)
        .sort((a, b) => a.index - b.index);

      // Transform teams with players
      const teams: Team[] = matchTeams.map(team => {
        // Get players for this team
        const teamPlayers = playersData
          .filter(player => player.matchId === matchData.id && player.teamId === team.id)
          .sort((a, b) => a.slotNumber - b.slotNumber);

        // Create player array with proper slot positions
        const players: Player[] = teamPlayers.map(player => {
          const initials = player.name
            .split(' ')
            .map(part => part[0])
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