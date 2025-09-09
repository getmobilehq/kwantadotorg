'use client';

import { useState } from 'react';
import Slot from './Slot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MousePointer2, Info } from 'lucide-react';

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

      {/* Registration Instructions */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-dashed border-emerald-300 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-full">
            <MousePointer2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-emerald-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to Register
            </h3>
            <div className="text-emerald-800 space-y-2">
              <p className="font-semibold text-base">
                🔹 <strong>Click on any empty circle (⚪) to register for that position</strong>
              </p>
              <p className="text-sm">
                • Choose your preferred team (left or right)
              </p>
              <p className="text-sm">
                • Click on any available slot to join the match
              </p>
              <p className="text-sm">
                • Filled slots (with initials) are already taken
              </p>
            </div>
          </div>
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