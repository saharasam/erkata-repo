import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api, { setAccessToken, setAuthReady } from '../utils/api';
import { UserRole } from '../utils/constants';

interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  zoneId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string; role: string }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          console.log('[Auth] Session refreshed successfully.');
          setAccessToken(accessToken);
          
          const decoded: any = jwtDecode(accessToken);
          console.log('[Auth] Decoded Token:', decoded);
          
          const userData: User = {
            id: decoded.sub || decoded.id,
            role: normalizeRole(decoded.app_metadata?.role || 'customer'),
            fullName: decoded.user_metadata?.fullName || 'User',
            email: decoded.email || '',
            zoneId: decoded.app_metadata?.zoneId
          };
          
          console.log('[Auth] Setting user state:', userData);
          setUser(userData);
          localStorage.setItem('erkata_user', JSON.stringify(userData));
          setAuthReady(true);
        } else {
          console.log('[Auth] No session found.');
        }
      } catch (e) {
        console.log('[Auth] Session check failed or expired.');
        localStorage.removeItem('erkata_user');
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
      
      console.log('[Auth] Login response data:', response.data);
      setAccessToken(accessToken);

      const authenticatedUser: User = {
        id: userData.id,
        role: normalizeRole(userData.role),
        fullName: userData.fullName || 'User',
        email: userData.email,
        zoneId: userData.zoneId
      };

      console.log('[Auth] Setting authenticated user:', authenticatedUser);
      setUser(authenticatedUser);
      localStorage.setItem('erkata_user', JSON.stringify(authenticatedUser));
      setAuthReady(true);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out...');
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setAccessToken('');
      setAuthReady(false);
      localStorage.removeItem('erkata_user');
    }
  };

  const signup = async (data: { fullName: string; email: string; password: string; role: string }) => {
    try {
      console.log('[Auth] Signing up:', data.email);
      const payload = {
        ...data,
        role: denormalizeRole(data.role),
      };
      await api.post('/auth/register', payload);
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user, isLoading }}>
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('[Auth] ProtectedRoute: Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
      } else if (user?.role !== allowedRole) {
        console.log(`[Auth] ProtectedRoute: Role mismatch. User: ${user?.role}, Required: ${allowedRole}. Redirecting...`);
        // Redirect to correct dashboard based on role
        let correctPath = '/login';
        if (user?.role === UserRole.AGENT) correctPath = '/agent-dashboard';
        if (user?.role === UserRole.OPERATOR) correctPath = '/operator-dashboard';
        if (user?.role === UserRole.ADMIN) correctPath = '/admin-dashboard';
        if (user?.role === UserRole.SUPER_ADMIN) correctPath = '/superadmin';
        if (user?.role === UserRole.CUSTOMER) correctPath = '/customer';
        
        navigate(correctPath, { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRole, navigate]);

  if (isLoading || !isAuthenticated || user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
};
