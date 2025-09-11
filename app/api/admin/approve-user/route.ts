import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/auth-server';

interface ApproveUserRequest {
  userId: string;
  approve: boolean; // true to approve, false to reject
}

export async function POST(request: NextRequest) {
  try {
    // Verify Super Admin authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Only Super Admin can approve users
    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: 'Only Super Admin can approve League Owner accounts'
      }, { status: 403 });
    }

    const body: ApproveUserRequest = await request.json();
    const { userId, approve } = body;

    if (!userId || typeof approve !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'userId and approve (boolean) are required'
      }, { status: 400 });
    }

    // Get the user document
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Only approve League Owners
    if (userData?.role !== 'league_owner') {
      return NextResponse.json({
        success: false,
        message: 'Only League Owner accounts can be approved'
      }, { status: 400 });
    }

    // Update user status
    const updateData: any = {
      isActive: approve,
      updatedAt: new Date().toISOString(),
      updatedBy: authResult.user.id
    };

    if (approve) {
      updateData.approvedAt = new Date().toISOString();
      updateData.approvedBy = authResult.user.id;
    } else {
      updateData.rejectedAt = new Date().toISOString();
      updateData.rejectedBy = authResult.user.id;
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    await userRef.update(updateData);

    const action = approve ? 'approved' : 'rejected';
    console.log(`League Owner account ${action}: ${userData?.email} by ${authResult.user.email}`);

    return NextResponse.json({
      success: true,
      message: `League Owner account ${action} successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update user status. Please try again.'
    }, { status: 500 });
  }
}