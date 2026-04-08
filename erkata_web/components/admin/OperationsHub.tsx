import React from 'react';
import { Activity, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const OperationsHub: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operations Hub</h2>
                <p className="text-slate-500 text-sm font-medium">Live platform health and operational throughput.</p>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Requests Today", value: "1,284", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
                    { title: "Fulfilled Rate", value: "84.2%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { title: "Avg Assign Time", value: "4m 12s", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { title: "Active Disputes", value: "24", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" }
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
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
                    {[
                        { label: 'Requests Submitted', count: 1240, percent: 100, color: 'bg-slate-800' },
                        { label: 'Assigned to Agent', count: 1080, percent: 85, color: 'bg-indigo-500' },
                        { label: 'Fulfilled by Agent', count: 910, percent: 70, color: 'bg-emerald-500' }
                    ].map((step, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1.5 uppercase">
                                <span>{step.label}</span>
                                <span>{step.percent}% ({step.count.toLocaleString()})</span>
                            </div>
                            <div className="w-full h-4 bg-slate-100 rounded-lg overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${step.percent}%` }} transition={{ duration: 1 }} className={`h-full ${step.color}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OperationsHub;