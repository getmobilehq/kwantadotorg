import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createMatchSchema } from '@/lib/validation/backend-validation';
import { FirestoreMatch, FirestoreTeam } from '@/lib/types/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = createMatchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'validation_error', 
          message: validationResult.error.issues[0].message,
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { title, dateISO, timeISO, location, teamSize, teamAName, teamBName, organizerContact } = validationResult.data;

    // Generate unique match ID
    const matchRef = adminDb.collection('matches').doc();
    const matchId = matchRef.id;

    // Create match document (filter out undefined values)
    const matchData: any = {
      id: matchId,
      title,
      dateISO,
      timeISO,
      location,
      teamSize,
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    
    // Only add organizerContact if provided
    if (organizerContact) {
      matchData.createdBy = organizerContact;
    }

    // Create team documents
    const teamAData: FirestoreTeam = {
      id: `${matchId}_team_a`,
      matchId,
      name: teamAName,
      index: 0
    };

    const teamBData: FirestoreTeam = {
      id: `${matchId}_team_b`,
      matchId,
      name: teamBName,
      index: 1
    };

    // Use transaction to create match and teams atomically
    await adminDb.runTransaction(async (transaction) => {
      const matchRef = adminDb.collection('matches').doc(matchId);
      const teamARef = adminDb.collection('teams').doc(teamAData.id);
      const teamBRef = adminDb.collection('teams').doc(teamBData.id);

      transaction.set(matchRef, matchData);
      transaction.set(teamARef, teamAData);
      transaction.set(teamBRef, teamBData);
    });

    console.log(`Match created: ${matchId}`, { title, teamSize, location });

    return NextResponse.json({ matchId }, { status: 201 });

  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to create match. Please try again.' 
      },
      { status: 500 }
    );
  }
}