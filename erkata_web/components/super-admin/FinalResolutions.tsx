import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  ChevronRight,
  History,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../contexts/ModalContext';

interface ProposedBundle {
  id: string;
  adminName: string;
  daysWaiting: number;
  proposedOutcome: string;
  originalFeedback: {
    agent: string;
    requestor: string;
  };
  transactionHistory: number; // item count
  woreda: string;
}

const MOCK_PROPOSALS: ProposedBundle[] = [
  {
    id: 'BND-7762',
    adminName: 'Sarah Tekle',
    daysWaiting: 4,
    proposedOutcome: 'Approve full payout and 5% Tier-1 bonus for Dawit L. Fulfillment verified for Bole Apartment.',
    originalFeedback: {
      agent: 'Verified all documents with Wereda 03. Customer confirmed receipt.',
      requestor: 'Agent was helpful but the zoning document took longer than expected.'
    },
    transactionHistory: 12,
    woreda: 'Bole'
  },
  {
    id: 'BND-9012',
    adminName: 'Sarah Tekle',
    daysWaiting: 1,
    proposedOutcome: 'Approve completion. Reissue commission to Hanna G. for custom furniture fulfillment.',
    originalFeedback: {
      agent: 'Sofa delivered as per mahogany specs. Photo proof uploaded.',
      requestor: 'The finish is great. Prompt delivery.'
    },
    transactionHistory: 5,
    woreda: 'Kirkos'
  }
];

const FinalResolutions: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [selectedBundle, setSelectedBundle] = useState<ProposedBundle | null>(null);
    const [comment, setComment] = useState('');

    const handleAction = async (type: 'approve' | 'reject' | 'revise') => {
        if ((type === 'reject' || type === 'revise') && comment.length < 10) {
            showAlert({
                title: 'Action Blocked',
                message: 'A mandatory comment (min 10 characters) is required for rejections or revision requests.',
                type: 'error'
            });
            return;
        }

        const confirmed = await showConfirm({
            title: `Confirm ${type.toUpperCase()}`,
            message: `Are you sure you want to ${type} this resolution? This action is permanent and will be logged.`,
            confirmText: `Yes, ${type}`,
            type: type === 'approve' ? 'success' : type === 'reject' ? 'error' : 'warning'
        });

        if (confirmed) {
            showAlert({
                title: 'Success',
                message: `Resolution for ${selectedBundle?.id} has been ${type}ed.`,
                type: 'success'
            });
            setSelectedBundle(null);
            setComment('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-6">
                {/* List Panel */}
                <div className="w-1/3 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Awaiting Final Switch</h3>
                    <div className="space-y-3">
                        {MOCK_PROPOSALS.map((bundle) => (
                            <button
                                key={bundle.id}
                                onClick={() => setSelectedBundle(bundle)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                    selectedBundle?.id === bundle.id 
                                    ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                                    : 'bg-white/40 border-slate-100 hover:bg-white hover:border-slate-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-black text-slate-900 tracking-tighter">{bundle.id}</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                        <Clock className="w-3 h-3" /> {bundle.daysWaiting}d
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-slate-700 mb-1 truncate">{bundle.woreda} Zone Escalation</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                    <User className="w-3 h-3" /> Prop: {bundle.adminName}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {selectedBundle ? (
                            <motion.div 
                                key={selectedBundle.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col p-8"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBundle.id}</h2>
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded border border-indigo-100 italic">
                                                Final Resolution Phase
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium italic">Proposed by Admin: {selectedBundle.adminName}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audit Ready</div>
                                        <div className="flex gap-1 justify-end">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Proposed Outcome</label>
                                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm font-semibold text-amber-900 leading-relaxed shadow-sm">
                                                {selectedBundle.proposedOutcome}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Original Feedback</label>
                                            <div className="space-y-3">
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Agent</span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium italic">"{selectedBundle.originalFeedback.agent}"</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Requestor</span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium italic">"{selectedBundle.originalFeedback.requestor}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 border-l border-slate-100 pl-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Authority Verification</label>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                    <FileText className="w-5 h-5 text-indigo-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-slate-700">Audit Log Extract</p>
                                                        <p className="text-[10px] text-slate-400">{selectedBundle.transactionHistory} system events detected</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                                    <History className="w-5 h-5 text-indigo-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-slate-700">Resolution History</p>
                                                        <p className="text-[10px] text-slate-400">Previous mediations for customer: 0</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Decision Log (Required for Rejects)</label>
                                             <textarea 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Enter permanent decision record..."
                                                className="w-full h-32 bg-slate-800 border-none outline-none rounded-xl p-4 text-sm font-medium placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                             />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-slate-100 pt-8 flex gap-4">
                                    <button 
                                        onClick={() => handleAction('approve')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-all"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Final Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction('revise')}
                                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                                    >
                                        <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        Request Revision
                                    </button>
                                    <button 
                                        onClick={() => handleAction('reject')}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 transition-all"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Final Reject
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="max-w-xs"
                                >
                                    <ShieldCheck className="w-20 h-20 mb-6 mx-auto opacity-10" />
                                    <h3 className="text-xl font-bold text-slate-400 mb-2 whitespace-nowrap">Select a Case to Resolve</h3>
                                    <p className="text-xs font-medium leading-relaxed opacity-60">
                                        Ultimate authority dashboard. Your decisions are logged permanently in the system.
                                    </p>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default FinalResolutions;
