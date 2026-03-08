import React from 'react';
import { Action } from '../../hooks/usePermissions';
import { Can } from '../ui/Can';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Home', category: 'Overview', permission: Action.VIEW_QUEUE },
    { id: 'zones', label: 'Zone Coverage', category: 'Overview', permission: Action.VIEW_QUEUE },
    { id: 'bundles', label: 'Escalated Bundles', category: 'Work Queue', permission: Action.PROPOSE_RESOLUTION },
    { id: 'actions', label: 'Pending Actions', category: 'Work Queue', permission: Action.PROPOSE_RESOLUTION },
    { id: 'history', label: 'My Proposals', category: 'Work Queue', permission: Action.PROPOSE_RESOLUTION },
    { id: 'agents', label: 'Agents', category: 'People', permission: Action.MANAGE_AGENTS },
    { id: 'operators', label: 'Operators', category: 'People', permission: Action.MANAGE_OPERATORS },
  ];

  // Group by category
  const categories = Array.from(new Set(navItems.map(item => item.category)));

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category}>
           <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {category}
           </div>
           <div className="space-y-1">
             {navItems.filter(item => item.category === category).map(item => (
                <Can key={item.id} perform={item.permission}>
                  <button
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentView === item.id 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                      {item.label}
                  </button>
                </Can>
             ))}
           </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSidebar;
