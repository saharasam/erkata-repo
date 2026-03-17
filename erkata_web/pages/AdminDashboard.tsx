import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminSidebar from '../components/admin/AdminSidebar';
import SystemHealth from '../components/admin/SystemHealth';
import EscalatedBundles from '../components/admin/EscalatedBundles';
import AdminAgentList from '../components/admin/AdminAgentList';
import AdminOperatorList from '../components/admin/AdminOperatorList';
import PendingActions from '../components/admin/PendingActions';
import ZoneCoverage from '../components/admin/ZoneCoverage';
import ProposalHistory from '../components/admin/ProposalHistory';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('overview');

    return (
        <DashboardLayout
            role="admin"
            sidebarContent={null}
            currentView={currentView}
            onViewChange={setCurrentView}
            rightPanelContent={
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <SystemHealth />
                </motion.div>
            }
        >
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {currentView === 'overview' && (
                            <div className="text-center py-20">
                                <motion.h2 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl font-bold text-slate-800 mb-2"
                                >
                                    Welcome to Admin Workspace
                                </motion.h2>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-slate-500"
                                >
                                    Select an item from the sidebar to get started.
                                </motion.p>
                            </div>
                        )}
                        {currentView === 'zones' && <ZoneCoverage />}
                        {currentView === 'bundles' && <EscalatedBundles />}
                        {currentView === 'actions' && <PendingActions />}
                        {currentView === 'history' && <ProposalHistory />}
                        {currentView === 'agents' && <AdminAgentList />}
                        {currentView === 'operators' && <AdminOperatorList />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
