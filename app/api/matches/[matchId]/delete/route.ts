import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function DELETE(
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

    // Use a transaction to delete match and all related data atomically
    await adminDb.runTransaction(async (transaction) => {
      // 1. Check if match exists
      const matchRef = adminDb.collection('matches').doc(matchId);
      const matchDoc = await transaction.get(matchRef);
      
      if (!matchDoc.exists) {
        throw new Error('MATCH_NOT_FOUND');
      }

      // 2. Get all teams for this match
      const teamsSnapshot = await adminDb
        .collection('teams')
        .where('matchId', '==', matchId)
        .get();

      // 3. Get all players for this match
      const playersSnapshot = await adminDb
        .collection('players')
        .where('matchId', '==', matchId)
        .get();

      // 4. Delete all players
      playersSnapshot.docs.forEach(doc => {
        transaction.delete(doc.ref);
      });

      // 5. Delete all teams
      teamsSnapshot.docs.forEach(doc => {
        transaction.delete(doc.ref);
      });

      // 6. Delete the match
      transaction.delete(matchRef);

      console.log(`Match deleted: ${matchId} with ${teamsSnapshot.size} teams and ${playersSnapshot.size} players`);
    });

    return NextResponse.json(
      { message: 'Match deleted successfully', matchId },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting match:', error);

    if (error instanceof Error && error.message === 'MATCH_NOT_FOUND') {
      return NextResponse.json(
        { error: 'not_found', message: 'Match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to delete match. Please try again.' 
      },
      { status: 500 }
    );
  }
}