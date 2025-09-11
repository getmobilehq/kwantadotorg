import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminDb } from './firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'league_owner';
  };
  error?: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization token provided' };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Handle legacy super admin token
    if (token.startsWith('legacy_')) {
      const legacyToken = token.replace('legacy_', '');
      try {
        const decoded = JSON.parse(atob(legacyToken));
        if (decoded.role === 'super_admin' && decoded.exp > Date.now()) {
          return {
            success: true,
            user: {
              id: 'super-admin',
              email: 'admin@kwanta.org',
              name: 'Super Admin',
              role: 'super_admin'
            }
          };
        }
      } catch (error) {
        return { success: false, error: 'Invalid legacy token' };
      }
    }

    // Handle JWT tokens for League Owners
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Verify user still exists and is active
      const userDoc = await adminDb.collection('users').doc(decoded.userId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      if (!userData?.isActive) {
        return { success: false, error: 'User account is inactive' };
      }

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        }
      };
    } catch (jwtError) {
      return { success: false, error: 'Invalid JWT token' };
    }

  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}

export function generateJWTToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}