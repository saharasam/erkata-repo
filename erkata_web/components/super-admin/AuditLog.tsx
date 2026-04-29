import React, { useState, useEffect } from 'react';
import { 
    Search, Download, User, Clock, 
    ChevronDown, ChevronUp, 
    ShieldAlert, FileJson, 
    Loader2, HardDrive, ShieldCheck,
    Gavel, Wallet, UserX, UserPlus, Zap
} from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLogEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    metadata: any;
    createdAt: string;
    actor: {
        fullName: string;
        role: string;
    } | null;
}

const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/audit-logs?limit=200');
            // --- FILTER: Remove Technical Noise ---
            const noise = ['heartbeat', 'refresh', 'GET'];
            const relevant = (response.data || []).filter((log: AuditLogEntry) => 
                !noise.some(n => log.action.toLowerCase().includes(n.toLowerCase()))
            );
            setLogs(relevant);
        } catch (error) {
            console.error('Audit sync failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- UI LOGIC: Plain English Translation ---
    const getHumanSummary = (log: AuditLogEntry) => {
        const a = log.action.toUpperCase();
        if (a.includes('SYSTEM_CONFIG')) return 'Modified Platform Economic Policy';
        if (a.includes('PAYOUT_APPROVED')) return 'Authorized Manual Fund Disbursement';
        if (a.includes('PAYOUT_REJECTED')) return 'Rejected Payout Request';
        if (a.includes('SUSPICIOUS_COMMISSION')) return 'System Flagged Abnormal Earning Pattern';
        if (a.includes('USER_SUSPENDED') || (a.includes('STATUS') && log.metadata?.isActive === false)) return 'Suspended User Authority';
        if (a.includes('INVITE')) return 'Dispatched Personnel Invitation';
        if (a.includes('TIER')) return 'Overrode Agent Subscription Tier';
        if (a.includes('LOCKDOWN')) return 'Toggled Emergency System State';
        if (a.includes('RESOLVE')) return 'Finalized Mediation Decision';
        return formatActionLabel(log.action);
    };

    const getProtocolIcon = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('PAYOUT') || a.includes('COMMISSION')) return <Wallet className="w-4 h-4 text-emerald-500" />;
        if (a.includes('SUSPEND') || a.includes('LOCKDOWN')) return <ShieldAlert className="w-4 h-4 text-rose-500" />;
        if (a.includes('INVITE') || a.includes('TIER')) return <UserPlus className="w-4 h-4 text-indigo-500" />;
        if (a.includes('RESOLVE')) return <Gavel className="w-4 h-4 text-amber-500" />;
        return <Zap className="w-4 h-4 text-slate-400" />;
    };

    const formatActionLabel = (action: string) => {
        return action.replace(/_/g, ' ').replace('POST /', 'Created ').replace('PATCH /', 'Updated ');
    };

    // --- FUNCTIONAL EXPORT ---
    const handleExport = () => {
        setIsExporting(true);
        try {
            const headers = ['Date', 'Time', 'Initiator', 'Role', 'Event', 'Technical Action', 'Payload'];
            const rows = filteredLogs.map(log => [
                format(new Date(log.createdAt), 'yyyy-MM-dd'),
                format(new Date(log.createdAt), 'HH:mm:ss'),
                log.actor?.fullName || 'System Engine',
                log.actor?.role || 'CORE',
                getHumanSummary(log),
                log.action,
                JSON.stringify(log.metadata).replace(/"/g, '""')
            ]);

            const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `erkata_governance_log_${format(new Date(), 'yyyy_MM_dd')}.csv`;
            link.click();
        } finally {
            setIsExporting(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        (log.actor?.fullName || 'System').toLowerCase().includes(search.toLowerCase()) ||
        getHumanSummary(log).toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Parsing Governance Ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Control Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Audit Ledger</h2>
                    <p className="text-slate-500 text-sm font-medium">Filtering high-priority events: <span className="text-indigo-600">Governance, Finance & Security</span></p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Filter by person, action, or event type..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        EXPORT LEDGER
                    </button>
                </div>
            </div>

            {/* Table Module */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiator</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Executive Summary</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr 
                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                        className={`group cursor-pointer transition-all ${expandedId === log.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'}`}
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                <div className="font-mono">
                                                    <p className="text-sm font-black text-slate-600 leading-none">{format(new Date(log.createdAt), 'HH:mm:ss')}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-indigo-300 transition-colors">
                                                    <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{log.actor?.fullName || 'System Core'}</p>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.actor?.role || 'AUTOMATED'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                {getProtocolIcon(log.action)}
                                                <span className="text-sm font-bold text-slate-700 tracking-tight">
                                                    {getHumanSummary(log)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-xl border border-slate-100 text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Payload</span>
                                                {expandedId === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <AnimatePresence>
                                        {expandedId === log.id && (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-0 border-none">
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mb-8 p-8 bg-slate-950 rounded-[2rem] border border-slate-800 shadow-inner flex flex-col gap-6">
                                                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <FileJson className="w-5 h-5 text-indigo-400" />
                                                                    <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Raw Transaction Metadata</span>
                                                                </div>
                                                                <div className="px-3 py-1 bg-slate-900 rounded-lg">
                                                                    <span className="text-[10px] font-mono text-slate-500">REF: {log.id}</span>
                                                                </div>
                                                            </div>
                                                            <pre className="text-xs font-mono text-emerald-400/80 leading-relaxed overflow-x-auto custom-scrollbar p-2">
                                                                {JSON.stringify(log.metadata, null, 4)}
                                                            </pre>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Immutable Entry • Verified by Erkata Core v3.0</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Persistence Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                    <HardDrive className="w-32 h-32 text-white" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <ShieldCheck className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white tracking-tight uppercase">Permanent Audit Standard</h4>
                        <p className="text-sm text-slate-400 font-medium max-w-xl">
                            All personnel actions and system overrides are recorded in this immutable stream. 
                            These records are utilized for monthly performance audits and judicial mediation reviews.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;