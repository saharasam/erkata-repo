import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  ShieldAlert, 
  CheckCircle, 
  ArrowUpRight, 
  Loader2, 
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Info,
  RotateCcw
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const DisputesBoard: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [escalatingId, setEscalatingId] = useState<string | null>(null);
    const [escalationNote, setEscalationNote] = useState('');
    const [resolvingTx, setResolvingTx] = useState<any | null>(null);
    const [resolutionNote, setResolutionNote] = useState('');

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/transactions');
            const disputed = res.data.filter((tx: any) => tx.request?.status === 'disputed' && !tx.request?.isEscalated);
            setDisputes(disputed);
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleFinalResolve = async () => {
        if (!resolvingTx) return;

        const confirmed = await showConfirm({
            title: 'Confirm Resolution',
            message: 'Have you contacted both parties and verified the fulfillment status? This action will officially close the dispute.',
            confirmText: 'Mark Resolved',
            type: 'success'
        });

        if (confirmed) {
            setProcessingId(resolvingTx.request.id);
            try {
                await api.patch(`/requests/${resolvingTx.request.id}/resolve-dispute`, { 
                    note: resolutionNote 
                });
                showAlert({ title: 'Success', message: 'Dispute resolved successfully.', type: 'success' });
                setResolvingTx(null);
                setResolutionNote('');
                fetchDisputes();
            } catch (error) {
                console.error('Failed to resolve dispute:', error);
                showAlert({ title: 'Error', message: 'Failed to resolve dispute.', type: 'error' });
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleVoid = async () => {
        if (!resolvingTx) return;

        const confirmed = await showConfirm({
            title: 'Void & Request Redo',
            message: "This will officially void the agent's current fulfillment attempt and return the request to their active dashboard for a redo. Are you sure?",
            confirmText: 'Yes, Send Back',
            type: 'warning'
        });

        if (confirmed) {
            setProcessingId(resolvingTx.request.id);
            try {
                await api.patch(`/requests/${resolvingTx.request.id}/void-dispute`, { 
                    note: resolutionNote 
                });
                showAlert({ title: 'Voided', message: 'Fulfillment voided. Request returned to agent.', type: 'info' });
                setResolvingTx(null);
                setResolutionNote('');
                fetchDisputes();
            } catch (error) {
                console.error('Failed to void dispute:', error);
                showAlert({ title: 'Error', message: 'Failed to void dispute.', type: 'error' });
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleEscalateSubmit = async () => {
        if (!escalatingId || !escalationNote.trim()) return;
        
        setProcessingId(escalatingId);
        try {
            await api.patch(`/requests/${escalatingId}/escalate-dispute`, { note: escalationNote });
            showAlert({ title: 'Escalated', message: 'Dispute has been escalated to Admin.', type: 'info' });
            setEscalatingId(null);
            setEscalationNote('');
            fetchDisputes();
        } catch (error) {
            console.error('Failed to escalate dispute:', error);
            showAlert({ title: 'Error', message: 'Failed to escalate dispute.', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium">Loading active disputes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic">Dispute Management</h2>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full w-fit mt-1">First-level mediation hub</p>
                </div>
                <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 shadow-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-black text-rose-600 tracking-tighter">{disputes.length} PENDING MEDIATIONS</span>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-100">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Queue Clear</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">There are no active disputes requiring your attention at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {disputes.map((tx) => (
                        <div key={tx.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col md:flex-row gap-8 overflow-hidden relative group">
                             {/* Side Accent */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 group-hover:bg-indigo-600 transition-colors" />

                            <div className="flex-1 space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                        {tx.request.category}
                                    </span>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-black tracking-tight">{new Date(tx.request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                    {tx.request.description || 'Service details restricted'}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover/item:bg-indigo-50 transition-colors">
                                            <User className="w-6 h-6 text-indigo-500 group-hover/item:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Consumer</p>
                                            <p className="text-sm font-black text-slate-700">{tx.request.customer?.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover/item:bg-emerald-50 transition-colors">
                                            <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover/item:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Executor</p>
                                            <p className="text-sm font-black text-slate-700">{tx.agent?.fullName || 'UNASSIGNED'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-slate-500 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 italic font-medium">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                    <span>MEDITATION REQUIRED: Customer triggered a dispute citing incomplete or unsatisfactory fulfillment. Perform reaching out protocols.</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center gap-3 md:w-56 shrink-0 pt-4 md:pt-0">
                                <button
                                    onClick={() => setResolvingTx(tx)}
                                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Resolution Desk
                                </button>
                                <button
                                    onClick={() => setEscalatingId(tx.request.id)}
                                    className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <ArrowUpRight className="w-5 h-5 text-rose-500" />
                                    Escalate Case
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resolution Desk Modal (Operator Version) */}
            <AnimatePresence>
                {resolvingTx && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto no-scrollbar">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col my-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-8 bg-slate-50 border-b border-slate-100 relative">
                                <button 
                                    onClick={() => setResolvingTx(null)}
                                    className="absolute top-8 right-8 w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-[1.25rem] flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Resolution Desk</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Mediation Protocol</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Active Dispute Context</p>
                                    <div className="p-5 bg-white border-2 border-slate-50 rounded-2xl shadow-sm">
                                        <p className="text-lg font-bold text-slate-800 leading-tight mb-2">{resolvingTx.request.description}</p>
                                        <p className="text-xs font-medium text-slate-500">{resolvingTx.request.category} • {resolvingTx.request.zone?.name || 'Local Area'}</p>
                                    </div>
                                </div>

                                {/* Contact Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                     {/* Customer */}
                                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                         <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-indigo-600">
                                                <User className="w-5 h-5 text-indigo-500" />
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black text-slate-400 uppercase">Customer Information</p>
                                                 <p className="text-sm font-black text-slate-900">{resolvingTx.request.customer?.fullName}</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Contact</p>
                                             <a 
                                                href={`tel:${resolvingTx.request.customer?.phone}`}
                                                className="text-base font-black text-indigo-600 hover:text-indigo-700 transition-colors"
                                             >
                                                 {resolvingTx.request.customer?.phone || 'No Number'}
                                             </a>
                                         </div>
                                     </div>

                                     {/* Agent */}
                                     <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                         <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black text-slate-400 uppercase">Fulfillment Agent</p>
                                                 <p className="text-sm font-black text-slate-900">{resolvingTx.agent?.fullName}</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Agent Desk</p>
                                             <a 
                                                href={`tel:${resolvingTx.agent?.phone}`}
                                                className="text-base font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                                             >
                                                 {resolvingTx.agent?.phone || 'No Number'}
                                             </a>
                                         </div>
                                     </div>
                                </div>

                                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3 italic">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-[11px] font-bold text-blue-700 leading-tight uppercase">
                                        Verification Required: Please confirm with both parties that the fulfillment has been successfully addressed before closing this case.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                        Resolution Summary
                                        <span className="text-emerald-600 font-bold">(Mandatory)</span>
                                    </label>
                                    <textarea
                                        value={resolutionNote}
                                        onChange={(e) => setResolutionNote(e.target.value)}
                                        placeholder="Describe how the dispute was settled (e.g. Agent agreed to re-visit customer, Customer accepted a partial refund from agent outside platform...)"
                                        className="w-full h-32 p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder-slate-300 resize-none font-medium text-xs"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4">
                                <button 
                                    onClick={() => setResolvingTx(null)}
                                    className="px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    onClick={handleVoid}
                                    disabled={processingId === resolvingTx.request.id || !resolutionNote.trim()}
                                    className="px-6 py-4 bg-amber-100 text-amber-700 font-black rounded-2xl hover:bg-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {processingId === resolvingTx.request.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                    Send Back for Redo
                                </button>
                                <button 
                                    onClick={handleFinalResolve}
                                    disabled={processingId === resolvingTx.request.id || !resolutionNote.trim()}
                                    className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {processingId === resolvingTx.request.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                    Finalize Mediation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Escalation Note Modal */}
            <AnimatePresence>
                {escalatingId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto no-scrollbar">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl my-auto"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                                    <ArrowUpRight className="w-6 h-6 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 italic tracking-tight">Escalation Detail</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Context for Administration</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Describe the nature of this dispute</label>
                                <textarea
                                    autoFocus
                                    value={escalationNote}
                                    onChange={(e) => setEscalationNote(e.target.value)}
                                    placeholder="e.g. Agent denies refund despite no-show, Customer provided photo evidence of incomplete work..."
                                    className="w-full h-40 p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 placeholder-slate-300 resize-none font-medium"
                                />

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={handleEscalateSubmit}
                                        disabled={!escalationNote.trim() || processingId === escalatingId}
                                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === escalatingId ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                                        Initialize Escalation
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEscalatingId(null);
                                            setEscalationNote('');
                                        }}
                                        className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all font-medium"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DisputesBoard;
