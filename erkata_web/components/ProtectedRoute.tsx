import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
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
        if (user?.role === UserRole.FINANCIAL_OPERATOR) correctPath = '/financial-operator';
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
