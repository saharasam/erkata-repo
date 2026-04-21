import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  MapPin, 
  User, 
  Bell,
  CheckCircle,
  PlayCircle,
  Upload,
  ArrowUpRight,
  Clock,
  Briefcase,
  Filter,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  agentEarnings as mockEarnings, 
  agentReferrals as mockReferrals 
} from '../utils/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../contexts/ModalContext';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import { useSocket } from '../contexts/SocketContext';

import WalletSummary from '../components/agent/WalletSummary';
import ProfileView from '../components/agent/ProfileView';
import { PackageSelection } from '../components/agent/PackageSelection';
import { PackagesView } from '../components/agent/PackagesView';
import { NetworkView } from '../components/agent/NetworkView';
import { FocusBoard } from '../components/agent/FocusBoard';
import { Skeleton } from '../components/ui/Skeleton';
import TransferMatchModal from '../components/agent/TransferMatchModal';
import PayoutRequestModal from '../components/agent/PayoutRequestModal';
import BroadcastInbox from '../components/shared/BroadcastInbox';

type DashboardView = 'focus' | 'earnings' | 'network' | 'packages' | 'profile' | 'notices';

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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasSkippedPackageSelection, setHasSkippedPackageSelection] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const [profileRes, financeRes, jobsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me/finance'),
        api.get('/transactions/my-jobs')
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
      budgetMax: m.request.budgetMax || '0',
      metadata: m.request.metadata || {},
      status: m.status // assigned, accepted, completed, rejected
    }));
  };

  const setView = (newView: DashboardView) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('view', newView);
      return p;
    });
  };

  const [requests, setRequests] = useState<any[]>([]);
  const [transferringJobId, setTransferringJobId] = useState<string | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const addProcessingId = (id: string) => setProcessingIds(prev => new Set(prev).add(id));
  const removeProcessingId = (id: string) => setProcessingIds(prev => {
    const next = new Set(prev);
    next.delete(id);
    return next;
  });

  const handleTransferClick = (jobId: string) => {
    setTransferringJobId(jobId);
  };

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
      } catch (error) {
        console.error('Failed to decline job:', error);
        showAlert({ title: 'Error', message: 'Failed to decline assignment.', type: 'error' });
      } finally {
        removeProcessingId(jobId);
      }
    }
  };

  const handleAccept = async (jobId: string) => {
    try {
      addProcessingId(jobId);
      await api.patch(`/transactions/${jobId}/accept`);
      
      // Perform a silent refresh of specifically the jobs to get un-redacted customer details
      const jobsRes = await api.get('/transactions/my-jobs');
      setRequests(mapBackendJobsToUi(jobsRes.data));

      showAlert({
        title: 'Assignment Accepted',
        message: 'Customer details have been unlocked. You can now start the fulfillment.',
        type: 'success'
      });
    } catch (error) {
       console.error('Failed to accept job:', error);
       showAlert({ title: 'Error', message: 'Failed to accept assignment.', type: 'error' });
    } finally {
      removeProcessingId(jobId);
    }
  };

  const handlePayoutRequest = async () => {
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
      // Refresh finance data
      const financeRes = await api.get('/users/me/finance');
      setFinance(financeRes.data);
    } catch (error) {
       console.error('Failed to request payout:', error);
       throw error; // Re-throw to be caught by modal's error handler
    }
  };

  const handleStart = (requestId: string) => {
    console.log(`Started fulfillment for request ${requestId}`);
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
      } catch (error) {
        console.error('Failed to complete job:', error);
        showAlert({ title: 'Error', message: 'Failed to mark job as complete.', type: 'error' });
      } finally {
        removeProcessingId(jobId);
      }
    }
  };

  const rightPanelContent = (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-20 h-20" />
         </div>
         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Performance</p>
         <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight">{mockEarnings.today}</span>
            <span className="text-sm font-medium text-slate-400">AGLP</span>
         </div>
         <div className="mt-4 flex gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/20">
               +12% vs yest.
            </span>
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Tier</h3>
           <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {finance?.currentTier || '...'}
           </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
           <div className="relative mb-3">
              <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-600">
                 <span>Progress to {finance?.nextTier || '...'}</span>
                 <span>{finance?.usedSlots || 0}/{finance?.totalSlots || 0}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((finance?.usedSlots || 0) / (finance?.totalSlots || 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-purple-500 rounded-full" 
                 />
              </div>
           </div>
           <p className="text-[10px] text-slate-400 leading-relaxed">
              Unlock the next tier {finance?.nextTier && `(${finance.nextTier})`} to increase your commission rate and territory coverage.
           </p>
        </div>
      </motion.div>

       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
       >
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Active Territory</h3>
         <div className="bg-slate-100 rounded-2xl h-32 relative overflow-hidden group cursor-pointer border border-slate-200">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Addis_Ababa_districts.png/800px-Addis_Ababa_districts.png')] bg-cover bg-center grayscale opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-erkata-primary" />
                  <span className="text-xs font-bold text-slate-700">Addis Ababa</span>
               </div>
            </div>
         </div>
       </motion.div>
    </div>
  );


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
        <PackageSelection onComplete={fetchData} onSkip={() => setHasSkippedPackageSelection(true)} />
      </div>
    );
  }

  return (
    <DashboardLayout
      role="agent"
      sidebarContent={null}
      currentView={view}
      onViewChange={(newView) => setView(newView as DashboardView)}
      rightPanelContent={rightPanelContent}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'focus' && (
             <FocusBoard 
                requests={requests} 
                onAccept={handleAccept} 
                onComplete={handleCompleteClick}
                onTransfer={handleTransferClick}
                onDecline={handleDecline}
                hasReferrals={!!profile?.referrals?.length}
                processingIds={processingIds}
             />
          )}

          {view === 'earnings' && (
            <WalletSummary finance={finance} onPayoutRequest={handlePayoutRequest} />
          )}

          {view === 'profile' && (
            <ProfileView profile={profile} />
          )}

          {view === 'packages' && profile && finance && (
             <PackagesView 
                finance={finance} 
                profile={profile} 
                onUpgradeComplete={fetchData} 
             />
          )}

          {view === 'network' && (
             <NetworkView 
                profile={profile} 
                finance={finance} 
                onNavigateToPackages={() => setView('packages')} 
             />
          )}

          {view === 'notices' && (
             <BroadcastInbox />
          )}
        </motion.div>
      </AnimatePresence>

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
    </DashboardLayout>
  );
};

export default AgentDashboard;
