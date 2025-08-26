'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { isAdminAuthenticated, logoutAdmin, getAdminUsername } from '@/lib/auth';
import Container from '@/components/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Trophy, ChevronDown, ChevronUp, ExternalLink, Trash2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';
import { exportMatchToExcel, exportMatchToPDF } from '@/lib/export-utils';

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
  players: Player[];
}

interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: number;
  teams: Team[];
  createdAt: string;
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    matchId: string;
    matchTitle: string;
  }>({ open: false, matchId: '', matchTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    setAuthChecking(false);
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches/all');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMatchExpansion = (matchId: string) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const getMatchStatus = (date: string, time: string) => {
    const matchDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (matchDateTime < now) {
      return { label: 'Completed', color: 'bg-gray-500' };
    } else if (matchDateTime.toDateString() === now.toDateString()) {
      return { label: 'Today', color: 'bg-green-500' };
    } else {
      return { label: 'Upcoming', color: 'bg-blue-500' };
    }
  };

  const getTotalPlayers = (teams: Team[]) => {
    return teams.reduce((total, team) => total + team.players.length, 0);
  };

  const handleDeleteMatch = (matchId: string, matchTitle: string) => {
    setDeleteDialog({ open: true, matchId, matchTitle });
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const confirmDeleteMatch = async () => {
    if (!deleteDialog.matchId) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/matches/${deleteDialog.matchId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the match from the local state
        setMatches(prev => prev.filter(match => match.id !== deleteDialog.matchId));
        setDeleteDialog({ open: false, matchId: '', matchTitle: '' });
      } else {
        const error = await response.json();
        console.error('Failed to delete match:', error);
        alert('Failed to delete match. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matches...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      <Container className="py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <Badge variant="secondary">
                  Welcome, {getAdminUsername()}
                </Badge>
              </div>
              <p className="text-gray-600">Manage all matches and view team rosters</p>
            </div>
            <div className="flex gap-2">
              <Link href="/create">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Create New Match
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold">{matches.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Players</p>
                    <p className="text-2xl font-bold">
                      {matches.reduce((total, match) => total + getTotalPlayers(match.teams), 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold">
                      {matches.filter(m => new Date(`${m.date}T${m.time}`) > new Date()).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Matches</p>
                    <p className="text-2xl font-bold">
                      {matches.filter(m => {
                        const matchDate = new Date(m.date).toDateString();
                        const today = new Date().toDateString();
                        return matchDate === today;
                      }).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-6">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600 mb-4">Create your first match to get started!</p>
                <Link href="/create">
                  <Button>Create Match</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => {
              const isExpanded = expandedMatches.has(match.id);
              const status = getMatchStatus(match.date, match.time);
              const totalPlayers = getTotalPlayers(match.teams);
              const totalSlots = match.teamSize * 2;
              const fillPercentage = (totalPlayers / totalSlots) * 100;

              return (
                <Card key={match.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{match.title}</CardTitle>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline">
                            {match.teamSize}v{match.teamSize}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.date).toLocaleDateString('en-GB', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {match.location}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Players registered</span>
                            <span className="font-semibold">{totalPlayers}/{totalSlots}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/match/${match.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMatchExpansion(match.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Details
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportMatchToExcel(match)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Excel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportMatchToPDF(match)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMatch(match.id, match.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        {match.teams.map((team, index) => (
                          <div key={team.id}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                {team.name}
                              </h4>
                              <Badge variant="secondary">
                                {team.players.length}/{match.teamSize} players
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {team.players.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No players registered yet</p>
                              ) : (
                                team.players.map((player, playerIndex) => (
                                  <div 
                                    key={player.id} 
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                        {player.initials}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{player.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {player.email || player.phone || 'No contact info'}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      Slot {playerIndex + 1}
                                    </Badge>
                                  </div>
                                ))
                              )}
                              
                              {/* Empty slots */}
                              {Array.from({ length: match.teamSize - team.players.length }).map((_, i) => (
                                <div 
                                  key={`empty-${i}`} 
                                  className="flex items-center justify-between p-2 border-2 border-dashed border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <Users className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Available slot</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs text-gray-400">
                                    Slot {team.players.length + i + 1}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Match Info Footer */}
                      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Match ID: {match.id}</span>
                          <span>Created: {new Date(match.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </Container>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title="Delete Match"
        description={`Are you sure you want to delete "${deleteDialog.matchTitle}"? This action cannot be undone and will remove all teams and players from this match.`}
        confirmText="Delete Match"
        cancelText="Cancel"
        destructive={true}
        onConfirm={confirmDeleteMatch}
        loading={deleting}
      />
    </div>
  );
}