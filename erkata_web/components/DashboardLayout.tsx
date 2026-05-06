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
  role: 'agent' | 'operator' | 'admin' | 'customer' | 'super_admin' | 'financial_operator';
  onSettingsClick?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  role,
  onSettingsClick,
  currentView,
  onViewChange
}) => {
  const navigate = useNavigate();
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

        <NotificationsPanel 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />

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
    </div>
  );
};

export default DashboardLayout;
