// Authentication and user management types

export type UserRole = 'super_admin' | 'league_owner';

export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

// Extended match interface to include owner information
export interface OwnedMatch {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: number;
  createdAt: string;
  ownerId: string;
  ownerEmail: string;
}