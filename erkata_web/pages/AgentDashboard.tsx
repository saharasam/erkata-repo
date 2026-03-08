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
  ArrowDownRight
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

type DashboardView = 'focus' | 'earnings' | 'network' | 'territory' | 'profile';

const AgentDashboard: React.FC = () => {
  const { showConfirm, showAlert } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') as DashboardView) || 'focus';
  const [profile, setProfile] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      status: m.status === 'accepted' ? 'in-progress' : 
              m.status === 'completed' ? 'completed' : 
              m.status === 'assigned' ? 'assigned' : 'cancelled'
    }));
  };

  const setView = (newView: DashboardView) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('view', newView);
      return p;
    });
  };

  const [activeTab, setActiveTab] = useState<'assigned' | 'in-progress' | 'history'>('assigned');
  const [requests, setRequests] = useState<any[]>([]);
  const [feedbackRequest, setFeedbackRequest] = useState<{id: string, transactionId: string, customerName: string} | null>(null);

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
    const confirmed = await showConfirm({
      title: 'Request Payout',
      message: `Withdraw ${finance?.balance || '0.00'} ETB to your linked Telebirr account?`,
      confirmText: 'Confirm Withdrawal',
      type: 'success'
    });

    if (confirmed) {
      // In a real app, we'd call an API here
      showAlert({
        title: 'Payout Requested',
        message: 'Your request is being processed by the regional admin.',
        type: 'success'
      });
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
        rating: data.rating
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

  // Sidebar Navigation
  const sidebarContent = (
    <div className="space-y-1">
      {[
        { icon: FileText, label: 'Focus Board', id: 'focus' },
        { icon: TrendingUp, label: 'Earnings', id: 'earnings' },
        { icon: Users, label: 'My Network', id: 'network' },
        { icon: MapPin, label: 'Territory', id: 'territory' },
        { icon: User, label: 'Profile', id: 'profile' },
      ].map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setView(item.id as DashboardView)}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
            view === item.id
              ? 'bg-erkata-primary/10 text-erkata-primary font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <item.icon className={`w-4 h-4 ${view === item.id ? 'text-erkata-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span>{item.label}</span>
          {view === item.id && <motion.div layoutId="activeDot" className="ml-auto w-1.5 h-1.5 rounded-full bg-erkata-primary" />}
        </motion.button>
      ))}
    </div>
  );

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
            <span className="text-sm font-medium text-slate-400">ETB</span>
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

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'assigned') return req.status === 'assigned';
    if (activeTab === 'in-progress') return req.status === 'in-progress';
    if (activeTab === 'history') return req.status === 'completed';
    return true; 
  });

  return (
    <DashboardLayout
      role="agent"
      sidebarContent={sidebarContent}
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
            <>
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Focus Board</h1>
                  <p className="text-slate-500 font-medium font-sans">Manage your assignments and track your daily goals.</p>
                </div>
                <Can perform={Action.REQUEST_PAYOUT}>
                  <button 
                    onClick={handlePayoutRequest}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Request Payout
                  </button>
                </Can>
              </div>

              <motion.div 
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                {[
                  { label: "Pending", value: requests.filter(r => r.status === 'assigned').length, color: "blue" },
                  { label: "In Progress", value: requests.filter(r => r.status === 'in-progress').length, color: "orange" },
                  { label: "Completed", value: requests.filter(r => r.status === 'completed').length, color: "green" },
                  { label: "Rate", value: "94%", color: "emerald", sub: "Top 5%" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 }
                    }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden"
                  >
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider z-10">{stat.label}</p>
                    <div className="flex items-end gap-2 z-10">
                      <span className={`text-2xl font-black ${stat.color === 'emerald' ? 'text-green-600' : 'text-slate-800'}`}>
                        {stat.value}
                      </span>
                      {stat.sub && <span className="text-[10px] font-bold text-green-600/60 mb-1">{stat.sub}</span>}
                      {!stat.sub && <div className={`w-1.5 h-1.5 rounded-full mb-1.5 bg-${stat.color}-500`} />}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200/60 mb-6">
                {['assigned', 'in-progress', 'history'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`pb-3 text-sm font-bold capitalize relative transition-colors ${
                       activeTab === tab ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                     }`}
                   >
                     {tab.replace('-', ' ')}
                     {activeTab === tab && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 rounded-full"
                         />
                      )}
                   </button>
                ))}
              </div>

              {/* Request Grid */}
              <motion.div 
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 xl:grid-cols-2 gap-4"
              >
                <AnimatePresence mode='popLayout'>
                  {filteredRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                       <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                          request.status === 'assigned' ? 'bg-blue-500' : 
                          request.status === 'in-progress' ? 'bg-orange-500' : 
                          request.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'
                       }`} />

                       <div className="pl-3">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                      {request.id}
                                   </span>
                                   <span className="text-[10px] font-bold text-slate-400 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {request.submittedTime}
                                   </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-erkata-primary transition-colors">
                                   {request.requirementSummary}
                                </h3>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-5">
                             <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer</span>
                                <span className="text-sm font-semibold text-slate-700">{request.customerName}</span>
                             </div>
                             <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Location</span>
                                <span className="text-sm font-semibold text-slate-700">{request.woreda}</span>
                             </div>
                          </div>

                          <div className="flex gap-3">
                            {request.status === 'assigned' && (
                              <Can perform={Action.ACCEPT_REQUEST}>
                                <button 
                                  onClick={() => handleAccept(request.id)}
                                  className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                  Accept Request
                                </button>
                              </Can>
                            )}
                            {request.status === 'in-progress' && (
                               <Can perform={Action.SUBMIT_PROOF}>
                                 <button 
                                    onClick={() => handleCompleteClick(request.id, request.transactionId, request.customerName)}
                                    className="flex-1 bg-erkata-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-erkata-secondary transition-colors"
                                 >
                                    Complete & Confirm
                                 </button>
                               </Can>
                            )}
                            {request.status === 'completed' && (
                               <div className="w-full py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Completed
                               </div>
                            )}
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}

          {view === 'earnings' && (
            <WalletSummary finance={finance} onPayoutRequest={handlePayoutRequest} />
          )}

          {view === 'profile' && (
            <ProfileView profile={profile} />
          )}

          {(view === 'network' || view === 'territory') && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  {view === 'network' ? <Users className="w-8 h-8 opacity-20" /> : <MapPin className="w-8 h-8 opacity-20" />}
               </div>
               <h2 className="text-xl font-bold text-slate-600 capitalize">{view} View</h2>
               <p className="text-sm">Extended {view} metrics and management features are coming soon.</p>
            </div>
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
    </DashboardLayout>
  );
};

export default AgentDashboard;
