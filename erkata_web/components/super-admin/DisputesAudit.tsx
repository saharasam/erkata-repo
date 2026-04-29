import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search,
  CheckCircle2,
  User,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Loader2,
  RotateCcw,
  Info,
  UserCog // Icon for operator/admin
} from 'lucide-react';
import api from '../../utils/api';
import { motion } from 'framer-motion';

interface DisputeRecord {
  id: string;
  category: string;
  status: string;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string;
    phone: string;
  };
  assignedOperator?: {
    fullName: string;
    role: string;
  };
  matches: Array<{
    agent: {
      fullName: string;
      phone: string;
    }
  }>;
  metadata: {
    resolutionNote?: string;
    escalationNote?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    escalatedAt?: string;
    escalatedBy?: string;
    voidNote?: string;
  };
}

const DisputesAudit: React.FC = () => {
    const [records, setRecords] = useState<DisputeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/requests/admin/dispute-history');
            setRecords(res.data);
        } catch (error) {
            console.error('Failed to fetch dispute history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // --- FIX: Logic for Stat Tiles ---
    const stats = {
        open: records.filter(r => r.status === 'disputed' && !r.isEscalated).length,
        escalated: records.filter(r => r.isEscalated).length,
        resolved: records.filter(r => r.status === 'fulfilled' || r.status === 'completed').length,
        voided: records.filter(r => r.status === 'cancelled' || r.status === 'assigned').length,
    };

    // --- FIX: Search Functionality ---
    const filteredRecords = records.filter(r => {
        const searchLower = searchTerm.toLowerCase();
        return (
            r.id.toLowerCase().includes(searchLower) ||
            r.customer.fullName.toLowerCase().includes(searchLower) ||
            (r.assignedOperator?.fullName || '').toLowerCase().includes(searchLower) ||
            (r.matches[0]?.agent?.fullName || '').toLowerCase().includes(searchLower)
        );
    });

    const handleVoid = async (id: string) => {
        const note = window.prompt('Enter reason for voiding this fulfillment:');
        if (!note) return;
        try {
            await api.patch(`/requests/${id}/void-dispute`, { note });
            await fetchHistory();
        } catch (error) {
            console.error('Failed to void:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldAlert className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <ShieldAlert className="w-6 h-6 text-amber-400" />
                         </div>
                         <div>
                             <h2 className="text-2xl font-black italic tracking-tight">Disputes Governance</h2>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appellate Level Oversight</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Stat Tiles */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {stats.open} OPEN
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {stats.escalated} ESCALATED
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {stats.resolved} RESOLVED
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-slate-400" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {stats.voided} VOIDED
                         </span>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Customer, or Personnel..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                </div>
            </div>

            {/* Main Audit Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Context (Personnel)</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / Agent</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Summary</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRecords.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <UserCog className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-xs font-black text-slate-800">Op: {r.assignedOperator?.fullName || 'System'}</span>
                                            </div>
                                            {r.isEscalated && (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="text-[10px] font-black text-rose-600 uppercase">With Admin Team</span>
                                                </div>
                                            )}
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">ID: {r.id.split('-')[0].toUpperCase()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{r.customer.fullName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{r.matches[0]?.agent?.fullName || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="w-3 h-3 text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {r.isEscalated ? 'Escalation Note' : 'Final Resolution'}
                                                </span>
                                            </div>
                                            {/* FIX: Prioritize escalation note if escalated */}
                                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                                "{r.isEscalated ? (r.metadata.escalationNote || 'Awaiting administrative detail...') : (r.metadata.resolutionNote || 'Resolved by system.')}"
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {/* FIX: Correct Status Display */}
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            r.status === 'fulfilled' || r.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : r.isEscalated
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {r.status === 'fulfilled' || r.status === 'completed' ? 'Resolved' : 
                                             r.isEscalated ? 'Escalated' : 'Open'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DisputesAudit;
