import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { SignupRequest, AuthResponse } from '@/lib/types/auth';
import { hashPassword } from '@/lib/password-utils';

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      } as AuthResponse, { status: 400 });
    }

    // Check if user already exists
    const existingUserSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingUserSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      } as AuthResponse, { status: 409 });
    }

    // Create new league owner
    const userRef = adminDb.collection('users').doc();
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      id: userRef.id,
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'league_owner' as const,
      createdAt: new Date().toISOString(),
      isActive: false, // League Owners require Super Admin approval
      approvedAt: null,
      approvedBy: null
    };

    await userRef.set(userData);

    // Return response without password
    const { password: _, ...userResponse } = userData;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Account created successfully! Please wait for Super Admin approval before you can login and create matches.'
    } as AuthResponse, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create account. Please try again.'
    } as AuthResponse, { status: 500 });
  }
}