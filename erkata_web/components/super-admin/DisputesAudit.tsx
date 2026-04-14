import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Loader2,
  ArrowUpRight,
  Info,
  RotateCcw,
  Check,
  ShieldAlert as ShieldAlertIcon
} from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

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

    const handleVoid = async (id: string) => {
        const note = window.prompt('Enter reason for voiding this fulfillment and requesting a redo:');
        if (note === null) return;

        try {
            await api.patch(`/requests/${id}/void-dispute`, { note });
            await fetchHistory(); // Refresh
            alert('Fulfillment voided. Request returned to agent for redo.');
        } catch (error) {
            console.error('Failed to void dispute:', error);
            alert('Action failed. Check console for details.');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredRecords = records.filter(r => 
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Audit Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header section */}
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
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Resolution Archive & Audit</p>
                         </div>
                    </div>
                    <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-medium">
                        This view monitors all customer-triggered disputes. Super Admins can review resolutions 
                        settled by operators and verify escalation notes for ongoing administrative interventions.
                    </p>
                </div>
            </div>

            {/* Stats & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {records.filter(r => r.status === 'disputed' && !r.isEscalated).length} OPEN
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {records.filter(r => r.status === 'disputed' && r.isEscalated).length} ESCALATED
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {records.filter(r => r.status === 'fulfilled').length} RESOLVED
                         </span>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-slate-400" />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {records.filter(r => r.status === 'cancelled').length} VOIDED
                         </span>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Case ID or Customer..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold shadow-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Context</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Involved Parties</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Summary</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRecords.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                ID: {r.id.split('-')[0].toUpperCase()}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.category}</p>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 mt-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-indigo-600" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700">{r.customer.fullName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700">{r.matches[0]?.agent?.fullName || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info className="w-3 h-3 text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {r.isEscalated ? 'Escalation Note' : 'Resolution Note'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                                "{r.metadata.resolutionNote || r.metadata.escalationNote || 'No documentation provided.'}"
                                            </p>
                                            <div className="mt-2 text-[9px] font-bold text-slate-400 flex items-center gap-2">
                                                <span>Mediated by: <span className="text-slate-900">{r.metadata.resolvedBy || r.metadata.escalatedBy || 'System'}</span></span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span>{new Date(r.metadata.resolvedAt || r.metadata.escalatedAt || r.updatedAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                r.status === 'fulfilled'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : r.status === 'cancelled'
                                                ? 'bg-slate-50 text-slate-500 border border-slate-200'
                                                : r.isEscalated
                                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {r.status === 'fulfilled' ? 'Resolved' : 
                                                 r.status === 'cancelled' ? 'Voided' :
                                                 r.isEscalated ? 'Escalated' : 'Open'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {(r.status === 'disputed') && (
                                                    <button 
                                                        onClick={() => handleVoid(r.id)}
                                                        title="Void & Redo"
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRecords.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mb-1">No Dispute Records Found</h3>
                        <p className="text-xs text-slate-500 font-medium">Try adjusting your search filters if applicable.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisputesAudit;
