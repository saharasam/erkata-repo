import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DisputesAudit from '../components/super-admin/DisputesAudit';
import AdminManagement from '../components/super-admin/AdminManagement';
import GlobalRightsOversight from '../components/super-admin/GlobalRightsOversight';
import OperatorOversight from '../components/super-admin/OperatorOversight';
import SystemAnalytics from '../components/super-admin/SystemAnalytics';
import AuditLog from '../components/super-admin/AuditLog';
import BroadcastNotices from '../components/super-admin/BroadcastNotices';
import ConfigFlags from '../components/super-admin/ConfigFlags';
import PackageManagement from '../components/super-admin/PackageManagement';
import UserDeepDive from '../components/shared/UserDeepDive';
import UpgradeApprovalsAudit from '../components/super-admin/UpgradeApprovalsAudit';
import {
  ShieldAlert,
  History,
  Activity,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('analytics');
    const [previousView, setPreviousView] = useState('analytics');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleViewDetails = (userId: string) => {
        setPreviousView(currentView);
        setSelectedUserId(userId);
        setCurrentView('user-details');
    };

    // Authority UI Colors: Indigo/Navy
    const brandGradient = "from-indigo-900 to-slate-900";

    const sidebarContent = null; 


    return (
        <DashboardLayout
            role="super_admin" 
            sidebarContent={sidebarContent}
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
                             {currentView === 'tiers' && <PackageManagement />}
                             {currentView === 'disputes' && <DisputesAudit />}
                             {currentView === 'upgrade-approvals' && <UpgradeApprovalsAudit />}
                             {currentView === 'admins' && <AdminManagement onViewDetails={handleViewDetails} />}
                             {currentView === 'agents' && <GlobalRightsOversight onViewDetails={handleViewDetails} />}
                             {currentView === 'user-details' && selectedUserId && (
                                <UserDeepDive 
                                    userId={selectedUserId} 
                                    viewerRole="super_admin"
                                    onBack={() => {
                                        setSelectedUserId(null);
                                        setCurrentView(previousView);
                                    }} 
                                />
                             )}
                             {currentView === 'operators' && <OperatorOversight onViewDetails={handleViewDetails} />}
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
