import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Loader2,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  User,
  Shield,
  MessageSquare
} from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useSocket } from '../../contexts/SocketContext';

const UpgradeVerificationsBoard: React.FC = () => {
  const { showAlert, showConfirm } = useModal();
  const { socket } = useSocket();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullPreview, setFullPreview] = useState<string | null>(null);

  useEffect(() => {
// ... (omitted for brevity, will keep existing logic)
    fetchRequests();
    
    // Setup socket listener for real-time updates
    if (socket) {
        const handleNotification = (notification: any) => {
            if (notification.type === 'upgrade.submitted') {
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
      const response = await api.get('/upgrades/pending');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedRequest || !verificationNote.trim()) return;

    const confirmed = await showConfirm({
      title: 'Request Approval',
      message: `Are you sure you have verified the payment for ${selectedRequest.agent?.fullName}? This will send the request to Super Admin for final approval.`,
      confirmText: 'Yes, Request Approval',
      type: 'info'
    });

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await api.patch(`/upgrades/${selectedRequest.id}/verify`, { internalNote: verificationNote });
        showAlert({ title: 'Verified', message: 'Verification complete. Request forwarded to Admin.', type: 'success' });
        setSelectedRequest(null);
        setVerificationNote('');
        fetchRequests();
      } catch (error: any) {
        showAlert({ title: 'Error', message: error.response?.data?.message || 'Failed to verify request.', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
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
        <p className="text-xs font-bold uppercase tracking-widest">Loading Worklist...</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Worklist Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4 mb-2 px-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by agent name or request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Pending Verification</h3>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
              {filteredRequests.length} Requests
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-6 hover:bg-slate-50/50 transition-all cursor-pointer group ${selectedRequest?.id === req.id ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{req.agent?.fullName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{req.agent?.currentTier}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{req.targetTier}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <Clock className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                        req.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400 italic">Worklist is clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Column */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {selectedRequest ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 sticky top-8"
            >
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Request Details</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Agent Information</p>
                    <p className="font-bold text-slate-800">{selectedRequest.agent?.fullName}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.agent?.email}</p>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Upgrade Path</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-400 uppercase">{selectedRequest.agent?.currentTier}</span>
                      <ChevronRight className="w-4 h-4 text-indigo-300" />
                      <span className="text-xs font-black text-indigo-600 uppercase">{selectedRequest.targetTier}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Proof</h4>
                  {selectedRequest.proofUrl && (
                    <button 
                      onClick={() => setFullPreview(selectedRequest.proofUrl)}
                      className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      VIEW FULL <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {selectedRequest.proofUrl ? (
                  <div 
                    onClick={() => setFullPreview(selectedRequest.proofUrl)}
                    className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 group relative cursor-pointer"
                  >
                    <img src={selectedRequest.proofUrl} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest">Click to Expand</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Proof Uploaded</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Verification Note</label>
                  <textarea 
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Enter transaction reference or notes..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={isSubmitting || !verificationNote.trim() || !selectedRequest.proofUrl}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  Request Approval
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center sticky top-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400 italic">Select a request to view details</p>
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

export default UpgradeVerificationsBoard;
