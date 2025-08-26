// Mock API functions for demonstration
// In production, these would be actual API calls

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
  players: Player[];
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

// Mock storage (in production, this would be a database)
const matches = new Map<string, Match>();

// Create a sample match for preview
const sampleMatch: Match = {
  id: 'sample-match',
  title: 'Sunday League Championship',
  date: '2025-01-26',
  time: '15:00',
  location: 'Central Park Field A',
  teamSize: 11,
  teams: [
    {
      id: 'team-a',
      name: 'Red Devils',
      players: [],
    },
    {
      id: 'team-b',
      name: 'Blue Eagles', 
      players: [],
    },
  ],
  createdAt: new Date().toISOString(),
};

matches.set('sample-match', sampleMatch);

export async function getAllMatchIds(): Promise<string[]> {
  // Return all available match IDs for static generation
  return Array.from(matches.keys());
}

export async function createMatch(matchData: {
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: string;
}): Promise<{ id: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const id = Math.random().toString(36).substr(2, 9);
  
  const match: Match = {
    id,
    title: matchData.title,
    date: matchData.date,
    time: matchData.time,
    location: matchData.location,
    teamSize: parseInt(matchData.teamSize),
    teams: [],
    createdAt: new Date().toISOString(),
  };
  
  matches.set(id, match);
  
  return { id };
}

export async function createTeams(matchId: string, teamsData: {
  teamA: string;
  teamB: string;
}): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const match = matches.get(matchId);
  if (!match) throw new Error('Match not found');
  
  match.teams = [
    {
      id: 'team-a',
      name: teamsData.teamA,
      players: [],
    },
    {
      id: 'team-b', 
      name: teamsData.teamB,
      players: [],
    },
  ];
  
  matches.set(matchId, match);
}

export async function getMatch(matchId: string): Promise<Match> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const match = matches.get(matchId);
  if (!match) throw new Error('Match not found');
  
  return match;
}

export async function claimSlot(
  matchId: string,
  teamId: string,
  slotIndex: number,
  playerData: {
    name: string;
    email?: string;
    phone?: string;
  }
): Promise<Match> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const match = matches.get(matchId);
  if (!match) throw new Error('Match not found');
  
  const team = match.teams.find(t => t.id === teamId);
  if (!team) throw new Error('Team not found');
  
  // Check if slot is already taken
  if (team.players[slotIndex]) {
    throw new Error('That slot was just taken—pick another.');
  }
  
  const initials = playerData.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const player: Player = {
    id: Math.random().toString(36).substr(2, 9),
    name: playerData.name,
    email: playerData.email,
    phone: playerData.phone,
    initials,
  };
  
  team.players[slotIndex] = player;
  matches.set(matchId, match);
  return match;
}

export async function leaveSlot(
  matchId: string,
  teamId: string,
  slotIndex: number
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const match = matches.get(matchId);
  if (!match) throw new Error('Match not found');
  
  const team = match.teams.find(t => t.id === teamId);
  if (!team) throw new Error('Team not found');
  
  // Set to undefined instead of delete to avoid sparse array issues
  team.players[slotIndex] = undefined as any;
  matches.set(matchId, match);
}