'use client';

import { useState } from 'react';
import Slot from './Slot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  initials: string;
}

interface Team {
  id: string;
  name: string;
  players: (Player | undefined)[];
}

interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: number;
  teams: Team[];
}

interface FieldViewProps {
  match: Match;
  onSlotClick: (teamId: string, slotIndex: number) => void;
}

export default function FieldView({ match, onSlotClick }: FieldViewProps) {
  const [teamA, teamB] = match.teams;
  
  // Add safety checks for teams
  if (!teamA || !teamB) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Match teams not properly configured.</p>
      </div>
    );
  }
  
  const renderSlots = (team: Team, teamColor: 'emerald' | 'blue') => {
    const slots = [];
    
    for (let i = 0; i < match.teamSize; i++) {
      const player = team.players[i];
      slots.push(
        <Slot
          key={`${team.id}-${i}`}
          isOccupied={!!player}
          playerInitials={player?.initials}
          playerName={player?.name}
          onClick={() => onSlotClick(team.id, i)}
          teamColor={teamColor}
          size="lg"
        />
      );
    }
    
    return slots;
  };

  const getFilledCount = (team: Team) => {
    // Count actual filled slots in sparse array
    return team.players.filter(player => player !== undefined && player !== null).length;
  };

  return (
    <div className="space-y-8">
      {/* Match Info Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {match.title}
        </h1>
        <div className="text-gray-600 space-y-1">
          <p>{new Date(match.date).toLocaleDateString()} at {match.time}</p>
          <p>{match.location}</p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        {/* Team A */}
        <Card className="border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">{teamA.name}</span>
              </div>
              <span className="text-sm font-normal text-emerald-600">
                {getFilledCount(teamA)}/{match.teamSize}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 justify-items-center">
              {renderSlots(teamA, 'emerald')}
            </div>
          </CardContent>
        </Card>

        {/* Team B */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">{teamB.name}</span>
              </div>
              <span className="text-sm font-normal text-blue-600">
                {getFilledCount(teamB)}/{match.teamSize}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 justify-items-center">
              {renderSlots(teamB, 'blue')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Stats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {getFilledCount(teamA)}
            </div>
            <div className="text-sm text-gray-600">{teamA.name}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {getFilledCount(teamA) + getFilledCount(teamB)}/{match.teamSize * 2}
            </div>
            <div className="text-sm text-gray-600">Total Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {getFilledCount(teamB)}
            </div>
            <div className="text-sm text-gray-600">{teamB.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}