import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Wallet, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface PayoutRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    onSubmit: (data: { amount: number; bankName: string; bankAccountNumber: string; bankAccountHolder: string }) => Promise<void>;
}

const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({ isOpen, onClose, availableBalance, onSubmit }) => {
    const [amount, setAmount] = useState<string>(availableBalance.toString());
    const [bankName, setBankName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankAccountHolder, setBankAccountHolder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (val > availableBalance) {
            setError('Amount exceeds available balance.');
            return;
        }
        if (!bankName || !bankAccountNumber || !bankAccountHolder) {
            setError('Please fill in all bank details.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                amount: val,
                bankName,
                bankAccountNumber,
                bankAccountHolder
            });
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to submit withdrawal request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Wallet className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Request Payout</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Funds will be manually transferred by an operator.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Amount (AGLP)</label>
                                        <span className="text-[10px] font-bold text-indigo-600">Available: {availableBalance.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent text-2xl font-black text-slate-800 focus:outline-none"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                        <div className="relative">
                                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                                                placeholder="e.g. Commercial Bank of Ethiopia"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <input
                                            type="text"
                                            value={bankAccountNumber}
                                            onChange={(e) => setBankAccountNumber(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                                            placeholder="Bank account number"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                        <input
                                            type="text"
                                            value={bankAccountHolder}
                                            onChange={(e) => setBankAccountHolder(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                                            placeholder="Full name as on account"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PayoutRequestModal;
