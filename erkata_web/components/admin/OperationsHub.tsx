import React, { useState } from 'react';
import { Activity, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAnalytics, TimeWindow } from '../../hooks/useAdminAnalytics';

const OperationsHub: React.FC = () => {
    const [window, setWindow] = useState<TimeWindow>('all');
    const { data, loading, error } = useAdminAnalytics(window);

    const formatDuration = (ms: number | null) => {
        if (ms === null) return '—';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes === 0) return `${seconds}s`;
        return `${minutes}m ${seconds}s`;
    };

    const stats = [
        { 
            title: `Requests ${window === 'all' ? 'Total' : window === 'today' ? 'Today' : 'This Week'}`, 
            value: data?.activeRequests?.toLocaleString() ?? '0', 
            icon: Activity, 
            color: "text-blue-600", 
            bg: "bg-blue-50" 
        },
        { 
            title: "Fulfilled Rate", 
            value: data && data.activeRequests > 0 
                ? `${((data.fulfilledInWindow / data.activeRequests) * 100).toFixed(1)}%` 
                : "0.0%", 
            icon: CheckCircle, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50" 
        },
        { 
            title: "Avg Assign Time", 
            value: formatDuration(data?.avgAssignmentTimeMs ?? null), 
            icon: Clock, 
            color: "text-indigo-600", 
            bg: "bg-indigo-50" 
        },
        { 
            title: "Active Disputes", 
            value: data?.activeDisputes?.toString() ?? '0', 
            icon: AlertTriangle, 
            color: "text-rose-600", 
            bg: "bg-rose-50" 
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operations Hub</h2>
                    <p className="text-slate-500 text-sm font-medium">Live platform health and operational throughput.</p>
                </div>
                
                {/* Time Window Filter */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    {(['today', 'week', 'all'] as TimeWindow[]).map((w) => (
                        <button
                            key={w}
                            onClick={() => setWindow(w)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                window === w 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-600 mb-6">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }} 
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                    >
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            {loading ? (
                                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
                            ) : (
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            )}
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Funnel Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Live Conversion Funnel</h3>
                <div className="space-y-5">
                    {loading ? (
                        [1, 2, 3].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-full bg-slate-50 animate-pulse rounded-lg" />
                                <div className="h-4 w-full bg-slate-100 animate-pulse rounded-lg" />
                            </div>
                        ))
                    ) : (
                        [
                            { 
                                label: 'Total Requests', 
                                count: data?.totalRequests ?? 0, 
                                percent: 100, 
                                color: 'bg-slate-800' 
                            },
                            { 
                                label: 'In Flow (Pending/Assigned)', 
                                count: data?.activeRequests ?? 0, 
                                percent: data && data.totalRequests > 0 ? (data.activeRequests / data.totalRequests) * 100 : 0, 
                                color: 'bg-indigo-500' 
                            },
                            { 
                                label: 'Finalized Fulfilled', 
                                count: data?.fulfilledInWindow ?? 0, 
                                percent: data && data.activeRequests > 0 ? (data.fulfilledInWindow / data.activeRequests) * 100 : 0, 
                                color: 'bg-emerald-500' 
                            }
                        ].map((step, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1.5 uppercase">
                                    <span>{step.label}</span>
                                    <span>{step.percent.toFixed(1)}% ({step.count.toLocaleString()})</span>
                                </div>
                                <div className="w-full h-4 bg-slate-100 rounded-lg overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${step.percent}%` }} transition={{ duration: 1 }} className={`h-full ${step.color}`} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperationsHub;