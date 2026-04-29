import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  User, 
  FileText,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  MessageSquare,
  Search
} from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useSocket } from '../../contexts/SocketContext';

const UpgradeApprovalsAudit: React.FC = () => {
  const { showAlert, showConfirm } = useModal();
  const { socket } = useSocket();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [fullPreview, setFullPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    
    // Setup socket listener for real-time updates
    if (socket) {
        const handleNotification = (notification: any) => {
            if (notification.type === 'upgrade.verified') {
                fetchRequests();
            }
        };
        
        socket.on('notification', handleNotification);
        return () => {
            socket.off('notification', handleNotification);
        };
    }
  }, [socket]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/upgrades/verified');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const confirmed = await showConfirm({
      title: 'Confirm Final Approval',
      message: `You are about to approve the upgrade for ${selectedRequest.agent?.fullName} to ${selectedRequest.targetTier}. This will immediately update their account tier.`,
      confirmText: 'Approve & Activate',
      type: 'success'
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await api.patch(`/upgrades/${selectedRequest.id}/approve`);
        showAlert({ title: 'Approved', message: 'Upgrade activated successfully.', type: 'success' });
        setSelectedRequest(null);
        fetchRequests();
      } catch (error: any) {
        showAlert({ title: 'Error', message: error.response?.data?.message || 'Failed to approve upgrade.', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/upgrades/${selectedRequest.id}/reject`, { reason: rejectionReason });
      showAlert({ title: 'Rejected', message: 'Upgrade request has been rejected.', type: 'info' });
      setSelectedRequest(null);
      setRejectionReason('');
      setShowRejectionForm(false);
      fetchRequests();
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.response?.data?.message || 'Failed to reject request.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.agent?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Authenticating Worklist...</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Worklist */}
      <div className="lg:col-span-2 space-y-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by agent or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Verified by Operators</h3>
            <span className="px-3 py-1 bg-indigo-900 text-white rounded-full text-[10px] font-black uppercase">
              {filteredRequests.length} Pending Approval
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div 
                  key={req.id}
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowRejectionForm(false);
                  }}
                  className={`p-8 hover:bg-slate-50/50 transition-all cursor-pointer group ${selectedRequest?.id === req.id ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-900 group-hover:bg-indigo-900 group-hover:text-white transition-all duration-300">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{req.agent?.fullName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.agent?.currentTier}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{req.targetTier}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 uppercase mb-2">
                        <Clock className="w-3 h-3" />
                        Verified {new Date(req.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operator Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-12 h-12 text-slate-200" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">No Requests Pending</h4>
                <p className="text-sm font-medium text-slate-400">All verified upgrades have been processed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details & Actions */}
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {selectedRequest ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 space-y-10 sticky top-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Final Review</h3>
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Context</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-900 text-xs font-black">
                      {selectedRequest.operator?.fullName?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{selectedRequest.operator?.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Financial Operator</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 italic text-xs text-slate-600 leading-relaxed">
                    "{selectedRequest.internalNote || 'No operator notes provided.'}"
                  </div>
                </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Payment Proof</p>
                    {selectedRequest.proofUrl && (
                      <button 
                        onClick={() => setFullPreview(selectedRequest.proofUrl)}
                        className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        VIEW FULL <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div 
                    onClick={() => setFullPreview(selectedRequest.proofUrl)}
                    className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 group relative cursor-pointer"
                  >
                    <img src={selectedRequest.proofUrl} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                      <ExternalLink className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verify Full Document</span>
                    </div>
                  </div>
              </div>

              {!showRejectionForm ? (
                <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black tracking-tight hover:bg-slate-900 transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                    ACTIVATE UPGRADE
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={isSubmitting}
                    className="w-full py-4 text-rose-600 font-black tracking-tight hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    REJECT REQUEST
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-rose-800 leading-relaxed">
                      Rejection will notify both the agent and the operator. Please provide a clear reason.
                    </p>
                  </div>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Why is this request being rejected?..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRejectionForm(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black tracking-tight hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isSubmitting || !rejectionReason.trim()}
                      className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-black tracking-tight hover:bg-rose-700 disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center sticky top-8">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldAlert className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Awaiting Review</h4>
              <p className="text-sm font-medium text-slate-400">Select a verified request to perform the final activation.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
    
    <AnimatePresence>
      {fullPreview && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setFullPreview(null)}
          className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={fullPreview} alt="Full Proof" className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl" />
            <button 
              onClick={() => setFullPreview(null)}
              className="absolute top-0 right-0 -mt-12 text-white/60 hover:text-white transition-colors"
            >
              <XCircle className="w-8 h-8" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default UpgradeApprovalsAudit;
