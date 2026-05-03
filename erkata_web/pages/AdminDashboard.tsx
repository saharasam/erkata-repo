import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SystemHealth from '../components/admin/SystemHealth';
import EscalatedDisputes from '../components/admin/EscalatedDisputes';
import AdminAgentList from '../components/admin/AdminAgentList';
import AdminOperatorList from '../components/admin/AdminOperatorList';
import PendingActions from '../components/admin/PendingActions';
import ZoneCoverage from '../components/admin/ZoneCoverage';
import ProposalHistory from '../components/admin/ProposalHistory';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder imports for the new components (Create these files next)
import OperationsHub from '../components/admin/OperationsHub';
import FinancialDesk from '../components/admin/FinancialDesk';
import NetworkIntelligence from '../components/admin/NetworkIntelligence';
import BroadcastInbox from '../components/shared/BroadcastInbox';
import UserDeepDive from '../components/shared/UserDeepDive';

const AdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('overview');
    const [previousView, setPreviousView] = useState('overview');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleViewDetails = (id: string) => {
        setPreviousView(currentView);
        setSelectedUserId(id);
        setCurrentView('user-details');
    };

    return (
        <DashboardLayout
            role="admin"
            sidebarContent={null}
            currentView={currentView}
            onViewChange={setCurrentView}
        >
            <div className="p-6 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* New Views */}
                        {currentView === 'overview' && <OperationsHub />}
                        {currentView === 'finance' && <FinancialDesk />}
                        {currentView === 'network' && <NetworkIntelligence />}
                        {currentView === 'notices' && <BroadcastInbox />}

                        {/* Existing Views */}
                        {currentView === 'zones' && <ZoneCoverage />}
                        {currentView === 'disputes' && <EscalatedDisputes />}
                        {currentView === 'actions' && <PendingActions />}
                        {currentView === 'history' && <ProposalHistory />}
                        {currentView === 'agents' && <AdminAgentList onViewDetails={handleViewDetails} />}
                        {currentView === 'operators' && <AdminOperatorList onViewDetails={handleViewDetails} />}

                        {currentView === 'user-details' && selectedUserId && (
                            <UserDeepDive 
                                userId={selectedUserId} 
                                viewerRole="admin"
                                onBack={() => {
                                    setSelectedUserId(null);
                                    setCurrentView(previousView);
                                }} 
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;