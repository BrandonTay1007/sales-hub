import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setToken, getToken, clearToken } from '@/lib/api';

// User type matching API response
export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'sales';
  commissionRate?: number;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on app load with retry logic
  useEffect(() => {
    const verifyToken = async (retryCount = 0): Promise<void> => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (response.success && response.data) {
          setUser(response.data.user);
          setIsLoading(false);
        } else {
          // Check if it's an explicit UNAUTHORIZED error (token invalid/expired)
          if (response.error?.code === 'UNAUTHORIZED') {
            console.log('[Auth] Token invalid or expired, clearing...');
            clearToken();
            setIsLoading(false);
          } else if (retryCount < 1) {
            // Network or other error - retry once
            console.log('[Auth] Verification failed, retrying...', response.error?.message);
            await new Promise(r => setTimeout(r, 1000));
            return verifyToken(retryCount + 1);
          } else {
            // Retry exhausted - keep token but mark as not loading
            // User can still try to use the app, will get proper errors
            console.log('[Auth] Verification failed after retry, keeping token');
            setIsLoading(false);
          }
        }
      } catch (error) {
        // Network error - retry if haven't already
        if (retryCount < 1) {
          console.log('[Auth] Network error, retrying...', error);
          await new Promise(r => setTimeout(r, 1000));
          return verifyToken(retryCount + 1);
        }
        // Keep token on network error - don't lock user out
        console.log('[Auth] Network error after retry, keeping token');
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(username, password);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    // Optionally call logout endpoint (non-blocking)
    authApi.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const isAdmin = user?.role === 'admin';

  // Show loading spinner during token verification, but render children behind it
  // This prevents remounting of child components when loading state changes
  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoading }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
