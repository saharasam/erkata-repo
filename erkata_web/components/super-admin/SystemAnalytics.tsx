import React from 'react';
import { BarChart4, TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

const SystemAnalytics: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Platform Volume', value: '45.2M ETB', change: '+12%', up: true },
                    { label: 'Resolution Rate', value: '88.4%', change: '+3%', up: true },
                    { label: 'Avg Feedback', value: '4.8/5', change: '-0.2', up: false },
                    { label: 'System Uptime', value: '99.99%', change: 'Stable', up: true },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <div className="flex items-end gap-3">
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</span>
                            <span className={`text-[10px] font-bold flex items-center mb-1 ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {s.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-80 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            Retention & Growth
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Last 90 Days</span>
                    </div>
                    <div className="flex-1 flex items-end gap-2 pb-4">
                        {[40, 60, 45, 80, 55, 90, 70, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-50 rounded-t-lg transition-all hover:bg-slate-900 cursor-pointer group relative" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl h-80">
                    <h4 className="text-xl font-black mb-6">Regional Distribution</h4>
                    <div className="space-y-4">
                        {[
                            { name: 'Addis Ababa (Bole)', val: 65 },
                            { name: 'Addis Ababa (Kirkos)', val: 45 },
                            { name: 'Dire Dawa', val: 30 },
                            { name: 'Bahir Dar', val: 20 },
                        ].map((r, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{r.name}</span>
                                    <span>{r.val}% coverage</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAnalytics;
