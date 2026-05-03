import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings2, AlertTriangle, Lock, Zap, Clock, 
    TrendingUp, ShieldAlert, Save, Activity,
    ChevronRight, Globe, Database, ShieldCheck
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface SystemConfig {
    key: string;
    value: any;
    description: string;
}

const ConfigFlags: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/config');
            if (Array.isArray(response.data)) {
                setConfigs(response.data);
            } else {
                setConfigs([]);
            }
        } catch (error) {
            console.error('Failed to fetch configs:', error);
            showAlert({
                title: 'Intelligence Failure',
                message: 'Could not synchronize with the system configuration vault.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (key: string, value: any) => {
        const confirmed = await showConfirm({
            title: 'Critical Configuration Shift',
            message: `You are about to modify [${key}] to [${value}]. This action will be logged in the system audit. Proceed?`,
            confirmText: 'Authorize Change',
            type: 'warning'
        });

        if (confirmed) {
            try {
                setUpdatingKey(key);
                await api.patch('/admin/config', { key, value });
                await fetchConfigs();
                showAlert({
                    title: 'Configuration Propagated',
                    message: `System flag [${key}] successfully updated.`,
                    type: 'success'
                });
            } catch (error) {
                showAlert({
                    title: 'Update Rejected',
                    message: 'The system core rejected the configuration change.',
                    type: 'error'
                });
            } finally {
                setUpdatingKey(null);
            }
        }
    };

    const getConfigValue = (key: string, defaultValue: any) => {
        if (!Array.isArray(configs)) return defaultValue;
        const config = configs.find(c => c.key === key);
        return config ? config.value : defaultValue;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-t-4 border-r-4 border-indigo-500 rounded-full mb-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                />
                <motion.p 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em]"
                >
                    Synchronizing Neural Vault
                </motion.p>
            </div>
        );
    }

    const emergencyLockdown = getConfigValue('emergency_lockdown', false);
    const aglpRate = getConfigValue('AGLP_TO_ETB_RATE', { rate: 1.0 }).rate;
    const packageReferralComm = getConfigValue('AGLP_COMMISSION_PACKAGE_REFERRAL', { value: 0.1 }).value;

    return (
        <div className="min-h-screen pb-20 space-y-10">


            {/* Protocol Governance Module */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lockdown Card */}
                <div className="lg:col-span-12">
                    <div className={`relative group overflow-hidden rounded-[2.5rem] p-1 border transition-all duration-700 ${
                        emergencyLockdown 
                        ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-[0_20px_50px_rgba(225,29,72,0.3)]' 
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                        <div className={`relative h-full w-full rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-500 ${
                            emergencyLockdown ? 'bg-red-950/90 backdrop-blur-md' : 'bg-slate-950'
                        }`}>
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${emergencyLockdown ? 'bg-red-500/20 border border-red-500/50' : 'bg-slate-900 border border-slate-800'}`}>
                                    <ShieldAlert className={`w-8 h-8 ${emergencyLockdown ? 'text-red-500' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                    <h4 className={`text-xl font-black tracking-tight mb-1 ${emergencyLockdown ? 'text-red-100' : 'text-white'}`}>
                                        PLATFORM EMERGENCY LOCKDOWN
                                    </h4>
                                    <p className={`text-sm font-medium ${emergencyLockdown ? 'text-red-400' : 'text-slate-500'}`}>
                                        {emergencyLockdown 
                                            ? 'ALL SERVICES SUSPENDED. System is currently in restricted mediation mode.' 
                                            : 'Instantly halt all matching attempts and agent signups across all clusters.'}
                                    </p>
                                </div>
                            </div>

                            <button 
                                disabled={updatingKey === 'emergency_lockdown'}
                                onClick={() => updateConfig('emergency_lockdown', !emergencyLockdown)}
                                className={`relative group/btn overflow-hidden px-10 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 ${
                                    emergencyLockdown 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)]'
                                }`}
                            >
                                <span className="relative z-10">{emergencyLockdown ? 'DEACTIVATE LOCK' : 'INITIATE LOCKDOWN'}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Economic & Growth Modules */}
                <div className="lg:col-span-6">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="h-full bg-slate-800 border border-slate-700 rounded-[2.5rem] p-8 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <TrendingUp className="w-32 h-32 text-emerald-500" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h5 className="font-black text-white tracking-tight">Growth Mechanics</h5>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 block px-1">
                                    Package Referral Commissions
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        defaultValue={packageReferralComm}
                                        onBlur={(e) => {
                                            const newVal = parseFloat(e.target.value);
                                            if (newVal !== packageReferralComm && !isNaN(newVal)) {
                                                updateConfig('AGLP_COMMISSION_PACKAGE_REFERRAL', { value: newVal });
                                            }
                                        }}
                                        className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-12 pr-16 text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all" 
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center">
                                        <span className="text-xs font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">%/100</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-[10px] font-medium text-slate-300 leading-relaxed px-1">
                                    Defines the payout ratio for tier upgrades. Current efficiency: <span className="text-emerald-500 font-bold">OPTIMIZED</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-6">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="h-full bg-slate-800 border border-slate-700 rounded-[2.5rem] p-8 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap className="w-32 h-32 text-indigo-500" />
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <Zap className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h5 className="font-black text-white tracking-tight">Monetary Protocol</h5>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3 block px-1">
                                    AGLP Exchange Rate
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-indigo-500/50 group-focus-within:text-indigo-500 transition-colors">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        defaultValue={aglpRate}
                                        onBlur={(e) => {
                                            const newVal = parseFloat(e.target.value);
                                            if (newVal !== aglpRate && !isNaN(newVal)) {
                                                updateConfig('AGLP_TO_ETB_RATE', { rate: newVal });
                                            }
                                        }}
                                        className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-12 pr-16 text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 transition-all" 
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center">
                                        <span className="text-xs font-black text-slate-400 group-focus-within:text-indigo-500 transition-colors">1 ETB : AGLP</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-[10px] font-medium text-slate-300 leading-relaxed px-1">
                                    Global currency conversion parity. <span className="text-indigo-400 font-bold italic">Real-time sync enabled.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Withdrawal Policies */}
                <div className="lg:col-span-12">
                    <div className="bg-slate-800 border border-slate-700 rounded-[2.5rem] p-10 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <Activity className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h5 className="font-black text-white text-xl tracking-tight">Capital Integrity Protocols</h5>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Withdrawal & Disbursement Policies</p>
                                </div>
                            </div>
                            <div className="px-4 py-1 bg-amber-500/5 border border-amber-500/20 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Audited</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { key: 'withdrawal_min_amount', label: 'Minimum Floor', icon: ShieldCheck, suffix: 'AGLP', color: 'indigo', bg: 'bg-indigo-500/10', text: 'text-indigo-500', ring: 'focus:ring-indigo-500/20', border: 'focus:border-indigo-500/50' },
                                { key: 'withdrawal_max_amount_daily', label: 'Daily Ceiling', icon: AlertTriangle, suffix: 'AGLP', color: 'rose', bg: 'bg-rose-500/10', text: 'text-rose-500', ring: 'focus:ring-rose-500/20', border: 'focus:border-rose-500/50' },
                                { key: 'withdrawal_fee_percentage', label: 'Processing Logic', icon: Save, suffix: '% Fee', color: 'amber', bg: 'bg-amber-500/10', text: 'text-amber-500', ring: 'focus:ring-amber-500/20', border: 'focus:border-amber-500/50' },
                            ].map((policy) => {
                                const val = getConfigValue(policy.key, policy.key.includes('fee') ? 0.05 : 100);
                                return (
                                    <motion.div 
                                        key={policy.key}
                                        whileHover={{ backgroundColor: 'rgba(30, 41, 59, 1)' }}
                                        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`p-2 rounded-lg ${policy.bg}`}>
                                                <policy.icon className={`w-4 h-4 ${policy.text}`} />
                                            </div>
                                            <span className="text-xs font-black text-white uppercase tracking-tight">{policy.label}</span>
                                        </div>
                                        <div className="relative group">
                                            <input 
                                                type="number" 
                                                step={policy.key.includes('fee') ? "0.01" : "1"}
                                                defaultValue={val}
                                                onBlur={(e) => {
                                                    const newVal = parseFloat(e.target.value);
                                                    if (newVal !== val && !isNaN(newVal)) {
                                                        updateConfig(policy.key, newVal);
                                                    }
                                                }}
                                                className={`w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:ring-2 ${policy.ring} ${policy.border} transition-all`} 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{policy.suffix}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="flex items-center justify-center gap-8 py-6 opacity-80 group">
                <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Distributed Vault</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Edge Cluster Sync</span>
                </div>
            </div>
        </div>
    );
};

export default ConfigFlags;

