import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { leaveSlotSchema } from '@/lib/validation/backend-validation';
import { FirestorePlayer } from '@/lib/types/backend';
import type { Transaction } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = leaveSlotSchema.safeParse(body);
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

    const { matchId, teamId, slotNumber, emailOrPhone } = validationResult.data;

    // Find and remove the player in a transaction for consistency
    const result = await adminDb.runTransaction(async (transaction: Transaction) => {
      // Find the player in the specific slot
      const playerQuery = adminDb
        .collection('players')
        .where('matchId', '==', matchId)
        .where('teamId', '==', teamId)
        .where('slotNumber', '==', slotNumber);
      
      const playerSnapshot = await transaction.get(playerQuery);
      
      if (playerSnapshot.empty) {
        throw new Error('PLAYER_NOT_FOUND');
      }

      const playerDoc = playerSnapshot.docs[0];
      const playerData = playerDoc.data() as FirestorePlayer;

      // Verify the contact info matches (simple auth check)
      // Allow either email or phone to match for flexibility
      const contactMatches = 
        (playerData.email && playerData.email === emailOrPhone) ||
        (playerData.phone && playerData.phone === emailOrPhone);

      if (!contactMatches) {
        throw new Error('CONTACT_MISMATCH');
      }

      // Delete the player document
      transaction.delete(playerDoc.ref);
      
      return { success: true, playerId: playerData.id, playerName: playerData.name };
    });

    console.log(`Slot released: ${matchId}/${teamId}/${slotNumber}`, { 
      playerId: result.playerId, 
      playerName: result.playerName,
      contact: emailOrPhone 
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error('Error leaving slot:', error);

    // Handle specific transaction errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'PLAYER_NOT_FOUND':
          return NextResponse.json(
            { error: 'not_found', message: 'No player found in this slot' },
            { status: 404 }
          );
        
        case 'CONTACT_MISMATCH':
          return NextResponse.json(
            { error: 'unauthorized', message: 'Contact information does not match the registered player' },
            { status: 403 }
          );
      }
    }

    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: 'Failed to leave slot. Please try again.' 
      },
      { status: 500 }
    );
  }
}