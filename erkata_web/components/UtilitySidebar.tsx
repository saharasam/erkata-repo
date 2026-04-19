import React, { useState, useEffect } from 'react';
import { Calendar, StickyNote, MessageCircle, X, Globe, User, LogOut, ShieldCheck, Archive, ShieldAlert, Settings2, Megaphone, BarChart4, History, TrendingUp, Users, ChevronRight, ChevronLeft, MapPin, LayoutGrid, FileText, Package, Wallet, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/constants';
import { Action } from '../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';
import { useNotifications } from '../contexts/NotificationContext';
import { playPayoutSound } from '../utils/sounds';
import { useSocket } from '../contexts/SocketContext';

interface UtilitySidebarProps {
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const UtilitySidebar: React.FC<UtilitySidebarProps> = ({ 
  onSettingsClick, 
  onNotificationsClick,
  currentView,
  onViewChange
}) => {
  const { showConfirm } = useModal();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, payoutCount } = useNotifications();
  const { socket } = useSocket();

  // Play distinct payout sound when a new payout.requested notification arrives
  useEffect(() => {
    if (!socket || user?.role !== UserRole.OPERATOR) return;
    const handleNotification = (n: any) => {
      if (n.type === 'payout.requested') {
        playPayoutSound();
      }
    };
    socket.on('notification', handleNotification);
    return () => { socket.off('notification', handleNotification); };
  }, [socket, user]);

  const disputeCount = notifications.filter(
    (n) => !n.read && (n.type === 'request.disputed' || n.type === 'request.escalated')
  ).length;

  const tools = [
    // { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'text-blue-500' },
    // { id: 'notes', icon: StickyNote, label: 'Notes', color: 'text-yellow-500' },
    // { id: 'support', icon: MessageCircle, label: 'Support', color: 'text-purple-500' },
    { id: 'language', icon: Globe, label: 'Language', color: 'text-teal-500' },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-slate-500' },
    { id: 'logout', icon: LogOut, label: 'Logout', color: 'text-red-500' },
  ];

  const superAdminTools = [
    { id: 'analytics', icon: BarChart4, label: 'Analytics' },
    { id: 'tiers', icon: Package, label: 'Tier Architecture' },
    { id: 'disputes', icon: ShieldAlert, label: 'Disputes Audit', badge: disputeCount > 0 ? disputeCount : undefined },
    { id: 'admins', icon: User, label: 'Admin Management' },
    { id: 'config', icon: Settings2, label: 'Config Flags' },
    { id: 'notices', icon: Megaphone, label: 'Broadcasts' },
    { id: 'audit', icon: History, label: 'Audit Logs' },
    { id: 'agents', icon: TrendingUp, label: 'Agent Oversight' },
    { id: 'operators', icon: Users, label: 'Operator Oversight' },
  ];

  const adminTools = [
    { id: 'overview', icon: BarChart4, label: 'Operations Hub' },
    // { id: 'zones', icon: MapPin, label: 'Zone Coverage' },
    { id: 'disputes', icon: ShieldAlert, label: 'Disputes', badge: disputeCount > 0 ? disputeCount : undefined },
    // { id: 'actions', icon: Settings2, label: 'Pending Actions' },
    // { id: 'history', icon: History, label: 'My Proposals' },
    // { id: 'finance', icon: Wallet, label: 'Financial Desk' },
    // { id: 'network', icon: Network, label: 'Network Intelligence' },
    { id: 'agents', icon: Users, label: 'Agents' },
    { id: 'operators', icon: Users, label: 'Operators' },
    { id: 'notices', icon: Megaphone, label: 'Broadcasts' },
  ];

  const operatorTools = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'finance', icon: Wallet, label: 'Financial Desk', badge: payoutCount > 0 ? payoutCount : undefined },
    { id: 'disputes', icon: ShieldAlert, label: 'Disputes', badge: disputeCount > 0 ? disputeCount : undefined },
    { id: 'history', icon: History, label: 'Assignment History' },
    { id: 'notices', icon: Megaphone, label: 'Broadcasts' },
  ];

  const agentTools = [
    { id: 'focus', icon: FileText, label: 'Focus Board' },
    { id: 'earnings', icon: TrendingUp, label: 'Earnings' },
    { id: 'network', icon: Users, label: 'My Network' },
    { id: 'packages', icon: Package, label: 'Packages' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notices', icon: Megaphone, label: 'Broadcasts' },
  ];

  const customerTools = [
    { id: 'requests', icon: Package, label: 'My Requests' },
  ];

  const roleTools: Record<string, any[]> = {
    [UserRole.SUPER_ADMIN]: superAdminTools,
    [UserRole.ADMIN]: adminTools,
    [UserRole.OPERATOR]: operatorTools,
    [UserRole.AGENT]: agentTools,
    [UserRole.CUSTOMER]: customerTools,
  };

  const currentRoleTools = user?.role ? roleTools[user.role] || [] : [];

  const toggleTool = (toolId: string) => {
    console.log('Toggling tool:', toolId);
    
    // Check if it's a role-specific navigation item
    const isRoleNavItem = currentRoleTools.some(t => t.id === toolId);
    if (isRoleNavItem && onViewChange) {
      onViewChange(toolId);
      setActiveTool(null);
      return;
    }

    if (toolId === 'logout') {
      showConfirm({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out? You will need to login again to access your dashboard.',
        confirmText: 'Yes, Sign Out',
        type: 'error'
      }).then(confirmed => {
        if (confirmed) {
          logout();
          navigate('/login');
        }
      });
      return;
    }
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  return (
    <div className="flex h-full relative z-40">
      {/* Persistence Strip */}
      <motion.div 
        animate={{ width: isExpanded ? 240 : 64 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white/60 backdrop-blur-xl border-r border-white/50 h-full flex flex-col items-center py-6 shadow-sm relative z-50 overflow-y-auto no-scrollbar overflow-x-hidden"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 mb-6 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-md transition-all shrink-0"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Role-Specific Navigation Tools (Primary) */}
        {currentRoleTools.length > 0 && (
          <div className="w-full flex flex-col items-center space-y-2 shrink-0 px-3">
            {currentRoleTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 group relative ${
                  currentView === tool.id 
                    ? user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-erkata-primary text-white shadow-lg shadow-erkata-primary/30'
                    : `text-slate-400 hover:bg-white ${user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN ? 'hover:text-indigo-600' : 'hover:text-erkata-primary'} hover:shadow-md`
                } ${isExpanded ? 'px-3 justify-start gap-3' : 'justify-center'}`}
                title={isExpanded ? "" : tool.label}
              >
                <tool.icon className="w-5 h-5 shrink-0" />
                
                {isExpanded && (
                  <span className="text-sm font-bold tracking-tight truncate">
                    {tool.label}
                  </span>
                )}

                {tool.badge && !isExpanded && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white border-2 border-white">
                    {tool.badge}
                  </span>
                )}

                {tool.badge && isExpanded && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600">
                    {tool.badge}
                  </span>
                )}

                {!isExpanded && (
                  <span className="absolute left-full ml-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                    {tool.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Section Divider */}
        {currentRoleTools.length > 0 && tools.length > 0 && (
          <div className="w-8 h-px bg-slate-100 shrink-0 my-6" />
        )}

        {/* Standard Tools Section */}
        <div className="w-full flex flex-col items-center space-y-2 shrink-0 px-3">
          {tools.filter(t => t.id !== 'logout' && t.id !== 'profile').map((tool) => (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 group relative ${
                activeTool === tool.id 
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              } ${isExpanded ? 'px-3 justify-start gap-3' : 'justify-center'}`}
              title={isExpanded ? "" : tool.label}
            >
              <tool.icon className={`w-5 h-5 shrink-0 ${activeTool === tool.id ? 'text-white' : ''} transition-colors`} />
              
              {isExpanded && (
                <span className="text-sm font-medium truncate">
                  {tool.label}
                </span>
              )}

              {!isExpanded && (
                <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                  {tool.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Section (Profile & Logout) */}
        <div className="w-full flex flex-col items-center mt-auto space-y-2 shrink-0 pb-2 px-3 pt-6 border-t border-slate-50">
           <button
             onClick={() => toggleTool('profile')}
             className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 group relative ${
               activeTool === 'profile' 
                 ? 'bg-slate-800 text-white shadow-lg' 
                 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
             } ${isExpanded ? 'px-3 justify-start gap-3' : 'justify-center'}`}
             title={isExpanded ? "" : "Profile"}
           >
             <User className="w-5 h-5 shrink-0" />
             {isExpanded && <span className="text-sm font-medium">Profile</span>}
             {!isExpanded && (
               <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                 Profile
               </span>
             )}
           </button>

           <button
             onClick={() => toggleTool('logout')}
             className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 group relative text-slate-400 hover:bg-red-50 hover:text-red-500 ${isExpanded ? 'px-3 justify-start gap-3' : 'justify-center'}`}
             title={isExpanded ? "" : "Logout"}
           >
             <LogOut className="w-5 h-5 shrink-0" />
             {isExpanded && <span className="text-sm font-medium">Logout</span>}
             {!isExpanded && (
               <span className="absolute left-full ml-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                 Logout
               </span>
             )}
           </button>
        </div>
      </motion.div>

      {/* Tool Panel (Slide-out) */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/50 min-w-[320px]">
              <h3 className="font-bold text-slate-800 capitalize flex items-center">
                {tools.find(t => t.id === activeTool)?.icon && 
                  React.createElement(tools.find(t => t.id === activeTool)!.icon, { className: "w-5 h-5 mr-2 text-slate-500" })}
                {activeTool}
              </h3>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-slate-100/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto min-w-[320px]">
               {activeTool === 'calendar' && (
                 <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                       <h4 className="font-bold text-slate-700 mb-2">February 2026</h4>
                       <div className="grid grid-cols-7 gap-1 text-center text-xs">
                          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="font-bold text-slate-400 py-1">{d}</div>)}
                          {Array.from({length: 28}, (_, i) => (
                             <div key={i} className={`p-2 rounded-lg cursor-pointer hover:bg-slate-50 ${i === 13 ? 'bg-erkata-primary text-white hover:bg-erkata-primary' : 'text-slate-600'}`}>
                                {i + 1}
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {activeTool === 'notes' && (
                  <div className="space-y-3">
                     <textarea 
                        className="w-full h-40 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none bg-yellow-50/50 placeholder-yellow-700/50 text-slate-700"
                        placeholder="Type a quick note..."
                     ></textarea>
                     <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Saved Notes</p>
                        <div className="space-y-2">
                           <div className="p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 hover:border-slate-300 cursor-pointer">
                              REQ-2024-001: Customer needs callback after 5pm
                           </div>
                        </div>
                     </div>
                  </div>
               )}
               
               {activeTool === 'support' && (
                  <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
                     <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                        <MessageCircle className="w-8 h-8" />
                     </div>
                     <h4 className="font-bold text-slate-800">Support Online</h4>
                     <p className="text-sm text-slate-500 max-w-[200px]">
                        Start a chat for immediate assistance.
                     </p>
                     <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
                        Start Chat
                     </button>
                  </div>
               )}

               {activeTool === 'language' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase">Select Language</p>
                    {['English', 'Amharic', 'Oromo', 'Tigrinya'].map(lang => (
                      <button key={lang} className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-teal-500 hover:shadow-md transition-all group">
                        <span className="font-medium text-slate-700 group-hover:text-teal-700">{lang}</span>
                        {lang === 'English' && <div className="w-2 h-2 bg-teal-500 rounded-full" />}
                      </button>
                    ))}
                  </div>
               )}

               {activeTool === 'profile' && (
                  <div className="space-y-6">
                     <div className="text-center">
                        <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-slate-500">
                          {user?.fullName?.charAt(0)}
                        </div>
                        <h4 className="font-bold text-slate-800">{user?.fullName}</h4>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-erkata-primary/10 text-erkata-primary text-xs font-bold rounded-full capitalize">
                          {user?.role}
                        </span>
                     </div>
                     
                     <div className="space-y-2">
                        <button 
                            onClick={onSettingsClick}
                            className="w-full text-left p-3 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                        >
                           Account Settings
                        </button>
                        <button 
                            onClick={onNotificationsClick}
                            className="w-full text-left p-3 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                        >
                           Notifications
                        </button>
                        <button className="w-full text-left p-3 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-600 transition-colors">
                           Security
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UtilitySidebar;
