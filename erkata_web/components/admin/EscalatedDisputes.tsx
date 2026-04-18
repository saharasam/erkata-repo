import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, CheckCircle2, Phone, User, ExternalLink, Loader2, X, MessageSquare, ShieldCheck, RotateCcw } from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const EscalatedDisputes: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const { refreshNotifications } = useNotifications();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
    const [showResolutionDesk, setShowResolutionDesk] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchDisputes = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/transactions');
                // Admin sees all transactions, filter for escalated requests
                const escalated = res.data.filter((tx: any) => tx.request?.isEscalated);
                setDisputes(escalated || []);
            } catch (error) {
                console.error('Failed to fetch escalated disputes:', error);
                showAlert({ title: 'Error', message: 'Failed to load escalated disputes.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDisputes();
    }, [showAlert]);

    const handleResolve = async () => {
        if (!selectedDispute) return;

        const confirmed = await showConfirm({
            title: 'Confirm Resolution',
            message: 'Have you contacted the customer and agent and reached a settlement? This will officially mark the request as resolved and fulfilled.',
            confirmText: 'Mark Resolved',
            type: 'success'
        });

        if (!confirmed) return;

        setIsProcessing(true);
        try {
            await api.patch(`/requests/${selectedDispute.request.id}/resolve-dispute`);
            
            // UI Update
            setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
            setShowResolutionDesk(false);
            setSelectedDispute(null);
            
            showAlert({ 
                title: 'Dispute Resolved', 
                message: 'The request has been successfully resolved and closed.', 
                type: 'success' 
            });
            await refreshNotifications();
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
            showAlert({ title: 'Error', message: 'Failed to update dispute status.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoid = async () => {
        if (!selectedDispute) return;

        const confirmed = await showConfirm({
            title: 'Void Fulfillment',
            message: "Reject this fulfillment attempt and return the job to the agent's dash for a redo? This counts as a formal resolution to the dispute.",
            confirmText: 'Void & Redo',
            type: 'warning'
        });

        if (!confirmed) return;

        setIsProcessing(true);
        try {
            await api.patch(`/requests/${selectedDispute.request.id}/void-dispute`, {
                note: 'Voided by Admin at Escalation Desk.'
            });
            
            // UI Update
            setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
            setShowResolutionDesk(false);
            setSelectedDispute(null);
            
            showAlert({ 
                title: 'Fulfillment Voided', 
                message: 'The agent has been notified and the request returned for a redo.', 
                type: 'info' 
            });
            await refreshNotifications();
        } catch (error) {
            console.error('Failed to void dispute:', error);
            showAlert({ title: 'Error', message: 'Failed to void fulfillment.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 relative min-h-[600px]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Escalation Desk</h2>
                    <p className="text-slate-500 text-sm font-medium">Mediate disputes transferred from operators.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Pending Medation</span>
                    <span className="text-lg font-black text-indigo-600">{disputes.length}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white rounded-3xl border border-slate-50 animate-pulse" />
                    ))}
                </div>
            ) : disputes.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-100">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Clean Slate</h3>
                    <p className="text-slate-500 font-medium">All escalated disputes have been resolved.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {disputes.map(tx => (
                        <motion.div 
                            layoutId={tx.id}
                            key={tx.id}
                            onClick={() => {
                                setSelectedDispute(tx);
                                setShowResolutionDesk(true);
                            }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
                            
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full tracking-widest">
                                    Escalated
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">
                                    #{tx.id.split('-')[0].toUpperCase()}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-tight">
                                {tx.request?.description || 'Service Dispute'}
                            </h4>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <User className="w-4 h-4" />
                                    <span className="text-xs font-bold">{tx.request?.customer?.fullName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                    <p className="text-[11px] font-medium italic line-clamp-1">
                                        "{tx.request?.metadata?.escalationNote || 'No operator note'}"
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Review Details
                                </span>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Resolution Desk Modal */}
            <AnimatePresence>
                {showResolutionDesk && selectedDispute && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 bg-slate-50 border-b border-slate-100 relative">
                                <button 
                                    onClick={() => setShowResolutionDesk(false)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Resolution Desk</h3>
                                        <p className="text-sm font-medium text-slate-500">Service Mediation Flow</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                                {/* Operator Context */}
                                <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Operator Escalation Note</span>
                                    </div>
                                    <p className="text-slate-700 font-bold italic text-base leading-relaxed">
                                        "{selectedDispute.request?.metadata?.escalationNote || 'No specific reasoning provided by the operator.'}"
                                    </p>
                                    <p className="text-[10px] font-bold text-indigo-400 mt-4 uppercase">
                                        Escalated on: {new Date(selectedDispute.request?.metadata?.escalatedAt).toLocaleString()}
                                    </p>
                                </div>

                                {/* Contact Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Card */}
                                    <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] flex flex-col justify-between">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                                <h5 className="text-base font-black text-slate-900">{selectedDispute.request?.customer?.fullName}</h5>
                                            </div>
                                        </div>
                                        <div className="mt-auto">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                                            <a 
                                                href={`tel:${selectedDispute.request?.customer?.phone}`}
                                                className="text-lg font-black text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                {selectedDispute.request?.customer?.phone || 'Private Number'}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Agent Card */}
                                    <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] flex flex-col justify-between">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Agent</p>
                                                <h5 className="text-base font-black text-slate-900">{selectedDispute.agent?.fullName}</h5>
                                            </div>
                                        </div>
                                        <div className="mt-auto">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                                            <a 
                                                href={`tel:${selectedDispute.agent?.phone}`}
                                                className="text-lg font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                                            >
                                                {selectedDispute.agent?.phone || 'Private Number'}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                    <p className="text-[11px] font-bold text-rose-800 leading-tight uppercase">
                                        Off-platform action required: You must call both parties to reach a manual resolution before marking this as resolved on Erkata.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-4">
                                <button 
                                    onClick={() => setShowResolutionDesk(false)}
                                    className="px-6 py-4 bg-white text-slate-600 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleVoid}
                                    disabled={isProcessing}
                                    className="px-6 py-4 bg-amber-100 text-amber-700 font-black rounded-2xl hover:bg-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                    Void & Request Redo
                                </button>
                                <button 
                                    onClick={handleResolve}
                                    disabled={isProcessing}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Resolve Dispute
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EscalatedDisputes;
