import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { claimSlotSchema, validateSlotNumber, parseContactInfo } from '@/lib/validation/backend-validation';
import { FirestoreMatch, FirestoreTeam, FirestorePlayer } from '@/lib/types/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = claimSlotSchema.safeParse(body);
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

    const { matchId, teamId, slotNumber, name, emailOrPhone } = validationResult.data;
    const contactInfo = parseContactInfo(emailOrPhone);

    // Race-safe slot claiming using Firestore transaction
    const result = await adminDb.runTransaction(async (transaction) => {
      // 1. Verify match exists and is open
      const matchRef = adminDb.collection('matches').doc(matchId);
      const matchDoc = await transaction.get(matchRef);
      
      if (!matchDoc.exists) {
        throw new Error('MATCH_NOT_FOUND');
      }

      const matchData = matchDoc.data() as FirestoreMatch;
      if (matchData.status !== 'open') {
        throw new Error('MATCH_CLOSED');
      }

      // 2. Verify team exists and slot number is valid
      const teamRef = adminDb.collection('teams').doc(teamId);
      const teamDoc = await transaction.get(teamRef);
      
      if (!teamDoc.exists) {
        throw new Error('TEAM_NOT_FOUND');
      }

      const teamData = teamDoc.data() as FirestoreTeam;
      if (teamData.matchId !== matchId) {
        throw new Error('TEAM_MATCH_MISMATCH');
      }

      if (!validateSlotNumber(slotNumber, matchData.teamSize)) {
        throw new Error('INVALID_SLOT_NUMBER');
      }

      // 3. Check if slot is already taken (race-safe check)
      const existingPlayerQuery = adminDb
        .collection('players')
        .where('matchId', '==', matchId)
        .where('teamId', '==', teamId)
        .where('slotNumber', '==', slotNumber);
      
      const existingPlayerSnapshot = await transaction.get(existingPlayerQuery);
      
      if (!existingPlayerSnapshot.empty) {
        throw new Error('SLOT_TAKEN');
      }

      // 4. Create the player document (atomic operation)
      const playerRef = adminDb.collection('players').doc();
      const playerData: any = {
        id: playerRef.id,
        matchId,
        teamId,
        slotNumber,
        name,
        createdAt: new Date().toISOString()
      };
      
      // Only add email/phone if provided
      if (contactInfo.email) {
        playerData.email = contactInfo.email;
      }
      if (contactInfo.phone) {
        playerData.phone = contactInfo.phone;
      }

      transaction.set(playerRef, playerData);
      
      return { success: true, playerId: playerRef.id };
    });

    console.log(`Slot claimed: ${matchId}/${teamId}/${slotNumber}`, { name, contact: emailOrPhone });

    return NextResponse.json({ ok: true, playerId: result.playerId }, { status: 201 });

  } catch (error) {
    console.error('Error claiming slot:', error);

    // Handle specific transaction errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'MATCH_NOT_FOUND':
          return NextResponse.json(
            { error: 'not_found', message: 'Match not found' },
            { status: 404 }
          );
        
        case 'MATCH_CLOSED':
          return NextResponse.json(
            { error: 'match_closed', message: 'This match is no longer accepting new players' },
            { status: 409 }
          );
        
        case 'TEAM_NOT_FOUND':
          return NextResponse.json(
            { error: 'not_found', message: 'Team not found' },
            { status: 404 }
          );
        
        case 'TEAM_MATCH_MISMATCH':
          return NextResponse.json(
            { error: 'invalid_request', message: 'Team does not belong to this match' },
            { status: 400 }
          );
        
        case 'INVALID_SLOT_NUMBER':
          return NextResponse.json(
            { error: 'invalid_slot', message: 'Slot number is invalid for this team size' },
            { status: 400 }
          );
        
        case 'SLOT_TAKEN':
          return NextResponse.json(
            { error: 'slot_taken', message: 'That slot was just taken—pick another.' },
            { status: 409 }
          );
      }
    }

    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to claim slot. Please try again.' 
      },
      { status: 500 }
    );
  }
}