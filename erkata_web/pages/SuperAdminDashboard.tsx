import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import FinalResolutions from '../components/super-admin/FinalResolutions';
import EmergencyArchive from '../components/super-admin/EmergencyArchive';
import AdminManagement from '../components/super-admin/AdminManagement';
import GlobalRightsOversight from '../components/super-admin/GlobalRightsOversight';
import OperatorOversight from '../components/super-admin/OperatorOversight';
import SystemAnalytics from '../components/super-admin/SystemAnalytics';
import AuditLog from '../components/super-admin/AuditLog';
import BroadcastNotices from '../components/super-admin/BroadcastNotices';
import ConfigFlags from '../components/super-admin/ConfigFlags';
import {
  ShieldAlert,
  History,
  Activity,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('resolutions');

    // Authority UI Colors: Indigo/Navy
    const brandGradient = "from-indigo-900 to-slate-900";

    const sidebarContent = null; // Options moved to UtilitySidebar

    const rightPanelContent = (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-50 border border-indigo-100 rounded-xl p-4"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 uppercase">System Status</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-slate-600">All services operational</span>
                </div>
            </motion.div>

            <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Recent Audit entries</h3>
                <motion.div 
                    variants={{
                      initial: { opacity: 0 },
                      animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                >
                    {[
                        { time: '2m ago', action: 'Admin created', user: 'SA: Samuel' },
                        { time: '1h ago', action: 'Res. Finalized', user: 'SA: Samuel' },
                        { time: '3h ago', action: 'Tier Upgrade', user: 'ADM: Sarah' },
                    ].map((entry, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={{
                              initial: { opacity: 0, x: 10 },
                              animate: { opacity: 1, x: 0 }
                            }}
                            className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-3"
                        >
                            <History className="w-3 h-3 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-700">{entry.action}</p>
                                <p className="text-[9px] text-slate-400">{entry.user} • {entry.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Active Broadcasts</h3>
                <div className="bg-indigo-900/5 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-700">Maintenance Notice</p>
                        <p className="text-[9px] text-slate-500">Target: All Users • Scheduled for 00:00 UTC</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return (
        <DashboardLayout
            role="super_admin" 
            sidebarContent={sidebarContent}
            rightPanelContent={rightPanelContent}
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            <div className="max-w-[1920px] mx-auto">
                <div className="mb-8 flex items-end justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-white bg-indigo-900 px-2 py-0.5 rounded tracking-tighter uppercase whitespace-nowrap">
                                Final Authority
                             </span>
                             <div className="h-px w-8 bg-slate-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
                            {currentView.replace('-', ' ')}
                        </h1>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
                    >
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Admins</p>
                             <p className="text-lg font-black text-indigo-600 leading-none">12</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Res.</p>
                             <p className="text-lg font-black text-red-600 leading-none text-right">03</p>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 p-6 shadow-sm min-h-[600px]">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                         >
                             {currentView === 'resolutions' && <FinalResolutions />}
                             {currentView === 'emergency' && <EmergencyArchive />}
                             {currentView === 'admins' && <AdminManagement />}
                             {currentView === 'agents' && <GlobalRightsOversight />}
                             {currentView === 'operators' && <OperatorOversight />}
                             {currentView === 'analytics' && <SystemAnalytics />}
                             {currentView === 'audit' && <AuditLog />}
                             {currentView === 'notices' && <BroadcastNotices />}
                             {currentView === 'config' && <ConfigFlags />}
                         </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
