import React, { useState, lazy, Suspense } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Lazy load view components
const OperationsHub = lazy(() => import('../components/admin/OperationsHub'));
const FinancialDesk = lazy(() => import('../components/admin/FinancialDesk'));
const NetworkIntelligence = lazy(() => import('../components/admin/NetworkIntelligence'));
const BroadcastInbox = lazy(() => import('../components/shared/BroadcastInbox'));
const ZoneCoverage = lazy(() => import('../components/admin/ZoneCoverage'));
const EscalatedDisputes = lazy(() => import('../components/admin/EscalatedDisputes'));
const PendingActions = lazy(() => import('../components/admin/PendingActions'));
const ProposalHistory = lazy(() => import('../components/admin/ProposalHistory'));
const AdminAgentList = lazy(() => import('../components/admin/AdminAgentList'));
const AdminOperatorList = lazy(() => import('../components/admin/AdminOperatorList'));
const UserDeepDive = lazy(() => import('../components/shared/UserDeepDive'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'overview': { component: OperationsHub, permission: Action.VIEW_QUEUE },
    'finance': { component: FinancialDesk, permission: Action.VIEW_FINANCIAL_REPORTS },
    'network': { component: NetworkIntelligence, permission: Action.VIEW_SYSTEM_STATISTICS },
    'notices': { component: BroadcastInbox, permission: Action.VIEW_BROADCASTS },
    'zones': { component: ZoneCoverage, permission: Action.VIEW_QUEUE },
    'disputes': { component: EscalatedDisputes, permission: Action.PROPOSE_RESOLUTION },
    'actions': { component: PendingActions, permission: Action.PROPOSE_RESOLUTION },
    'history': { component: ProposalHistory, permission: Action.PROPOSE_RESOLUTION },
    'agents': { component: AdminAgentList, permission: Action.MANAGE_AGENTS },
    'operators': { component: AdminOperatorList, permission: Action.MANAGE_OPERATORS }
};

const AdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('overview');
    const [previousView, setPreviousView] = useState('overview');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleViewDetails = (id: string) => {
        setPreviousView(currentView);
        setSelectedUserId(id);
        setCurrentView('user-details');
    };

    const renderContent = () => {
        if (currentView === 'user-details' && selectedUserId) {
            return (
                <Can perform={Action.VIEW_USER_DETAILS_ANY_ROLE} fallback={<AccessDenied />}>
                    <UserDeepDive 
                        userId={selectedUserId} 
                        viewerRole="admin"
                        onBack={() => {
                            setSelectedUserId(null);
                            setCurrentView(previousView);
                        }} 
                    />
                </Can>
            );
        }

        const viewConfig = VIEWS_REGISTRY[currentView];
        if (!viewConfig) return <ViewNotFound />;

        const Component = viewConfig.component;
        return (
            <Can perform={viewConfig.permission} fallback={<AccessDenied />}>
                <Component onViewDetails={handleViewDetails} />
            </Can>
        );
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
                        <Suspense fallback={<LoadingFallback />}>
                            {renderContent()}
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;