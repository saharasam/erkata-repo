import React, { ReactNode, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Bell, Search, Settings } from 'lucide-react';
import UtilitySidebar from './UtilitySidebar';
import SettingsView from './SettingsView';
import NotificationsPanel from './NotificationsPanel';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode; // deprecated — kept for backward compat, not rendered
  rightPanelContent?: ReactNode;
  role: 'agent' | 'operator' | 'admin' | 'customer' | 'super_admin';
  onSettingsClick?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  rightPanelContent,
  role,
  onSettingsClick,
  currentView,
  onViewChange
}) => {
  const navigate = useNavigate();
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  // Handle external settings click (optional prop) or internal
  const handleSettingsClick = () => {
      setShowSettings(true);
      if (onSettingsClick) onSettingsClick();
  };


  return (
    <div className="h-screen bg-[#F0F4F8] flex font-sans overflow-hidden">
      
      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {showSettings && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setShowSettings(false)}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-y-auto custom-scrollbar shadow-2xl relative"
                >
                     <button 
                        onClick={() => setShowSettings(false)}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                     >
                        <X className="w-6 h-6 text-slate-400" />
                     </button>
                     <div className="p-8 md:p-12">
                        <SettingsView role={role} />
                     </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Global Utility Sidebar (Left - Always Visible) */}
      <div className="h-full z-50 shrink-0">
          <UtilitySidebar 
            onSettingsClick={() => setShowSettings(true)}
            onNotificationsClick={() => setShowNotifications(true)}
            currentView={currentView}
            onViewChange={onViewChange}
          />
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] ${(role === 'admin' || role === 'super_admin') ? 'bg-indigo-100/40' : 'bg-blue-100/40'} rounded-full blur-[120px]`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] ${(role === 'admin' || role === 'super_admin') ? 'bg-blue-100/40' : 'bg-teal-100/40'} rounded-full blur-[120px]`} />
        </div>

        {/* Top Header */}
        <header className="h-16 shrink-0 border-b border-white/40 bg-white/40 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 relative z-20">
           {/* Navigation Controls */}
           <div className="hidden lg:flex items-center gap-1 mr-2">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-full transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate(1)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-full transition-colors"
                title="Go Forward"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           {/* Global Search / Breadcrumbs (Placeholder) */}
           <div className="hidden lg:flex items-center px-4 py-2 bg-white/60 border border-white/50 rounded-full w-96 shadow-sm focus-within:ring-2 focus-within:ring-erkata-primary/20 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search requests, transactions, or customers..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
              />
           </div>

           {/* Top Right Actions */}
           <div className="flex items-center gap-2 relative">
              <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-white text-erkata-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'}`}
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">
                           {unreadCount}
                        </span>
                     )}
                  </button>
                  <NotificationsPanel 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                  />
              </div>

              <button 
                onClick={handleSettingsClick}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-full transition-colors"
              >
                 <Settings className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden ${role === 'super_admin' ? 'p-0' : 'p-4 lg:p-6'} scroll-smooth custom-scrollbar`}>
          <div className={`${role === 'super_admin' ? 'max-w-none' : 'max-w-[1920px]'} mx-auto min-h-full pb-20 ${role === 'super_admin' ? 'px-8 py-10' : ''}`}>
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Right Panel (Collapsible) */}
      <aside className="relative flex shrink-0 h-full z-30"> 
        {rightPanelContent && (
          <div className={`
             h-full bg-white/40 backdrop-blur-3xl border-l border-white/40 shadow-2xl
             transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col
             ${rightPanelOpen ? 'w-80 lg:w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 overflow-hidden'}
          `}>
             <div className="p-6 border-b border-white/40 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Oversight Widgets</span>
                <button onClick={() => setRightPanelOpen(false)} className="lg:hidden p-1">
                   <X className="w-4 h-4 text-slate-400" />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {rightPanelContent}
             </div>
          </div>
        )}
        
        {/* Toggle Button for Widget Panel */}
        {rightPanelContent && (
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`
              absolute top-20 w-8 h-10 rounded-l-xl
              bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-r-0 border-slate-100 
              flex items-center justify-center 
              text-slate-400 hover:text-erkata-primary hover:w-10
              transition-all duration-200
              z-30
              ${rightPanelOpen ? '-left-px' : '-left-8'}
            `}
            title={rightPanelOpen ? "Collapse Widgets" : "Expand Widgets"}
          >
            {rightPanelOpen ? (
               <ChevronRight className="w-4 h-4" />
            ) : (
               <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </aside>
    </div>
  );
};

export default DashboardLayout;
