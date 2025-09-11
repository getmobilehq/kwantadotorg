import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuthToken } from '@/lib/auth-server';
import { hashPassword } from '@/lib/password-utils';

interface CreateSuperAdminRequest {
  name: string;
  email: string;
  password: string;
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

    // ONLY Super Admin can create other Super Admins
    if (authResult.user.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: 'Only Super Admin can create other Super Admin accounts'
      }, { status: 403 });
    }

    const body: CreateSuperAdminRequest = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, and password are required'
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long for Super Admin accounts'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUserSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingUserSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 409 });
    }

    // Create new Super Admin
    const userRef = adminDb.collection('users').doc();
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      id: userRef.id,
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'super_admin' as const,
      createdAt: new Date().toISOString(),
      isActive: true, // Super Admins are immediately active
      createdBy: authResult.user.id, // Track who created this Super Admin
      createdByEmail: authResult.user.email
    };

    await userRef.set(userData);

    // Log the creation
    console.log(`New Super Admin created: ${email} by ${authResult.user.email}`);

    // Return response without password
    const { password: _, ...userResponse } = userData;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Super Admin account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Super Admin:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create Super Admin account. Please try again.'
    }, { status: 500 });
  }
}