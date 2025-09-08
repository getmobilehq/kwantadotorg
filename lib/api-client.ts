// Firebase backend API client functions

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

export interface CreateMatchData {
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: string; // Frontend sends as string ('5', '7', '11')
}

export interface PlayerRegistration {
  name: string;
  email?: string;
  phone?: string;
}

// Error handling helper
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'unknown_error', message: response.statusText }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Get authentication headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available (for league owners and super admin)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kwanta_auth_token');
    if (token) {
      if (token.startsWith('legacy_')) {
        // Handle legacy super admin token
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Handle regular JWT token
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  return headers;
}

// Create a new match with two teams
export async function createMatch(matchData: CreateMatchData, teamsData: { teamA: string; teamB: string }): Promise<string> {
  // Check if we're on the server side
  const baseUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    : '';
    
  const response = await fetch(`${baseUrl}/api/matches`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: matchData.title,
      dateISO: matchData.date,
      timeISO: matchData.time,
      location: matchData.location,
      teamSize: matchData.teamSize, // Backend now accepts both string and number
      teamAName: teamsData.teamA,
      teamBName: teamsData.teamB,
    }),
  });

  const result = await handleResponse(response);
  return result.matchId;
}

// Create teams for a match (now handled in createMatch)
export async function createTeams(matchId: string, teamsData: { teamA: string; teamB: string }): Promise<void> {
  // This is now handled in the createMatch endpoint
  // Keeping this for backward compatibility but it's a no-op
  console.warn('createTeams is deprecated - teams are created automatically with matches');
}

// Get match details with teams and players
export async function getMatch(matchId: string): Promise<Match> {
  // Check if we're on the server side
  const baseUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    : '';
    
  const response = await fetch(`${baseUrl}/api/matches/${matchId}`, {
    method: 'GET',
  });

  return handleResponse(response);
}

// Get all matches (for listing page)
export async function getMatches(): Promise<Match[]> {
  // For MVP, we'll create a simple endpoint or use a sample match
  // For now, return empty array as we don't have a list endpoint yet
  return [];
}

// Claim a slot in a team
export async function claimSlot(
  matchId: string,
  teamId: string,
  slotIndex: number,
  playerData: PlayerRegistration
): Promise<Match> {
  const emailOrPhone = playerData.email || playerData.phone || '';
  
  // Check if we're on the server side
  const baseUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    : '';
    
  const response = await fetch(`${baseUrl}/api/slots/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      matchId,
      teamId,
      slotNumber: slotIndex + 1, // Convert to 1-based index for backend
      name: playerData.name,
      emailOrPhone,
    }),
  });

  await handleResponse(response);
  
  // Return updated match data
  return getMatch(matchId);
}

// Leave a slot in a team
export async function leaveSlot(
  matchId: string,
  teamId: string,
  slotIndex: number
): Promise<void> {
  // For leaving a slot, we need the contact info
  // For MVP, we'll use a simple prompt or pass empty string
  // In a real app, this would be handled with proper auth
  const emailOrPhone = prompt('Please enter your email or phone number to confirm slot removal:') || '';
  
  if (!emailOrPhone) {
    throw new Error('Contact information is required to leave a slot');
  }

  // Check if we're on the server side
  const baseUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    : '';
    
  const response = await fetch(`${baseUrl}/api/slots/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      matchId,
      teamId,
      slotNumber: slotIndex + 1, // Convert to 1-based index for backend
      emailOrPhone,
    }),
  });

  await handleResponse(response);
}