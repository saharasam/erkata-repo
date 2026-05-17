import React, { lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';

// Lazy load components
const UpgradeVerificationsBoard = lazy(() => import('../components/financial/UpgradeVerificationsBoard'));
const FinancialDesk = lazy(() => import('../components/operator/FinancialDesk'));
const BroadcastInbox = lazy(() => import('../components/shared/BroadcastInbox'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const VALID_VIEWS = ['verifications', 'payouts', 'notices'];

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'verifications': { component: UpgradeVerificationsBoard, permission: Action.VERIFY_UPGRADE },
    'payouts': { component: FinancialDesk, permission: Action.APPROVE_PAYOUT },
    'notices': { component: BroadcastInbox, permission: Action.VIEW_BROADCASTS },
};

const FinancialOperatorDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'verifications';

  // Strict URL Parameter Validation
  useEffect(() => {
    if (searchParams.has('view') && !VALID_VIEWS.includes(searchParams.get('view')!)) {
        setSearchParams({ view: 'verifications' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const renderContent = () => {
    const viewConfig = VIEWS_REGISTRY[currentView];
    if (!viewConfig) return <ViewNotFound />;

    const Component = viewConfig.component;
    return (
        <Can perform={viewConfig.permission} fallback={<AccessDenied />}>
            <Component />
        </Can>
    );
  };

  return (
    <DashboardLayout 
      title="Financial Desk" 
      role="financial_operator"
      currentView={currentView}
      onViewChange={(v) => setSearchParams({ view: v })}
    >
      <div className="p-8">
        <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
                    {currentView.replace('-', ' ')}
                </h1>
                <p className="text-slate-500 font-medium">Financial oversight and transaction verification console.</p>
                </div>
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-8 h-8" />
                </div>
            </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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

export default FinancialOperatorDashboard;
