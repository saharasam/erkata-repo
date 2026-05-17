import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../contexts/ModalContext';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import { useSocket } from '../contexts/SocketContext';
import { Skeleton } from '../components/ui/Skeleton';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';

// Lazy load components
const WalletSummary = lazy(() => import('../components/agent/WalletSummary'));
const ProfileView = lazy(() => import('../components/agent/ProfileView'));
const PackageSelection = lazy(() => import('../components/agent/PackageSelection'));
const PackagesView = lazy(() => import('../components/agent/PackagesView'));
const NetworkView = lazy(() => import('../components/agent/NetworkView'));
const FocusBoard = lazy(() => import('../components/agent/FocusBoard'));
const BroadcastInbox = lazy(() => import('../components/shared/BroadcastInbox'));
const TransferMatchModal = lazy(() => import('../components/agent/TransferMatchModal'));
const PayoutRequestModal = lazy(() => import('../components/agent/PayoutRequestModal'));

type DashboardView = 'focus' | 'earnings' | 'network' | 'packages' | 'profile' | 'notices';
const VALID_VIEWS: string[] = ['focus', 'earnings', 'network', 'packages', 'profile', 'notices'];

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'focus': { component: FocusBoard, permission: Action.VIEW_ASSIGNED_REQUEST_DETAILS },
    'earnings': { component: WalletSummary, permission: Action.VIEW_OWN_FINANCES },
    'packages': { component: PackagesView, permission: Action.VIEW_UPGRADES },
    'network': { component: NetworkView, permission: Action.VIEW_REFERRALS },
    'profile': { component: ProfileView, permission: Action.VIEW_BROADCASTS }, // Shared anchor
    'notices': { component: BroadcastInbox, permission: Action.VIEW_BROADCASTS },
};

const DashboardSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto space-y-8 animate-pulse pt-4">
    <div className="flex justify-between items-end mb-8">
      <div className="space-y-2">
        <Skeleton width="200px" height="2rem" />
        <Skeleton width="350px" height="1rem" />
      </div>
      <Skeleton width="120px" height="2.5rem" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} height="7rem" className="rounded-2xl" />
      ))}
    </div>

    <div className="flex gap-6 border-b border-slate-200/60 pb-3 mb-6">
      <Skeleton width="80px" height="1.5rem" />
      <Skeleton width="100px" height="1.5rem" />
      <Skeleton width="80px" height="1.5rem" />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} height="12rem" className="rounded-2xl" />
      ))}
    </div>
  </div>
);

