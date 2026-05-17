import React, { useState, lazy, Suspense } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Lazy load view components
const DisputesAudit = lazy(() => import('../components/super-admin/DisputesAudit'));
const AdminManagement = lazy(() => import('../components/super-admin/AdminManagement'));
const GlobalRightsOversight = lazy(() => import('../components/super-admin/GlobalRightsOversight'));
const OperatorOversight = lazy(() => import('../components/super-admin/OperatorOversight'));
const SystemAnalytics = lazy(() => import('../components/super-admin/SystemAnalytics'));
const AuditLog = lazy(() => import('../components/super-admin/AuditLog'));
const BroadcastNotices = lazy(() => import('../components/super-admin/BroadcastNotices'));
const ConfigFlags = lazy(() => import('../components/super-admin/ConfigFlags'));
const PackageManagement = lazy(() => import('../components/super-admin/PackageManagement'));
const UpgradeApprovalsAudit = lazy(() => import('../components/super-admin/UpgradeApprovalsAudit'));
const UserDeepDive = lazy(() => import('../components/shared/UserDeepDive'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'analytics': { component: SystemAnalytics, permission: Action.VIEW_SYSTEM_STATISTICS },
    'tiers': { component: PackageManagement, permission: Action.UPDATE_TIER },
    'disputes': { component: DisputesAudit, permission: Action.OVERRIDE_RESOLUTION },
    'upgrade-approvals': { component: UpgradeApprovalsAudit, permission: Action.APPROVE_UPGRADE },
    'admins': { component: AdminManagement, permission: Action.MANAGE_ADMINS },
    'agents': { component: GlobalRightsOversight, permission: Action.MANAGE_AGENTS },
    'operators': { component: OperatorOversight, permission: Action.MANAGE_OPERATORS },
    'audit': { component: AuditLog, permission: Action.VIEW_FULL_AUDIT_LOGS },
    'notices': { component: BroadcastNotices, permission: Action.VIEW_BROADCASTS },
    'config': { component: ConfigFlags, permission: Action.MODIFY_GOVERNANCE }
};

const SuperAdminDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('analytics');
    const [previousView, setPreviousView] = useState('analytics');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleViewDetails = (userId: string) => {
        setPreviousView(currentView);
        setSelectedUserId(userId);
        setCurrentView('user-details');
    };

    const renderContent = () => {
        if (currentView === 'user-details' && selectedUserId) {
            return (
                <Can perform={Action.VIEW_USER_DETAILS_ANY_ROLE} fallback={<AccessDenied />}>
                    <UserDeepDive 
                        userId={selectedUserId} 
                        viewerRole="super_admin"
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
            role="super_admin" 
            sidebarContent={null}
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
                             <Suspense fallback={<LoadingFallback />}>
                                {renderContent()}
                             </Suspense>
                         </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
