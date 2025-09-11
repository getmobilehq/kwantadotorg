'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { isAuthenticated, logout, getCurrentUser, isSuperAdmin, isLeagueOwner } from '@/lib/auth-enhanced';
import Container from '@/components/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Trophy, ChevronDown, ChevronUp, ExternalLink, Trash2, Download, FileText, FileSpreadsheet, RefreshCw, Wifi, WifiOff, UserCheck, Mail, Phone, Hash } from 'lucide-react';
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
  ownerId?: string;
  ownerEmail?: string;
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loadingPendingUsers, setLoadingPendingUsers] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    matchId: string;
    matchTitle: string;
  }>({ open: false, matchId: '', matchTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    setAuthChecking(false);
    fetchMatches();
    fetchPendingUsers(); // Fetch pending users for Super Admin
  }, [router]);

  // Real-time updates for League Owners
  useEffect(() => {
    if (!realTimeEnabled || authChecking || !isAuthenticated()) return;

    const interval = setInterval(() => {
      fetchMatches();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, authChecking]);

  const fetchMatches = async () => {
    try {
      const user = getCurrentUser();
      let url = '/api/matches/all';
      
      // If league owner, filter by ownership
      if (user && isLeagueOwner()) {
        url += `?ownerId=${user.id}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    if (!isSuperAdmin()) return;
    
    setLoadingPendingUsers(true);
    try {
      const response = await fetch('/api/admin/pending-users', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      } else {
        console.error('Failed to fetch pending users:', response.statusText);
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setPendingUsers([]);
    } finally {
      setLoadingPendingUsers(false);
    }
  };

  const approveUser = async (userId: string, approve: boolean) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, approve }),
      });

      if (response.ok) {
        // Refresh pending users list
        fetchPendingUsers();
        alert(`User ${approve ? 'approved' : 'rejected'} successfully`);
      } else {
        const error = await response.json();
        alert(`Failed to ${approve ? 'approve' : 'reject'} user: ${error.message}`);
      }
    } catch (error) {
      alert(`Failed to ${approve ? 'approve' : 'reject'} user. Please try again.`);
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

  const handleDeleteMatch = (matchId: string, matchTitle: string, match: Match) => {
    // Check if user can delete this match
    const user = getCurrentUser();
    if (isLeagueOwner() && match.ownerId !== user?.id) {
      alert('You can only delete matches you created.');
      return;
    }
    setDeleteDialog({ open: true, matchId, matchTitle });
  };

  const handleLogout = () => {
    logout();
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
                <h1 className="text-3xl font-bold text-gray-900">
                  {isSuperAdmin() ? 'Super Admin Dashboard' : 'League Owner Dashboard'}
                </h1>
                <Badge variant={isSuperAdmin() ? 'destructive' : 'secondary'}>
                  {getCurrentUser()?.name || 'Admin'}
                </Badge>
                <Badge variant="outline">
                  {isSuperAdmin() ? 'Super Admin' : 'League Owner'}
                </Badge>
              </div>
              <p className="text-gray-600">
                {isSuperAdmin() ? 'Manage all matches and view team rosters' : 'Manage your matches and view team rosters'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`${realTimeEnabled ? 'text-green-600 border-green-300' : 'text-gray-500'}`}
              >
                {realTimeEnabled ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
                {realTimeEnabled ? 'Real-time On' : 'Real-time Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMatches()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                    <p className="text-sm text-gray-600">Today&apos;s Matches</p>
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
                          {isSuperAdmin() && match.ownerEmail && (
                            <Badge variant="secondary" className="text-xs">
                              Owner: {match.ownerEmail}
                            </Badge>
                          )}
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

                        {/* Enhanced Player Registration Summary */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              <UserCheck className="w-5 h-5 text-green-600" />
                              Registration Status
                            </h4>
                            <Badge variant="outline" className="font-bold text-sm">
                              {totalPlayers}/{totalSlots} players
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {match.teams.map((team, idx) => {
                              const teamPlayers = team.players.filter(Boolean).length;
                              const teamPercentage = (teamPlayers / match.teamSize) * 100;
                              return (
                                <div key={team.id} className="text-center p-3 bg-white rounded-lg shadow-sm border">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    <span className="font-semibold text-sm text-gray-700">{team.name}</span>
                                  </div>
                                  <div className="text-xl font-bold text-gray-900 mb-1">{teamPlayers}/{match.teamSize}</div>
                                  <div className="text-xs text-gray-500 font-medium">{Math.round(teamPercentage)}% filled</div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 font-medium">Overall Progress</span>
                              <span className="font-bold text-gray-900">{Math.round(fillPercentage)}% complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                                style={{ width: `${fillPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {fillPercentage === 100 && (
                            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                              <div className="flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 text-green-700" />
                                <span className="text-sm font-bold text-green-800">🎉 Match is Complete!</span>
                              </div>
                            </div>
                          )}
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
                          onClick={() => handleDeleteMatch(match.id, match.title, match)}
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
                              {team.players.filter(Boolean).length === 0 ? (
                                <div className="text-center py-4">
                                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-gray-500 text-sm italic">No players registered yet</p>
                                  <p className="text-xs text-gray-400 mt-1">Players will appear here when they join</p>
                                </div>
                              ) : (
                                team.players
                                  .map((player, slotIndex) => ({ player, slotIndex }))
                                  .filter(({ player }) => player !== undefined && player !== null)
                                  .map(({ player, slotIndex }) => (
                                  <div 
                                    key={player.id} 
                                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-l-emerald-400 shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold ${index === 0 ? 'bg-emerald-500' : 'bg-blue-500'} shadow-lg ring-2 ring-white`}>
                                          {player.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-3">
                                            <UserCheck className="w-5 h-5 text-green-600" />
                                            <h4 className="font-bold text-lg text-gray-900 truncate">{player.name}</h4>
                                          </div>
                                          <div className="space-y-2">
                                            {player.email && (
                                              <div className="flex items-center gap-3 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                                <span className="truncate font-medium">{player.email}</span>
                                              </div>
                                            )}
                                            {player.phone && (
                                              <div className="flex items-center gap-3 text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                                <Phone className="w-4 h-4 text-green-600" />
                                                <span className="font-medium">{player.phone}</span>
                                              </div>
                                            )}
                                            {!player.email && !player.phone && (
                                              <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                                <Mail className="w-4 h-4" />
                                                <span className="italic">No contact information provided</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-2 ml-4">
                                        <Badge variant="default" className={`${index === 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold px-4 py-2 text-sm shadow-md`}>
                                          <Hash className="w-4 h-4 mr-2" />
                                          Position #{slotIndex + 1}
                                        </Badge>
                                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border">
                                          {team.name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                              
                              {/* Available slots summary */}
                              {(() => {
                                const filledSlots = team.players.filter(Boolean).length;
                                const availableSlots = match.teamSize - filledSlots;
                                return availableSlots > 0 ? (
                                  <div className="mt-4 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600">
                                          {availableSlots} available slot{availableSlots !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      <Badge variant="outline" className="text-xs text-gray-500 bg-white">
                                        {filledSlots}/{match.teamSize} filled
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                                    <div className="flex items-center justify-center gap-2">
                                      <Trophy className="w-5 h-5 text-green-600" />
                                      <span className="text-sm font-bold text-green-800">Team Complete!</span>
                                      <Badge className="bg-green-600 text-white ml-2">
                                        {filledSlots}/{match.teamSize}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })()}
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