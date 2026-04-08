import React from 'react';
import { Wallet, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const FinancialDesk: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial & Escrow Desk</h2>
                <p className="text-slate-500 text-sm font-medium">Approve payouts and manage commission escrow locks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Escrow Queue */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-indigo-600" /> Escrow Release Queue
                    </h3>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                                <div>
                                    <p className="text-xs font-black text-slate-800">Agent #A{1020 + i}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Match: TX-{500 + i}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-600">+1,500 AGLP</p>
                                    <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 mt-1 uppercase">Release Funds</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Withdrawal Requests */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" /> Withdrawal Requests
                    </h3>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div>
                                    <p className="text-xs font-black text-slate-800">Agent #A{3040 + i}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Method: Telebirr</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-xs font-black text-slate-800">4,000 AGLP</p>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                                        <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Alert Area */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center gap-4 border border-slate-800">
                <ShieldAlert className="w-10 h-10 text-rose-400" />
                <div>
                    <h4 className="font-black text-sm uppercase tracking-widest">Compliance Protocol</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl mt-1">
                        Manual overrides and payout releases are subject to platform integrity verification. Ensure agent documentation is complete before authorization.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinancialDesk;