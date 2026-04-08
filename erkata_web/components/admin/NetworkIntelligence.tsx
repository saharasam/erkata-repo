import React from 'react';
import { Network, TrendingUp, Users, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const NetworkIntelligence: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Network Intelligence</h2>
                <p className="text-slate-500 text-sm font-medium">Monitor referral tree health and agent progression.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tier Distribution */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Tier Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Abundant Life', count: 4, color: 'bg-indigo-600' },
                            { name: 'Unity', count: 12, color: 'bg-amber-500' },
                            { name: 'Love', count: 28, color: 'bg-rose-500' },
                            { name: 'Peace', count: 45, color: 'bg-emerald-500' },
                            { name: 'Free', count: 120, color: 'bg-slate-300' }
                        ].map(tier => (
                            <div key={tier.name} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                                <div className="flex-1 flex justify-between text-xs font-bold text-slate-700">
                                    <span>{tier.name}</span>
                                    <span>{tier.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referral Tree Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/connected.png')]" />
                    <Network className="w-16 h-16 text-indigo-200 mb-4" />
                    <h3 className="text-lg font-black text-slate-800 mb-2">Referral Graph Interface</h3>
                    <p className="text-slate-500 text-xs max-w-sm mb-6">
                        Visualize high-value referral clusters and detect dormant branches within the agent tree.
                    </p>
                    <button className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                        Initialize Graph View
                    </button>
                </div>
            </div>

            {/* Suspicious Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> Network Risk Anomalies
                </h3>
                <div className="space-y-3">
                    {[
                        { id: 'Agent-902', msg: 'Dormant referral branch (no activity 30+ days)', risk: 'Low' },
                        { id: 'Agent-441', msg: 'Unusual rapid growth in referrals', risk: 'High' }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-xs font-bold text-slate-800">{item.id}</p>
                                <p className="text-[10px] text-slate-500">{item.msg}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${item.risk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                {item.risk} Risk
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NetworkIntelligence;