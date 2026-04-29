import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WalletSummaryProps {
  finance: {
    balance: number;
    aglpAvailable?: number;
    aglpPendingCommissions?: number;
    aglpPendingWithdrawals?: number;
    aglpWithdrawn?: number;
    weeklyGrowth?: {
      percentage: string;
      amount: number;
      chart: number[];
    };
    history: any[];
  } | null;
  onPayoutRequest: () => void;
}

const WalletSummary: React.FC<WalletSummaryProps> = ({ finance, onPayoutRequest }) => {
  if (!finance) return null;

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black tracking-tighter">{(finance.aglpAvailable ?? finance.balance ?? 0).toLocaleString()}</span>
              <span className="text-xl font-bold text-slate-500">AGLP</span>
            </div>
            
            <div className="flex gap-8 mb-8 pb-6 border-b border-white/10">
               <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Pending Commissions</p>
                  <p className="text-lg font-bold text-emerald-400">{(finance.aglpPendingCommissions ?? 0).toLocaleString()} AGLP</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Pending Withdrawal</p>
                  <p className="text-lg font-bold text-amber-400">{(finance.aglpPendingWithdrawals ?? 0).toLocaleString()} AGLP</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Withdrawn</p>
                  <p className="text-lg font-bold text-slate-300">{(finance.aglpWithdrawn ?? 0).toLocaleString()} AGLP</p>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onPayoutRequest}
                className="bg-erkata-primary hover:bg-erkata-secondary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-erkata-primary/20"
              >
                <CreditCard className="w-5 h-5" />
                Withdraw 
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Weekly Growth</span>
            </div>
            <p className={`text-3xl font-black mb-1 ${Number(finance.weeklyGrowth?.percentage || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {finance.weeklyGrowth?.percentage || '0.0'}%
            </p>
            <p className="text-xs text-slate-400 font-medium whitespace-pre-line">
              {Number(finance.weeklyGrowth?.amount || 0) >= 0 
                ? `Earned ${Math.round(finance.weeklyGrowth?.amount || 0).toLocaleString()} AGLP more than last week`
                : `Earned ${Math.abs(Math.round(finance.weeklyGrowth?.amount || 0)).toLocaleString()} AGLP less than last week`}
            </p>
          </div>
          
          <div className="h-16 flex items-end gap-1">
             {(finance.weeklyGrowth?.chart || [0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
               const max = Math.max(...(finance.weeklyGrowth?.chart || [100]), 100);
               const height = (h / max) * 100;
               return (
                 <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex-1 bg-emerald-500/20 rounded-t-sm" 
                 />
               );
             })}
          </div>
        </motion.div>
      </div>

      {/* History Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <History className="w-5 h-5 text-indigo-600" />
             Transaction History
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {finance.history.map((log) => {
                const isIncoming = log.action.includes('EARNED') || log.action.includes('CREDITED') || log.action.includes('RELEASED');
                const amount = typeof log.amount === 'number' ? log.amount : parseFloat(log.amount || '0');
                
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isIncoming ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-500 font-medium">#{log.metadata?.transactionId?.slice(0, 8) || log.id.slice(0, 8)}</p>
                       <p className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`text-sm font-black ${isIncoming ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {isIncoming ? '+' : '-'}{amount.toLocaleString()} AGLP
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {(() => {
                         const s = log.status || 'COMPLETED';
                         if (s === 'PENDING') return (
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                             <Clock className="w-3 h-3" />
                             Pending
                           </span>
                         );
                         if (s === 'FAILED' || s === 'REJECTED') return (
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                             <ArrowDownRight className="w-3 h-3" />
                             Failed
                           </span>
                         );
                         return (
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                             <CheckCircle2 className="w-3 h-3" />
                             Completed
                           </span>
                         );
                       })()}
                    </td>
                  </tr>
                );
              })}
              {finance.history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No transaction history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletSummary;
