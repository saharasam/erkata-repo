import { createContext } from 'react';
import { UserRole } from '../utils/constants';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  zoneId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string; role: string }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
