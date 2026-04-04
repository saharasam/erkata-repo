import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
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
    const [currentView, setCurrentView] = useState('analytics');

    // Authority UI Colors: Indigo/Navy
    const brandGradient = "from-indigo-900 to-slate-900";

    const sidebarContent = null; 

    const rightPanelContent = (
        <div className="space-y-8">
            <section>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System Integrity</h3>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50/50 border border-green-100 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-20" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-green-800">Operational</p>
                            <p className="text-[10px] text-green-600/70 font-medium">All core systems healthy</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Audit Stream</h3>
                    <History className="w-3 h-3 text-slate-300" />
                </div>
                <div className="space-y-4">
                    {[
                        { time: '2m ago', action: 'New Admin Registered', user: 'Samuel A.' },
                        { time: '1h ago', action: 'Resolution Finalized', user: 'System' },
                        { time: '3h ago', action: 'Global Config Updated', user: 'Samuel A.' },
                    ].map((entry, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                                <p className="text-xs font-bold text-slate-700">{entry.action}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 ml-4">{entry.user} • {entry.time}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Broadcast Hub</h3>
                <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                    <Megaphone className="w-6 h-6 text-indigo-300 mb-4" />
                    <p className="text-xs font-bold mb-1">Maintenance Scheduled</p>
                    <p className="text-[10px] text-indigo-200/70 leading-relaxed mb-4">Targeting all roles for database migration at 00:00 UTC.</p>
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-2 text-[10px] font-bold transition-all">
                        Manage Broadcasts
                    </button>
                </div>
            </section>
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
            <div className="max-w-6xl">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px w-6 bg-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">
                                Level 4 Clearance
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize mb-2">
                            {currentView.replace('-', ' ')}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">
                            Global oversight and decision authority portal
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Admins</p>
                             <p className="text-2xl font-black text-slate-900 leading-none">12</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Tasks</p>
                             <p className="text-2xl font-black text-red-500 leading-none">03</p>
                        </div>
                    </div>
                </header>

                <div className="min-h-[70vh]">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                         >
                             {currentView === 'analytics' && <SystemAnalytics />}
                             {currentView === 'emergency' && <EmergencyArchive />}
                             {currentView === 'admins' && <AdminManagement />}
                             {currentView === 'agents' && <GlobalRightsOversight />}
                             {currentView === 'operators' && <OperatorOversight />}
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
