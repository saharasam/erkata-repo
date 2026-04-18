import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, Clock, ShieldAlert, Landmark, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface PayoutRequest {
    id: string;
    amount: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    createdAt: string;
    profile: {
        id: string;
        fullName: string;
        phone: string;
    };
}

const FinancialDesk: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const { notifications, markAsRead } = useNotifications();
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPayouts = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/admin/payouts/pending');
            setPayouts(res.data);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
        // Clear payout badge when operator views this page
        notifications
            .filter(n => !n.read && n.type === 'payout.requested')
            .forEach(n => markAsRead(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApprove = async (p: PayoutRequest) => {
        const confirmed = await showConfirm({
            title: 'Verify & Approve Payout',
            message: `IMPORTANT: Ensure you have manually transferred ${parseFloat(p.amount).toLocaleString()} AGLP to ${p.bankAccountHolder} via ${p.bankName} (Acc: ${p.bankAccountNumber}). Have you successfully completed this transfer?`,
            confirmText: 'Yes, Funds Sent',
            type: 'success'
        });

        if (confirmed) {
            setProcessingId(p.id);
            try {
                await api.post(`/admin/payouts/${p.id}/approve`);
                showAlert({ title: 'Payout Recorded', message: 'The manual transfer has been successfully logged.', type: 'success' });
                setPayouts(prev => prev.filter(item => item.id !== p.id));
            } catch (error) {
                console.error('Approval failed:', error);
                showAlert({ title: 'Error', message: 'Failed to record approval.', type: 'error' });
            } finally {
                setProcessingId(null);
            }
        }
    };
    const handleReject = async (id: string) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason === null) return;
        if (!reason.trim()) {
            showAlert({ title: 'Required', message: 'A reason is required to reject a payout.', type: 'warning' });
            return;
        }

        setProcessingId(id);
        try {
            await api.post(`/admin/payouts/${id}/reject`, { reason });
            showAlert({ title: 'Payout Rejected', message: 'The request has been rejected and funds returned to the agent.', type: 'info' });
            setPayouts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Rejection failed:', error);
            showAlert({ title: 'Error', message: 'Failed to reject payout.', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Desk</h2>
                <p className="text-slate-500 text-sm font-medium">Verify and approve manual fund transfers to agents.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Pending Withdrawal Requests
                    </h3>

                    <div className="space-y-4">
                        {payouts.length > 0 ? (
                            payouts.map((p) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={p.id} 
                                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-100 transition-all group"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                                    <User className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{p.profile.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.profile.phone}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-3 bg-white rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bank</p>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                                                        {p.bankName}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Account Number</p>
                                                    <p className="text-xs font-mono font-bold text-slate-700">{p.bankAccountNumber}</p>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Holder</p>
                                                    <p className="text-xs font-bold text-slate-700">{p.bankAccountHolder}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex lg:flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-200/50 pt-4 lg:pt-0 lg:pl-8 min-w-[140px]">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-900 leading-none">{parseFloat(p.amount).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">AGLP Requested</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleReject(p.id)}
                                                    disabled={!!processingId}
                                                    className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(p)}
                                                    disabled={!!processingId}
                                                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 font-black text-xs active:scale-95 disabled:opacity-50"
                                                >
                                                    {processingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    APPROVE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold italic">No pending withdrawal requests.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center gap-6 border border-slate-800 shadow-xl shadow-slate-200">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-widest text-indigo-300">Payout Protocol</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xl mt-1">
                            Before approving, you must manually initiate the transfer via your banking app or Telebirr. Approval here merely audits the completion and deducts final balances.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialDesk;
