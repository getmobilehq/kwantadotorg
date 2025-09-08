'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Container from '@/components/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, User } from 'lucide-react';
import { authenticateAdmin, loginUser } from '@/lib/auth-enhanced';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'league_owner' | 'super_admin'>('league_owner');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show message from URL params (e.g., after signup)
    const message = searchParams.get('message');
    if (message) {
      // Show success message briefly
      const successDiv = document.createElement('div');
      successDiv.className = 'bg-green-50 border border-green-200 rounded-md p-3 mb-4';
      successDiv.innerHTML = `<p class="text-sm text-green-600">${decodeURIComponent(message)}</p>`;
      
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form && form.parentNode) {
          form.parentNode.insertBefore(successDiv, form);
          setTimeout(() => successDiv.remove(), 5000);
        }
      }, 100);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMode === 'super_admin') {
        // Legacy admin login
        if (authenticateAdmin(username, password)) {
          router.push('/admin');
        } else {
          setError('Invalid username or password');
        }
      } else {
        // League owner login
        if (!email || !password) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }

        const result = await loginUser({ email, password });
        if (result.success) {
          router.push('/admin');
        } else {
          setError(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Header />
      <Container className="py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {loginMode === 'super_admin' ? (
                  <Shield className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {loginMode === 'super_admin' ? 'Super Admin Login' : 'League Owner Login'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Enter your credentials to access the admin dashboard
              </p>
              
              {/* Login Mode Toggle */}
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  type="button"
                  variant={loginMode === 'league_owner' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLoginMode('league_owner')}
                  className="text-xs"
                >
                  League Owner
                </Button>
                <Button
                  type="button"
                  variant={loginMode === 'super_admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLoginMode('super_admin')}
                  className="text-xs"
                >
                  Super Admin
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginMode === 'super_admin' ? (
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                {loginMode === 'league_owner' && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Don&apos;t have an account?{' '}
                      <Link href="/admin/signup" className="text-emerald-600 hover:text-emerald-500 font-medium">
                        Sign up as League Owner
                      </Link>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}