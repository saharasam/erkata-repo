import { createContext } from 'react';
import { UserRole } from '../utils/constants';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
  zoneId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (data: { fullName: string; email: string; phone: string; password: string; role: string; inviteToken?: string; referralCode?: string }) => Promise<void>;
  /** Merges a partial user object into the in-memory auth state. Called after successful profile updates. */
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
