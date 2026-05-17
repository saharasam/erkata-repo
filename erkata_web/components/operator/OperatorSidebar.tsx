import React from 'react';
import { Action } from '../../hooks/usePermissions';
import { Can } from '../ui/Can';

interface OperatorSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const OperatorSidebar: React.FC<OperatorSidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'overview', label: 'Operator Overview', category: 'Requests', permission: Action.VIEW_QUEUE },
    { id: 'history', label: 'Assignment History', category: 'Performance', permission: Action.VIEW_QUEUE },
  ];

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
                          ? 'bg-erkata-primary/10 text-erkata-primary' 
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

export default OperatorSidebar;
