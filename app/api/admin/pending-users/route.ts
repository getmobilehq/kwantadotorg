import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Verify Super Admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Only Super Admin can view pending users
    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: 'Only Super Admin can view pending League Owner accounts'
      }, { status: 403 });
    }

    // Get all pending League Owner accounts
    const pendingUsersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'league_owner')
      .where('isActive', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const pendingUsers = pendingUsersSnapshot.docs.map(doc => {
      const userData = doc.data();
      // Remove sensitive information
      const { password, ...safeUserData } = userData;
      return {
        ...safeUserData,
        id: doc.id
      };
    });

    return NextResponse.json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pending users. Please try again.'
    }, { status: 500 });
  }
}