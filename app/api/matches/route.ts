import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createMatchSchema } from '@/lib/validation/backend-validation';
import { FirestoreMatch, FirestoreTeam } from '@/lib/types/backend';
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt-utils';
import type { Transaction } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - require admin or league owner access
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    let currentUser = null;

    if (token) {
      // Check if it's a legacy super admin token
      if (token.startsWith('legacy_')) {
        try {
          const legacyToken = token.substring(7); // Remove 'legacy_' prefix
          const decoded = JSON.parse(atob(legacyToken));
          if (decoded.role === 'super_admin' && decoded.exp > Date.now()) {
            currentUser = {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role
            };
          }
        } catch (error) {
          // Invalid legacy token
        }
      } else {
        // Regular JWT token
        currentUser = verifyJWT(token);
      }
    }

    // Require authentication for match creation
    if (!currentUser) {
      return NextResponse.json(
        { 
          error: 'unauthorized', 
          message: 'Authentication required. Please log in as League Owner or Admin to create matches.' 
        },
        { status: 401 }
      );
    }

    // Only allow super admin or league owners to create matches
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'league_owner') {
      return NextResponse.json(
        { 
          error: 'forbidden', 
          message: 'Insufficient permissions. Only League Owners and Admins can create matches.' 
        },
        { status: 403 }
      );
    }

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
    
    // Add ownership information if authenticated user
    if (currentUser && currentUser.role === 'league_owner') {
      matchData.ownerId = currentUser.userId;
      matchData.ownerEmail = currentUser.email;
    }
    
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
    await adminDb.runTransaction(async (transaction: Transaction) => {
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