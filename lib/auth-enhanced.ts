'use client';

import { AuthUser, AuthResponse } from '@/lib/types/auth';

const AUTH_TOKEN_KEY = 'kwanta_auth_token';
const AUTH_USER_KEY = 'kwanta_auth_user';

// Legacy admin credentials (for super admin)
const LEGACY_ADMIN_USERNAME = 'admin';
const LEGACY_ADMIN_PASSWORD = 'kwanta2025';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

// Enhanced authentication functions
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.user && data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
};

export const signupUser = async (signupData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    const data: AuthResponse = await response.json();
    
    if (data.success && data.user) {
      // Don't auto-login after signup, let them login manually
      // This gives them a chance to verify their credentials work
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Signup failed. Please try again.'
    };
  }
};

// Legacy admin login (for super admin)
export const authenticateAdmin = (username: string, password: string): boolean => {
  if (username === LEGACY_ADMIN_USERNAME && password === LEGACY_ADMIN_PASSWORD) {
    // Create a super admin user object
    const superAdminUser: AuthUser = {
      id: 'super-admin',
      email: 'admin@kwanta.org',
      name: 'Super Admin',
      role: 'super_admin'
    };
    
    // Generate a JWT-like token for the super admin
    const superAdminToken = btoa(JSON.stringify({
      userId: 'super-admin',
      email: 'admin@kwanta.org',
      role: 'super_admin',
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    
    localStorage.setItem(AUTH_TOKEN_KEY, `legacy_${superAdminToken}`);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(superAdminUser));
    return true;
  }
  return false;
};

export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const user = getCurrentUser();
  
  return !!(token && user);
};

export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'super_admin';
};

export const isLeagueOwner = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'league_owner';
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Backward compatibility functions
export const isAdminAuthenticated = isAuthenticated;
export const logoutAdmin = logout;
export const getAdminUsername = (): string | null => {
  const user = getCurrentUser();
  return user?.name || null;
};