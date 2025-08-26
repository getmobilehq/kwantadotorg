'use client';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'kwanta2025';
const AUTH_TOKEN_KEY = 'kwanta_admin_token';

export const authenticateAdmin = (username: string, password: string): boolean => {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate a simple token (in production, use JWT or similar)
    const token = btoa(`${username}:${Date.now()}`);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  }
  return false;
};

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;
  
  try {
    // Decode and validate token (basic validation)
    const decoded = atob(token);
    const [username, timestamp] = decoded.split(':');
    
    if (username !== ADMIN_USERNAME) return false;
    
    // Check if token is less than 24 hours old
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - tokenTime > twentyFourHours) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return false;
  }
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getAdminUsername = (): string | null => {
  if (!isAdminAuthenticated()) return null;
  
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    
    const decoded = atob(token);
    const [username] = decoded.split(':');
    return username;
  } catch (error) {
    return null;
  }
};