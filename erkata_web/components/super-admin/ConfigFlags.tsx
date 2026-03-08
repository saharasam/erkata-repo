import React, { useState } from 'react';
import { Settings2, ShieldCheck, AlertTriangle, Lock, Zap, Clock, TrendingUp, ShieldAlert } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

const ConfigFlags: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [flags, setFlags] = useState({
        auto_bundle: true,
        referral_commissions: true,
        emergency_lockdown: false,
    });

    const toggleFlag = async (flag: keyof typeof flags) => {
        const confirmed = await showConfirm({
            title: 'Critical Configuration Change',
            message: `You are about to modify a system-level flag: ${String(flag)}. This requires Super Admin verification.`,
            confirmText: 'Verify & Apply',
            type: 'warning'
        });

        if (confirmed) {
            setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
            showAlert({
                title: 'System Flag Updated',
                message: `Flag [${String(flag)}] has been set to ${!flags[flag]}. Audit entry created.`,
                type: 'success'
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex border-b border-indigo-800 pb-8 mb-8">
                    <div className="shrink-0 p-4 bg-indigo-800 rounded-2xl mr-6">
                        <Lock className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Guarded System Config</h3>
                        <p className="text-indigo-300 text-sm font-medium leading-relaxed max-w-xl">
                            The following parameters control core platform mechanics. Changes here affect live transactions and are subject to mandatory secondary authentication.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="bg-indigo-800/40 border border-indigo-700 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-black">Auto-Bundle Policy</p>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Global Mediation</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleFlag('auto_bundle')}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${flags.auto_bundle ? 'bg-indigo-500' : 'bg-indigo-950'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${flags.auto_bundle ? 'ml-6' : 'ml-0'}`} />
                        </button>
                    </div>

                    <div className="bg-indigo-800/40 border border-indigo-700 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-black">Referral Commissions</p>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Monetary Control</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleFlag('referral_commissions')}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${flags.referral_commissions ? 'bg-indigo-500' : 'bg-indigo-950'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${flags.referral_commissions ? 'ml-6' : 'ml-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Global Timeouts & Thresholds</h4>
                <div className="grid grid-cols-3 gap-8">
                    {[
                        { label: 'Mediation Timeout', val: '24h', icon: Clock },
                        { label: 'Escalation Trigger', val: '3d', icon: AlertTriangle },
                        { label: 'Resolution Window', val: '7d', icon: ShieldCheck },
                    ].map((c, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <c.icon className="w-4 h-4 text-slate-400" />
                                {c.label}
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="text" defaultValue={c.val} className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-black text-slate-700" />
                                <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-900 italic uppercase">Update</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-red-950 rounded-3xl p-8 border border-red-900/50 flex items-center justify-between group">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-red-900/50 rounded-2xl flex items-center justify-center animate-pulse">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-red-100 tracking-tight">PLATFORM EMERGENCY LOCKDOWN</h4>
                        <p className="text-red-300 text-xs font-medium">Instantly suspends all new mediation attempts & agent signups.</p>
                    </div>
                </div>
                <button 
                    onClick={() => toggleFlag('emergency_lockdown')}
                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-red-900/50 hover:bg-red-500 transition-all active:scale-95"
                >
                    ENTER LOCKDOWN
                </button>
            </div>
        </div>
    );
};

export default ConfigFlags;
