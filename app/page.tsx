import Header from '@/components/Header';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, MapPin, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      
      <Container className="py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Organize Football
            <span className="block text-emerald-500">Matches Easily</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create matches, set up teams, and let players claim their spots with our visual slot selection system.
          </p>
          
          <Link href="/create">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-xl">
              Create Your Match
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Calendar className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Set Match Details</h3>
              <p className="text-gray-600">Date, time, location and team size</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Create Teams</h3>
              <p className="text-gray-600">Set up team names and configure slots</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Visual Slots</h3>
              <p className="text-gray-600">Players claim spots like airplane seats</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Share2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Share & Invite</h3>
              <p className="text-gray-600">Send links to get players to join</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Simple, Fast, Effective
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Create a match in under 2 minutes</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Players see real-time availability</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Mobile-optimized for on-the-go organizing</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Team A</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="w-10 h-10 bg-emerald-100 border-2 border-emerald-300 rounded-full flex items-center justify-center text-xs font-medium text-emerald-700">
                        {i <= 4 ? 'JD' : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Team B</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="w-10 h-10 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                        {i <= 3 ? 'MS' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}