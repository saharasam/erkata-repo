import React, { useState, useEffect } from 'react';
import { Settings2, ShieldCheck, AlertTriangle, Lock, Zap, Clock, TrendingUp, ShieldAlert, Save } from 'lucide-react';
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
                console.error('Expected array from /admin/config, got:', typeof response.data);
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
            message: `You are about to modify [${key}] to [${value}]. This action will be logged in the system audit and executed across all node clusters. Proceed?`,
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
                    message: `System flag [${key}] successfully updated. Changes are now live.`,
                    type: 'success'
                });
            } catch (error) {
                console.error('Failed to update config:', error);
                showAlert({
                    title: 'Update Rejected',
                    message: 'The system core rejected the configuration change. Check firewall and permissions.',
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
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-black text-xs uppercase tracking-widest animate-pulse">Accessing Vault...</p>
                </div>
            </div>
        );
    }

    const autoBundle = getConfigValue('auto_bundle', true);
    const referralComms = getConfigValue('referral_commissions', true);
    const emergencyLockdown = getConfigValue('emergency_lockdown', false);
    const highRiskThreshold = getConfigValue('high_risk_threshold_etb', 100000);
    const aglpRate = getConfigValue('AGLP_TO_ETB_RATE', { rate: 1.0 }).rate;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-slate-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Settings2 className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 flex border-b border-slate-800 pb-8 mb-8">
                    <div className="shrink-0 p-4 bg-indigo-900/50 rounded-2xl mr-6 border border-indigo-500/30">
                        <Lock className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Protocol Governance</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
                            The following parameters control core platform mechanics. Changes here affect live transactions and are subject to mandatory audit logging.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <Zap className={`w-5 h-5 ${autoBundle ? 'text-amber-400' : 'text-slate-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-100">Auto-Bundle Policy</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Mediation</p>
                            </div>
                        </div>
                        <button 
                            disabled={updatingKey === 'auto_bundle'}
                            onClick={() => updateConfig('auto_bundle', !autoBundle)}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${autoBundle ? 'bg-indigo-600' : 'bg-slate-700'} ${updatingKey === 'auto_bundle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoBundle ? 'ml-6' : 'ml-0'}`} />
                        </button>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <TrendingUp className={`w-5 h-5 ${referralComms ? 'text-emerald-400' : 'text-slate-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-100">Referral Commissions</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monetary Control</p>
                            </div>
                        </div>
                        <button 
                            disabled={updatingKey === 'referral_commissions'}
                            onClick={() => updateConfig('referral_commissions', !referralComms)}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${referralComms ? 'bg-emerald-600' : 'bg-slate-700'} ${updatingKey === 'referral_commissions' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${referralComms ? 'ml-6' : 'ml-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Timeouts & Thresholds</h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase italic">Live Synchronized</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-12 h-12 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-3 text-slate-900 font-black text-sm mb-4">
                            <ShieldAlert className="w-5 h-5 text-indigo-600" />
                            High Risk Threshold (ETB)
                        </div>
                        <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                            Defines the transaction amount above which a case is automatically flagged for Appellate review.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ETB</span>
                                <input 
                                    type="number" 
                                    defaultValue={highRiskThreshold}
                                    onBlur={(e) => {
                                        const newVal = parseInt(e.target.value);
                                        if (newVal !== highRiskThreshold) {
                                            updateConfig('high_risk_threshold_etb', newVal);
                                        }
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Clock className="w-12 h-12 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-3 text-slate-900 font-black text-sm mb-4">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            AGLP Exchange Rate
                        </div>
                        <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                            Defines the number of AGLP credited per 1 ETB deposited. A value of 1.0 means 1:1 parity with ETB.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">1 ETB =</span>
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
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-14 pr-4 py-2 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">AGLP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={`rounded-3xl p-8 border flex items-center justify-between group transition-all duration-500 ${emergencyLockdown ? 'bg-red-50 border-red-200' : 'bg-red-950 border-red-900/50'}`}>
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${emergencyLockdown ? 'bg-red-200 animate-none' : 'bg-red-900/50 animate-pulse'}`}>
                        <ShieldAlert className={`w-6 h-6 ${emergencyLockdown ? 'text-red-700' : 'text-red-500'}`} />
                    </div>
                    <div>
                        <h4 className={`text-lg font-black tracking-tight ${emergencyLockdown ? 'text-red-900' : 'text-red-100'}`}>PLATFORM EMERGENCY LOCKDOWN</h4>
                        <p className={`text-xs font-medium ${emergencyLockdown ? 'text-red-700' : 'text-red-300'}`}>
                            {emergencyLockdown 
                                ? 'System is currently in RESTRICTED mode. All incoming requests are held.' 
                                : 'Instantly suspends all new mediation attempts & agent signups.'}
                        </p>
                    </div>
                </div>
                <button 
                    disabled={updatingKey === 'emergency_lockdown'}
                    onClick={() => updateConfig('emergency_lockdown', !emergencyLockdown)}
                    className={`${emergencyLockdown ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50`}
                >
                    {emergencyLockdown ? 'RELEASE LOCKDOWN' : 'ENTER LOCKDOWN'}
                </button>
            </div>
        </div>
    );
};

export default ConfigFlags;

