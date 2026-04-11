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

import FeedbackForm, { FeedbackData } from '../components/FeedbackForm';
import WalletSummary from '../components/agent/WalletSummary';
import ProfileView from '../components/agent/ProfileView';
import { PackageSelection } from '../components/agent/PackageSelection';
import { PackagesView } from '../components/agent/PackagesView';
import { NetworkView } from '../components/agent/NetworkView';
import { FocusBoard } from '../components/agent/FocusBoard';
import { Skeleton } from '../components/ui/Skeleton';
import TransferMatchModal from '../components/agent/TransferMatchModal';

type DashboardView = 'focus' | 'earnings' | 'network' | 'packages' | 'profile';

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

  useEffect(() => {
    fetchData();
  }, []);


  const mapBackendJobsToUi = (matches: any[]): any[] => {
    return matches.map(m => ({
      id: m.id,
      transactionId: m.transaction?.id,
      submittedDate: new Date(m.assignedAt).toLocaleDateString(),
      submittedTime: new Date(m.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requirementSummary: `${m.request.category}: ${m.request.description || 'No description provided'}`,
      customerName: m.request.customer.fullName,
      zone: m.request.zone?.name || 'Unknown',
      woreda: m.request.woreda || 'N/A',
      status: m.request.status === 'assigned' ? 'assigned' : 
              m.request.status === 'fulfilled' ? 'fulfilled' : 
              m.request.status === 'disputed' ? 'disputed' : 'pending'
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
  const [feedbackRequest, setFeedbackRequest] = useState<{id: string, transactionId: string, customerName: string} | null>(null);
  const [transferringJobId, setTransferringJobId] = useState<string | null>(null);

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
        await api.patch(`/transactions/${jobId}/decline`);
        setRequests(prev => prev.filter(req => req.id !== jobId));
        showAlert({ title: 'Success', message: 'Assignment declined.', type: 'success' });
      } catch (error) {
        console.error('Failed to decline job:', error);
        showAlert({ title: 'Error', message: 'Failed to decline assignment.', type: 'error' });
      }
    }
  };

  const handleAccept = async (jobId: string) => {
    try {
      await api.patch(`/transactions/${jobId}/accept`);
      setRequests(prev => prev.map(req => 
        req.id === jobId ? { ...req, status: 'in-progress' } : req
      ));
      showAlert({
        title: 'Assignment Accepted',
        message: 'Customer details have been unlocked. You can now start the fulfillment.',
        type: 'success'
      });
    } catch (error) {
       console.error('Failed to accept job:', error);
       showAlert({ title: 'Error', message: 'Failed to accept assignment.', type: 'error' });
    }
  };

  const handlePayoutRequest = async () => {
    const available = finance?.aglpAvailable || 0;
    if (available <= 0) {
      showAlert({ title: 'Insufficient Balance', message: 'You do not have any withdrawable AGLP.', type: 'error' });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Request Payout',
      message: `Withdraw your available ${available.toLocaleString()} AGLP to your linked Telebirr account?`,
      confirmText: 'Confirm Withdrawal',
      type: 'success'
    });

    if (confirmed) {
      try {
        await api.post('/users/me/withdraw', { amount: available });
        showAlert({
          title: 'Payout Requested',
          message: 'Your request is being processed by the regional admin.',
          type: 'success'
        });
        // Refresh finance data
        const financeRes = await api.get('/users/me/finance');
        setFinance(financeRes.data);
      } catch (error) {
        console.error('Failed to request payout:', error);
        showAlert({ title: 'Error', message: 'Failed to submit withdrawal request.', type: 'error' });
      }
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
        await api.patch(`/transactions/${jobId}/complete`);
        setFeedbackRequest({ id: jobId, transactionId, customerName });
      } catch (error) {
        console.error('Failed to complete job:', error);
        showAlert({ title: 'Error', message: 'Failed to mark job as complete.', type: 'error' });
      }
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackData) => {
    try {
      if (!feedbackRequest?.transactionId) return;
      
      await api.post(`/mediation/transaction/${feedbackRequest.transactionId}/feedback`, {
        content: data.comment,
        rating: data.rating,
        categories: data.categories
      });

      setRequests(prev => prev.map(req => 
        req.id === feedbackRequest.id ? { ...req, status: 'completed' } : req
      ));
      setFeedbackRequest(null);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showAlert({ title: 'Error', message: 'Feedback submitted locally, but failed to sync with mediation server.', type: 'error' });
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
        </motion.div>
      </AnimatePresence>

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
        {feedbackRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackRequest(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <FeedbackForm
              requestId={feedbackRequest.id}
              recipientName={feedbackRequest.customerName}
              role="agent"
              onClose={() => setFeedbackRequest(null)}
              onSubmit={handleFeedbackSubmit}
            />
          </div>
        )}
      </AnimatePresence>

      <TransferMatchModal
        isOpen={!!transferringJobId}
        onClose={() => setTransferringJobId(null)}
        matchId={transferringJobId || ''}
        referrals={profile?.referrals || []}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
};

export default AgentDashboard;
