import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Briefcase } from 'lucide-react';
import RequestCard from './RequestCard';

interface FocusBoardProps {
  requests: any[];
  onAccept: (id: string) => void;
  onComplete: (id: string, transactionId: string, customerName: string) => void;
  onTransfer: (id: string) => void;
  onDecline: (id: string) => void;
  hasReferrals?: boolean;
}

export const FocusBoard: React.FC<FocusBoardProps> = ({ requests, onAccept, onComplete, onTransfer, onDecline, hasReferrals }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = req.requirementSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    active: requests.filter(r => r.status === 'in-progress').length,
    pending: requests.filter(r => r.status === 'assigned').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Focus Header & Stats */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">My Focus Board</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your active assignments and fulfillment tasks.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active</p>
              <p className="text-xl font-black text-slate-800">{stats.active}</p>
           </div>
           <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
              <p className="text-xl font-black text-slate-800">{stats.pending}</p>
           </div>
           <div className="bg-indigo-600 px-5 py-3 rounded-2xl border border-indigo-500 shadow-lg shadow-indigo-600/20 text-white">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Capacity</p>
              <p className="text-xl font-black">{Math.round((stats.active / 10) * 100)}%</p>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white/50 shadow-sm">
         <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'assigned', 'in-progress', 'completed'] as const).map((s) => (
               <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                     statusFilter === s 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                  }`}
               >
                  {s.replace('-', ' ')}
               </button>
            ))}
         </div>

         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search requests..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-erkata-primary/10 focus:border-erkata-primary/40 transition-all font-medium text-slate-700"
            />
         </div>
      </div>

      {/* Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredRequests.map((request) => (
              <RequestCard 
                 key={request.id} 
                 request={request} 
                 onAccept={onAccept} 
                 onComplete={onComplete} 
                 onTransfer={onTransfer}
                 onDecline={onDecline}
                 hasReferrals={hasReferrals}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-white border-dashed"
        >
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
              <Briefcase className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">No Requests Found</h3>
           <p className="text-slate-500 max-w-xs text-center text-sm font-medium">
              We couldn't find any requests matching your current filters. Try adjusting them or check back later.
           </p>
        </motion.div>
      )}
    </div>
  );
};

export default FocusBoard;
