import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download, ShieldAlert, User, Clock, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

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
    };
}

const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const limit = 15;

    useEffect(() => {
        fetchLogs();
    }, [page, search]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/audit-logs', {
                params: {
                    limit,
                    offset: page * limit,
                    // We can add more filters here if needed
                }
            });
            if (Array.isArray(response.data)) {
                setLogs(response.data);
            } else {
                console.error('Expected array from /audit-logs, got:', typeof response.data);
                setLogs([]);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (action.includes('UPDATE') || action.includes('CHANGE')) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (action.includes('DELETE') || action.includes('EVOKED') || action.includes('FORCE')) return 'bg-red-50 text-red-600 border-red-100';
        if (action.includes('ASSIGN') || action.includes('FINAL')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        return 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const filteredLogs = Array.isArray(logs) ? logs.filter(log => 
        (log.actor?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.entityType || '').toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight text-slate-900">Immutable Ledger</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time System Intelligence</p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search intelligence feed..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 w-full md:w-80 transition-all" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Event Timestamp</th>
                                <th className="px-8 py-5">Initiator</th>
                                <th className="px-8 py-5">Action Protocol</th>
                                <th className="px-8 py-5">Target Entity</th>
                                <th className="px-8 py-5 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 font-mono text-[10px] font-black text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {(log.actor?.fullName || 'S').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">{log.actor?.fullName || 'System'}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{log.actor?.role || 'CORE_ENGINE'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-semibold text-slate-500">
                                            <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-tight ${getActionColor(log.action || '')}`}>
                                                {(log.action || 'UNKNOWN_ACTION').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{log.entityType}</span>
                                                <span className="text-xs font-bold text-slate-700">{log.entityId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-slate-300 font-mono text-[10px]">
                                                <Hash className="w-3 h-3" />
                                                {log.id.slice(0, 8)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <History className="w-12 h-12 text-slate-100" />
                                            <div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching logs found</p>
                                                <p className="text-xs text-slate-300 font-medium">Clear filters to see all intelligence data.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing intelligence slice {page * limit + 1} - {Math.min((page + 1) * limit, logs.length)}
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs shadow-lg shadow-slate-900/20">{page + 1}</span>
                    </div>
                    <button 
                        disabled={logs.length < limit}
                        onClick={() => setPage(page + 1)}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;

