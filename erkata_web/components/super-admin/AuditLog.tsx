import React, { useState } from 'react';
import { History, Search, Filter, Download, ShieldAlert, User, Clock } from 'lucide-react';

const AuditLog: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search by user or action..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 w-64" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <Filter className="w-3.5 h-3.5" />
                        Filter Log
                    </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-8 py-5">Initiator</th>
                            <th className="px-8 py-5">Action Type</th>
                            <th className="px-8 py-5">Target / Data</th>
                            <th className="px-8 py-5">Result</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {[
                            { time: '2026-02-14 14:02:11', user: 'SA: Samuel', type: 'ADMIN_REVOKED', target: 'abebe.b@erkata.com', res: 'SUCCESS' },
                            { time: '2026-02-14 13:45:04', user: 'System', type: 'EMERGENCY_ARCHIVE', target: 'BND-1920', res: 'SUCCESS' },
                            { time: '2026-02-14 12:20:55', user: 'ADM: Sarah', type: 'RESOLUTION_FINALIZED', target: 'BND-7762', res: 'SUCCESS' },
                            { time: '2026-02-14 11:10:02', user: 'SA: Samuel', type: 'CONFIG_CHANGE', target: 'auto_bundle: disabled', res: 'AUDITED' },
                            { time: '2026-02-14 10:45:33', user: 'ADM: Sarah', type: 'TIER_UPGRADE', target: 'AGT-089', res: 'NOTIFIED' },
                        ].map((log, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 font-mono text-[10px] font-black text-slate-500">{log.time}</td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <User className="w-3 h-3 text-slate-300" />
                                        {log.user}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-xs font-semibold text-slate-500">{log.target}</td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-black text-emerald-600">{log.res}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center py-4 gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-900 text-white font-black text-xs">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 font-black text-xs">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 font-black text-xs">3</button>
                <span className="text-slate-300">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 font-black text-xs">42</button>
            </div>
        </div>
    );
};

export default AuditLog;
