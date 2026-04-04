import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

interface TransferMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  referrals: any[];
  onSuccess: () => void;
}

export const TransferMatchModal: React.FC<TransferMatchModalProps> = ({
  isOpen,
  onClose,
  matchId,
  referrals,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredReferrals = referrals.filter((ref) =>
    ref.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransfer = async () => {
    if (!selectedAgentId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.patch(`/transactions/${matchId}/transfer`, {
        toAgentId: selectedAgentId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 font-sans"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Transfer Assignment</h2>
                <p className="text-slate-500 text-sm font-medium">Select a referred agent to handle this job.</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search referrals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all font-medium"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {filteredReferrals.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      selectedAgentId === agent.id
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                         selectedAgentId === agent.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                         {agent.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${selectedAgentId === agent.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {agent.fullName}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          {agent.role}
                        </p>
                      </div>
                    </div>
                    {selectedAgentId === agent.id && (
                       <ShieldCheck className="w-5 h-5 text-indigo-600 animate-in fade-in zoom-in" />
                    )}
                  </button>
                ))}
                {filteredReferrals.length === 0 && (
                   <div className="text-center py-8 text-slate-400 italic text-sm">
                      No matching referrals found.
                   </div>
                )}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                  {error}
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedAgentId || isSubmitting}
                  onClick={handleTransfer}
                  className={`flex-1 px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                    !selectedAgentId || isSubmitting
                      ? 'bg-slate-100 text-slate-400 shadow-none'
                      : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isSubmitting ? 'Transferring...' : (
                     <React.Fragment>
                        Confirm Transfer
                        <ArrowRight className="w-4 h-4" />
                     </React.Fragment>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransferMatchModal;
