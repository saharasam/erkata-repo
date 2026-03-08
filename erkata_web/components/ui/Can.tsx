import React from 'react';
import { Action, usePermissions } from '../../hooks/usePermissions';

interface CanProps {
  perform: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative component for conditional rendering based on user permissions.
 * 
 * Usage:
 * <Can perform={Action.UPDATE_TIER}>
 *   <button>Upgrade Tier</button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ perform, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(perform)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};
