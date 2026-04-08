import React from 'react';
import { Action } from '../../hooks/usePermissions';
import { Can } from '../ui/Can';
import { BarChart3, MapPin, ShieldAlert, Settings2, History, Users, Wallet, Network } from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'overview', label: 'Operations Hub', category: 'Overview', icon: BarChart3, permission: Action.VIEW_QUEUE },
    { id: 'zones', label: 'Zone Coverage', category: 'Overview', icon: MapPin, permission: Action.VIEW_QUEUE },
    { id: 'bundles', label: 'Escalated Bundles', category: 'Mediation', icon: ShieldAlert, permission: Action.PROPOSE_RESOLUTION },
    { id: 'actions', label: 'Pending Actions', category: 'Mediation', icon: Settings2, permission: Action.PROPOSE_RESOLUTION },
    { id: 'history', label: 'My Proposals', category: 'Mediation', icon: History, permission: Action.PROPOSE_RESOLUTION },
    { id: 'finance', label: 'Financial Desk', category: 'Economy', icon: Wallet, permission: Action.VIEW_FINANCIAL_REPORTS },
    { id: 'network', label: 'Network Intelligence', category: 'Economy', icon: Network, permission: Action.VIEW_SYSTEM_STATISTICS },
    { id: 'agents', label: 'Agents', category: 'People', icon: Users, permission: Action.MANAGE_AGENTS },
    { id: 'operators', label: 'Operators', category: 'People', icon: Users, permission: Action.MANAGE_OPERATORS },
  ];

  const categories = Array.from(new Set(navItems.map(item => item.category)));

  return (
    <div className="space-y-6 py-4">
      {categories.map(category => (
        <div key={category}>
          <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {category}
          </div>
          <div className="space-y-1 mt-1">
            {navItems.filter(item => item.category === category).map(item => (
              <Can key={item.id} perform={item.permission}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${currentView === item.id
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
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