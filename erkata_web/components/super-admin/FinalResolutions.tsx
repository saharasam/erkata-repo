import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Zap,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface Feedback {
  content: string;
  rating: number;
  author: {
    fullName: string;
    role: string;
  };
}

interface Proposal {
  id: string;
  proposedText: string;
  proposedBy: {
    fullName: string;
  };
  createdAt: string;
}

interface Bundle {
  id: string;
  transactionId: string;
  transaction: {
    amount: number;
    feedbacks: Feedback[];
    match: {
      request: {
        category: string;
        woreda: string;
      }
    }
  };
  proposals: Proposal[];
  createdAt: string;
}

const FinalResolutions: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            // Super Admins should see all proposed cases for finalization
            const res = await api.get('/mediation/bundles?state=PROPOSED');
            setBundles(res.data);
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to fetch pending resolutions.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBundles();
    }, []);

    const activeProposal = selectedBundle?.proposals[0];
    const highRiskThreshold = 100000; // This should ideally come from global config
    const isHighRisk = selectedBundle && Number(selectedBundle.transaction.amount) >= highRiskThreshold;

    const handleAction = async (approved: boolean) => {
        if (!activeProposal) return;
        
        if (!approved && comment.length < 10) {
            showAlert({
                title: 'Record Required',
                message: 'A detailed reason (min 10 chars) is mandatory for rejections to preserve the audit trail.',
                type: 'error'
            });
            return;
        }

        const confirmed = await showConfirm({
            title: approved ? 'SEAL RESOLUTION' : 'REJECT PROPOSAL',
            message: approved 
                ? 'By sealing this resolution, you are issuing a binding decision. Payouts and strikes will be executed immediately.'
                : 'Rejecting this proposal will send it back to the operational Admin for revision.',
            confirmText: approved ? 'Seal & Execute' : 'Confirm Rejection',
            type: approved ? 'success' : 'error'
        });

        if (confirmed) {
            try {
                await api.post(`/mediation/proposal/${activeProposal.id}/finalize`, {
                    approved,
                    comment
                });
                showAlert({
                    title: 'Decision Executed',
                    message: `Resolution for ${selectedBundle?.id} has been recorded and encrypted.`,
                    type: 'success'
                });
                setSelectedBundle(null);
                setComment('');
                fetchBundles();
            } catch (error) {
                showAlert({ title: 'Execution Failed', message: 'System was unable to finalize the resolution.', type: 'error' });
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-indigo-600" />
                        Appellate Decision Chamber
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">Highest authority tier. Every action is logged in the permanent ledger.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm shadow-indigo-100/50">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900">Encrypted Session Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Cases Queue */}
                <div className="w-1/3 flex flex-col space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting Finalization</h3>
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{bundles.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                            ))
                        ) : bundles.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400">Queue Cleared</p>
                            </div>
                        ) : (
                            bundles.map((bundle) => {
                                const amount = Number(bundle.transaction.amount);
                                const isCritical = amount >= highRiskThreshold;
                                return (
                                    <button
                                        key={bundle.id}
                                        onClick={() => setSelectedBundle(bundle)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                                            selectedBundle?.id === bundle.id 
                                            ? 'bg-white border-indigo-300 shadow-xl ring-1 ring-indigo-200' 
                                            : 'bg-white/60 border-slate-100 hover:bg-white hover:border-indigo-100'
                                        }`}
                                    >
                                        {isCritical && (
                                            <div className="absolute top-0 right-0 p-1">
                                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">CASE {bundle.id.split('-')[0]}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(bundle.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xs font-black text-slate-900 mb-1">{bundle.transaction.match.request.category}</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-slate-500">{amount.toLocaleString()} ETB</span>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                isCritical ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {isCritical ? 'High Risk' : 'Standard'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Verdict Panel */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedBundle ? (
                            <motion.div 
                                key={selectedBundle.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col p-8"
                            >
                                <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Case Overview</h2>
                                            {isHighRisk && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                                                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Escalated Risk</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-400">Transaction Ref: <span className="text-indigo-600">{selectedBundle.transactionId}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-900">{Number(selectedBundle.transaction.amount).toLocaleString()} <span className="text-sm font-bold text-slate-400">ETB</span></div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">Total Exposure</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                Proposed Verdict
                                            </h3>
                                            <div className="bg-indigo-50/50 border-2 border-indigo-100 p-6 rounded-3xl relative">
                                                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">
                                                    Submitted by Admin: {activeProposal?.proposedBy.fullName}
                                                </div>
                                                <p className="text-sm font-bold text-indigo-950 leading-relaxed italic">
                                                    "{activeProposal?.proposedText}"
                                                </p>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Evidentiary Feedback</h3>
                                            <div className="space-y-4">
                                                {selectedBundle.transaction.feedbacks.map((f, i) => (
                                                    <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${f.author.role === 'agent' ? 'bg-indigo-500' : 'bg-green-500'}`} />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase">{f.author.role} : {f.author.fullName}</span>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                {Array(5).fill(0).map((_, idx) => (
                                                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx < f.rating ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700 leading-relaxed">"{f.content}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System Intelligence</h3>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                            <History className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900">Chain of Custody</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">View full immutable audit trail</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                                </div>
                                                
                                                <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                            <AlertTriangle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-900">Strike Verification</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap">Historical disputes for this Agent: 1</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                                                <MessageSquare className="w-12 h-12" />
                                            </div>
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Official Decision Log</label>
                                            <textarea 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Document the legal rationale for this override or finalization..."
                                                className="w-full h-32 bg-slate-900 border-none outline-none rounded-2xl p-5 text-sm font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                                            />
                                        </section>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                                    <button 
                                        onClick={() => handleAction(true)}
                                        className="flex-[2] bg-indigo-600 hover:bg-slate-950 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 transition-all uppercase tracking-widest text-xs"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        Issue Final Writ & Execute
                                    </button>
                                    <button 
                                        onClick={() => handleAction(false)}
                                        className="flex-1 bg-white border-2 border-slate-100 text-slate-400 hover:border-red-400 hover:text-red-700 font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all text-xs"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject Proposal
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
                                    <ShieldCheck className="w-24 h-24 mb-6 mx-auto opacity-[0.03] text-indigo-600" />
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Registry Selection Needed</h3>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed px-6">
                                        Select a proposed mediation case from the queue to review evidence and issue a final system directive.
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
