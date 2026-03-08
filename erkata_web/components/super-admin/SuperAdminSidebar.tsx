import React from 'react';
import { Action } from '../../hooks/usePermissions';
import { Can } from '../ui/Can';
import { 
  ShieldAlert, 
  Archive, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  BarChart4, 
  History, 
  Megaphone, 
  Settings2 
} from 'lucide-react';

interface SuperAdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'resolutions', label: 'Final Resolutions', icon: ShieldCheck, badge: 3, permission: Action.FINALIZE_RESOLUTION },
    { id: 'emergency', label: 'Emergency Archive', icon: Archive, permission: Action.EMERGENCY_ARCHIVE },
    { id: 'admins', label: 'Admin Management', icon: ShieldAlert, permission: Action.MANAGE_ADMINS },
    { id: 'agents', label: 'Agents & Tiers', icon: TrendingUp, permission: Action.MANAGE_AGENTS },
    { id: 'operators', label: 'Operators', icon: Users, permission: Action.MANAGE_OPERATORS },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart4, permission: Action.VIEW_AUDIT_LOGS },
    { id: 'audit', label: 'Full Audit Log', icon: History, permission: Action.VIEW_AUDIT_LOGS },
    { id: 'notices', label: 'Broadcast Notices', icon: Megaphone, permission: Action.MODIFY_GOVERNANCE },
    { id: 'config', label: 'System Settings', icon: Settings2, permission: Action.MODIFY_GOVERNANCE },
  ];

  return (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <Can key={item.id} perform={item.permission}>
          <button
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-indigo-900 text-white font-semibold shadow-lg shadow-indigo-900/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
               <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
               <span className="text-sm">{item.label}</span>
            </div>
            {item.badge !== undefined && (
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  currentView === item.id ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'
               }`}>
                  {item.badge}
               </span>
            )}
          </button>
        </Can>
      ))}
    </div>
  );
};

export default SuperAdminSidebar;
