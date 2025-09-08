import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { LoginRequest, AuthResponse } from '@/lib/types/auth';
import { verifyPassword } from '@/lib/password-utils';
import { generateJWT } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      } as AuthResponse, { status: 400 });
    }

    // Find user by email
    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse, { status: 401 });
    }

    const userData = userSnapshot.docs[0].data();
    
    // Check if account is active
    if (!userData.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      } as AuthResponse, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      } as AuthResponse, { status: 401 });
    }

    // Update last login
    await adminDb.collection('users').doc(userData.id).update({
      lastLogin: new Date().toISOString()
    });

    // Generate JWT token
    const token = generateJWT({
      userId: userData.id,
      email: userData.email,
      role: userData.role
    });

    const { password: _, ...userResponse } = userData;

    return NextResponse.json({
      success: true,
      user: userResponse,
      token,
      message: 'Login successful'
    } as AuthResponse, { status: 200 });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.'
    } as AuthResponse, { status: 500 });
  }
}