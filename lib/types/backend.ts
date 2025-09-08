// Backend data models for Firestore

export interface FirestoreMatch {
  id: string;
  title: string;
  dateISO: string;
  timeISO: string;
  location: string;
  teamSize: 5 | 7 | 11;
  createdBy?: string;
  ownerId?: string; // User ID of the league owner who created this match
  ownerEmail?: string; // Email of the league owner
  createdAt: string;
  inviteCode?: string;
  status: 'open' | 'closed';
}

export interface FirestoreTeam {
  id: string;
  matchId: string;
  name: string;
  index: 0 | 1; // Always 2 teams for MVP
}

export interface FirestorePlayer {
  id: string;
  matchId: string;
  teamId: string;
  slotNumber: number; // 1-based index (1 <= slotNumber <= teamSize)
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// API Request/Response types
export interface CreateMatchRequest {
  title: string;
  dateISO: string;
  timeISO: string;
  location: string;
  teamSize: 5 | 7 | 11;
  teamAName: string;
  teamBName: string;
  organizerContact?: string;
}

export interface CreateMatchResponse {
  matchId: string;
}

export interface ClaimSlotRequest {
  matchId: string;
  teamId: string;
  slotNumber: number;
  name: string;
  emailOrPhone: string;
}

export interface LeaveSlotRequest {
  matchId: string;
  teamId: string;
  slotNumber: number;
  emailOrPhone: string;
}

export interface SlotResponse {
  ok: boolean;
  error?: string;
}

// Frontend-compatible types (transformed from Firestore)
export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  initials: string;
}

export interface Team {
  id: string;
  name: string;
  players: (Player | undefined)[];
}

export interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: number;
  teams: Team[];
  createdAt: string;
}

export interface GetMatchResponse extends Match {}

// Error types
export interface ApiError {
  error: string;
  message: string;
  status: number;
}