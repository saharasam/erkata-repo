import React, { useState, useEffect, ReactNode } from 'react';
import api, { setAccessToken, setAuthReady } from '../utils/api';
import { UserRole } from '../utils/constants';
import { AuthContext, User } from './AuthContext';

// Helper to normalize roles from Backend (lowercase underscore) to Frontend (UserRole Enum)
const normalizeRole = (role: any): UserRole => {
  if (!role || typeof role !== 'string') {
    console.warn('[Auth] Received invalid role:', role);
    return UserRole.CUSTOMER;
  }
  return role.toLowerCase() as UserRole;
};

// Helper to normalize roles from Frontend (UserRole Enum) to Backend (lowercase underscore)
const denormalizeRole = (role: string): string => {
  return role.toLowerCase();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[Auth] Checking existing session...');
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        
        if (accessToken) {
          setAccessToken(accessToken);
          
          // Hydrate user state from /auth/me to ensure fresh data and no PII in localStorage
          const userRes = await api.get('/auth/me');
          const userData = userRes.data;
          
          const authenticatedUser: User = {
            id: userData.id,
            role: normalizeRole(userData.role),
            fullName: userData.fullName || 'User',
            email: userData.email,
            phone: userData.phone ?? undefined,
            avatarUrl: userData.avatarUrl ?? null,
            zoneId: userData.zoneId
          };
          
          setUser(authenticatedUser);
          setAuthReady(true);
        } else {
        }
      } catch (e) {
        setAccessToken('');
      } finally {
        setAuthReady(true);
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Attempting login for:', email);
      const response = await api.post('/auth/login', { identifier: email, password });
      const { user: userData, accessToken } = response.data;
      setAccessToken(accessToken);

      const authenticatedUser: User = {
        id: userData.id,
        role: normalizeRole(userData.role),
        fullName: userData.fullName || 'User',
        email: userData.email,
        phone: userData.phone ?? undefined,
        avatarUrl: userData.avatarUrl ?? null,
        zoneId: userData.zoneId
      };

      setUser(authenticatedUser);
      setAuthReady(true);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setAccessToken('');
      setAuthReady(false);
    }
  };

  const signup = async (data: { fullName: string; email: string; phone: string; password: string; role: string; inviteToken?: string; referralCode?: string }) => {
    try {
      console.log('[Auth] Signing up:', data.email);
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: denormalizeRole(data.role),
        ...(data.inviteToken ? { inviteToken: data.inviteToken } : {}),
        ...(data.referralCode ? { referralCode: data.referralCode } : {}),
      };
      const response = await api.post('/auth/register', payload);
      
      // Automatic Login after Registration
      const { user: userData, accessToken } = response.data;
      
      if (accessToken && userData) {
        setAccessToken(accessToken);

        const authenticatedUser: User = {
          id: userData.id,
          role: normalizeRole(userData.role),
          fullName: userData.fullName || 'User',
          email: userData.email,
          phone: userData.phone ?? undefined,
          avatarUrl: userData.avatarUrl ?? null,
          zoneId: userData.zoneId
        };

        setUser(authenticatedUser);
        setAuthReady(true);
      }
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    }
  };

  /**
   * Merges a partial user object into the in-memory auth state.
   * Call this immediately after a successful profile/avatar update API call
   * so the UI reflects changes without a full page reload.
   */
  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, updateUser, isAuthenticated: !!user, isLoading }}>
      {isLoading ? (
        <div className="h-screen w-full flex items-center justify-center bg-erkata-surface font-sans">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-erkata-primary/20 border-t-erkata-primary rounded-full animate-spin" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Initializing Erkata...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
