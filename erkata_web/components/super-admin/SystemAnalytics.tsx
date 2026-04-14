import React, { useState, useEffect } from 'react';
import { 
    BarChart4, 
    TrendingUp, 
    Users, 
    FileText, 
    ArrowUpRight, 
    ArrowDownRight, 
    Globe,
    Activity,
    ShieldCheck,
    Box,
    Loader2
} from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';

interface AnalyticsSummary {
    totalUsers: number;
    totalRequests: number;
    activeRequests: number;
    fulfilledInWindow: number;
    totalBundles: number;
    totalFinalized: number;
    activeDisputes: number;
    agentCount: number;
    operatorCount: number;
    resolutionRate: string;
    window: string;
    avgAssignmentTimeMs: number | null;
    avgFulfillmentTimeMs: number | null;
    platformVolume: string;
    dailyCommissions: string;
    leaderboard: any[];
    packageDistribution: { tier: string; count: number }[];
    packageRevenue: string;
    uptime: string;
}

const SystemAnalytics: React.FC = () => {
    const { showAlert } = useModal();
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/analytics/summary');
            setSummary(response.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            showAlert({
                title: 'Data Stream Interruption',
                message: 'Internal analytical bus is currently unreachable.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Synchronizing platform telemetry...</p>
            </div>
        );
    }

    const stats = [
        { label: 'Platform Volume', value: summary?.platformVolume || '0 AGLP', change: '+0.0%', up: true, icon: TrendingUp },
        { label: 'Resolution Rate', value: summary?.resolutionRate || '0%', change: '+0.0%', up: true, icon: ShieldCheck },
        { label: 'Total Requests', value: summary?.totalRequests.toLocaleString() || '0', change: '+0.0', up: true, icon: FileText },
        { label: 'System Uptime', value: summary?.uptime || '99.9%', change: 'Stable', up: true, icon: Activity },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-indigo-500/20 transition-all hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <s.icon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className={`text-[10px] font-bold flex items-center px-2 py-0.5 rounded-full ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {s.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {s.change}
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{s.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 flex flex-col h-96">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                Growth Intelligence
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction flow & retention matrix</p>
                        </div>
                        <div className="flex gap-2">
                             {['1W', '1M', '3M'].map(t => (
                                 <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${t === '3M' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                     {t}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-3 pb-4">
                        {[40, 65, 45, 85, 55, 95, 75, 88, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-50/50 rounded-2xl transition-all hover:bg-indigo-500 cursor-pointer group relative overflow-hidden" style={{ height: `${h}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {(h * 123.4).toLocaleString()} AGLP
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl h-96 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
                    <h4 className="text-xl font-black mb-8 tracking-tight flex items-center gap-3 relative z-10">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        Platform Ecosystem
                    </h4>
                    <div className="space-y-6 relative z-10">
                        {[
                            { name: 'Requesting Customers', val: summary?.totalUsers || 0, color: 'bg-indigo-400' },
                            { name: 'Active Agents', val: summary?.agentCount || 0, color: 'bg-emerald-400' },
                            { name: 'Regional Operators', val: summary?.operatorCount || 0, color: 'bg-amber-400' },
                            { name: 'Service Resolvers', val: summary?.totalFinalized || 0, color: 'bg-rose-400' },
                        ].map((r, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{r.name}</span>
                                    <span className="text-white">{r.val.toLocaleString()} Units</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 delay-300 ${r.color}`} 
                                        style={{ width: `${Math.min((r.val / (summary?.totalUsers || 1)) * 100, 100)}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] border border-white/20 flex items-center justify-center shrink-0">
                            <Box className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black tracking-tighter mb-1 uppercase">Immutable Oversight Chain</h4>
                            <p className="text-indigo-100 text-sm font-medium max-w-xl leading-relaxed">
                                Platform analytical intelligence is derived directly from the PostgreSQL board layer. 
                                Real-time telemetry ensures zero-latency detection of systemic friction in the mediation protocol.
                            </p>
                        </div>
                    </div>
                    <button onClick={fetchAnalytics} className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest">
                        Refresh Telemetry
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                    <Box className="w-64 h-64 text-slate-900" />
                </div>
                
                <div className="flex justify-between items-end mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Box className="w-5 h-5 text-indigo-500" />
                            Tier Performance & Distribution
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Agent package adoption & revenue yield</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CUMULATIVE PACKAGE YIELD</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">{summary?.packageRevenue || '0 ETB'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                    {summary?.packageDistribution.map((tier, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl group/card hover:bg-white hover:border-indigo-500/30 transition-all shadow-sm flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg mb-4 border-2 ${
                                tier.tier === 'ABUNDANT LIFE' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                tier.tier === 'UNITY' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                                tier.tier === 'LOVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                'bg-slate-200/50 border-slate-300 text-slate-700'
                            }`}>
                                {tier.tier.charAt(0)}
                            </div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{tier.tier}</h5>
                            <p className="text-2xl font-black text-slate-900 leading-none">{tier.count}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">Active Nodes</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemAnalytics;