const AgentDashboard: React.FC = () => {
  const { showConfirm, showAlert } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') as DashboardView) || 'focus';
  
  const [profile, setProfile] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasSkippedPackageSelection, setHasSkippedPackageSelection] = useState(false);
  const [transferringJobId, setTransferringJobId] = useState<string | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Strict URL Parameter Validation
  useEffect(() => {
    if (searchParams.has('view') && !VALID_VIEWS.includes(searchParams.get('view')!)) {
        setSearchParams({ view: 'focus' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const mapBackendJobsToUi = (matches: any[]): any[] => {
    return matches.map(m => ({
      id: m.id,
      transactionId: m.transaction?.id,
      submittedDate: new Date(m.assignedAt).toLocaleDateString(),
      submittedTime: new Date(m.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requirementSummary: `${m.request.category}: ${m.request.description || 'No description provided'}`,
      category: m.request.category,
      customerName: m.request.customer.fullName,
      customerPhone: m.request.customer.phone,
      zone: m.request.zone?.name || 'Unknown',
      woreda: m.request.woreda || 'N/A',
      budget: m.request.budget || '0',
      metadata: m.request.metadata || {},
      status: m.status // assigned, accepted, completed, rejected
    }));
  };

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const [profileRes, financeRes, jobsRes] = await Promise.all([
        api.get(`/users/me?t=${Date.now()}`),
        api.get(`/users/me/finance?t=${Date.now()}`),
        api.get(`/transactions/my-jobs?t=${Date.now()}`)
      ]);
      setProfile(profileRes.data);
      setFinance(financeRes.data);
      setRequests(mapBackendJobsToUi(jobsRes.data));
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // A4

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio feedback failed', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleNewLead = (notification: any) => {
        if (notification.type === 'match.created' || notification.type === 'request.pushed') {
          playNotificationSound();
          fetchData(); // Silent refresh
        }
      };

      socket.on('notification', handleNewLead);
      return () => {
        socket.off('notification', handleNewLead);
      };
    }
  }, [socket]);

  const setView = (newView: DashboardView) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('view', newView);
      return p;
    });
  };

  const addProcessingId = (id: string) => setProcessingIds(prev => new Set(prev).add(id));
  const removeProcessingId = (id: string) => setProcessingIds(prev => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });

  const handleDecline = async (jobId: string) => {
    const confirmed = await showConfirm({
      title: 'Decline Assignment',
      message: 'Are you sure you want to decline this request? It will be returned to the operator queue.',
      confirmText: 'Decline',
      type: 'error'
    });

    if (confirmed) {
      try {
        addProcessingId(jobId);
        await api.patch(`/transactions/${jobId}/decline`);
        setRequests(prev => prev.filter(req => req.id !== jobId));
        showAlert({ title: 'Success', message: 'Assignment declined.', type: 'success' });
      } finally {
        removeProcessingId(jobId);
      }
    }
  };

  const handleAccept = async (jobId: string) => {
    try {
      addProcessingId(jobId);
      await api.patch(`/transactions/${jobId}/accept`);
      const jobsRes = await api.get('/transactions/my-jobs');
      setRequests(mapBackendJobsToUi(jobsRes.data));
      showAlert({
        title: 'Assignment Accepted',
        message: 'Customer details have been unlocked. You can now start the fulfillment.',
        type: 'success'
      });
    } finally {
      removeProcessingId(jobId);
    }
  };

  const handlePayoutRequest = async () => {
    try {
      const financeRes = await api.get(`/users/me/finance?t=${Date.now()}`);
      setFinance(financeRes.data);
    } catch (error) {
      console.error('Failed to refresh finance before payout:', error);
    }
    setIsPayoutModalOpen(true);
  };

  const handlePayoutSubmit = async (data: { amount: number; bankName: string; bankAccountNumber: string; bankAccountHolder: string }) => {
    try {
      await api.post('/users/me/withdraw', data);
      showAlert({
        title: 'Payout Requested',
        message: 'Your request has been sent to the operator for manual transfer.',
        type: 'success'
      });
      const financeRes = await api.get('/users/me/finance');
      setFinance(financeRes.data);
    } catch (error) {
       console.error('Failed to request payout:', error);
       throw error;
    }
  };

  const handleCompleteClick = async (jobId: string, transactionId: string, customerName: string) => {
    if (!transactionId) {
       showAlert({ title: 'System Error', message: 'Transaction ID missing. Please refresh.', type: 'error' });
       return;
    }

    const confirmed = await showConfirm({
      title: 'Complete Request',
      message: 'Confirm completion and upload proof?',
      confirmText: 'Complete & Confirm',
      type: 'success'
    });

    if (confirmed) {
      try {
        addProcessingId(jobId);
        await api.patch(`/transactions/${jobId}/complete`);
        await fetchData();
        showAlert({ title: 'Success', message: 'Job marked as complete. Waiting for customer confirmation.', type: 'success' });
      } finally {
        removeProcessingId(jobId);
      }
    }
  };

  const renderContent = () => {
    const viewConfig = VIEWS_REGISTRY[view];
    if (!viewConfig) return <ViewNotFound />;

    const Component = viewConfig.component;
    let props: any = {};
    
    switch (view) {
        case 'focus':
            props = { 
                requests, 
                onAccept: handleAccept, 
                onComplete: handleCompleteClick, 
                onTransfer: (id: string) => setTransferringJobId(id), 
                onDecline: handleDecline,
                hasReferrals: !!profile?.referrals?.length,
                processingIds 
            };
            break;
        case 'earnings':
            props = { finance, onPayoutRequest: handlePayoutRequest };
            break;
        case 'packages':
            props = { finance, profile, onUpgradeComplete: fetchData };
            break;
        case 'network':
            props = { profile, finance, onNavigateToPackages: () => setView('packages') };
            break;
        case 'profile':
            props = { profile };
            break;
    }

    return (
        <Can perform={viewConfig.permission} fallback={<AccessDenied />}>
            <Component {...props} />
        </Can>
    );
  };

  if (isLoadingData && !profile) {
    return (
      <DashboardLayout
        role="agent"
        sidebarContent={null}
        currentView={view}
        onViewChange={(newView) => setView(newView as DashboardView)}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (!hasSkippedPackageSelection && (finance?.currentTier === 'FREE' || finance?.currentTier === 'Free')) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 md:px-0">
        <div className="absolute top-6 left-6 md:left-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-erkata-primary rounded-lg flex items-center justify-center shadow-lg shadow-erkata-primary/20">
               <span className="text-white font-black text-sm">e.</span>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800">erkata</span>
        </div>
        <Suspense fallback={<LoadingFallback />}>
            <PackageSelection onComplete={fetchData} onSkip={() => setHasSkippedPackageSelection(true)} />
        </Suspense>
      </div>
    );
  }

  return (
    <DashboardLayout
      role="agent"
      currentView={view}
      onViewChange={(newView) => setView(newView as DashboardView)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
            <Suspense fallback={<LoadingFallback />}>
                {renderContent()}
            </Suspense>
        </motion.div>
      </AnimatePresence>

      <Suspense fallback={null}>
        <TransferMatchModal
            isOpen={!!transferringJobId}
            onClose={() => setTransferringJobId(null)}
            matchId={transferringJobId || ''}
            referrals={profile?.referrals || []}
            onSuccess={fetchData}
        />

        <PayoutRequestModal 
            isOpen={isPayoutModalOpen}
            onClose={() => setIsPayoutModalOpen(false)}
            availableBalance={parseFloat(finance?.aglpAvailable || '0')}
            onSubmit={handlePayoutSubmit}
        />
      </Suspense>
    </DashboardLayout>
  );
};

export default AgentDashboard;
