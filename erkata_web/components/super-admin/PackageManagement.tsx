import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, DollarSign, Users, Map, Info, Save, RotateCcw, TrendingUp, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface SystemPackage {
    id: string;
    name: string;
    displayName: string;
    price: number;
    referralSlots: number;
    zoneLimit: number;
    description: string;
    requiresApproval: boolean;
}

const TIER_THEMES: Record<string, any> = {
    'ABUNDANT_LIFE': {
        gradient: 'from-amber-400 via-amber-500 to-amber-600',
        bg: 'bg-amber-50/50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        glow: 'shadow-amber-500/20',
        iconBg: 'bg-amber-100',
        accent: 'bg-amber-500',
        ring: 'ring-amber-500/10'
    },
    'UNITY': {
        gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50/50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        glow: 'shadow-indigo-500/20',
        iconBg: 'bg-indigo-100',
        accent: 'bg-indigo-500',
        ring: 'ring-indigo-500/10'
    },
    'LOVE': {
        gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50/50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        glow: 'shadow-emerald-500/20',
        iconBg: 'bg-emerald-100',
        accent: 'bg-emerald-500',
        ring: 'ring-emerald-500/10'
    },
    'PEACE': {
        gradient: 'from-sky-400 via-sky-500 to-sky-600',
        bg: 'bg-sky-50/50',
        border: 'border-sky-200',
        text: 'text-sky-700',
        glow: 'shadow-sky-500/20',
        iconBg: 'bg-sky-100',
        accent: 'bg-sky-500',
        ring: 'ring-sky-500/10'
    },
    'FREE': {
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        bg: 'bg-slate-50/50',
        border: 'border-slate-200',
        text: 'text-slate-700',
        glow: 'shadow-slate-500/20',
        iconBg: 'bg-slate-100',
        accent: 'bg-slate-500',
        ring: 'ring-slate-500/10'
    }
};

const getTheme = (name: string) => TIER_THEMES[name] || TIER_THEMES['FREE'];

const PackageManagement: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<SystemPackage[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SystemPackage>>({});

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            showAlert({
                title: 'Data Retrieval Error',
                message: 'Could not synchronize with the package repository.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg: SystemPackage) => {
        setEditingId(pkg.id);
        setEditData(pkg);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSave = async (id: string) => {
        const confirmed = await showConfirm({
            title: 'Authorize Package Restructuring',
            message: 'Updating package parameters will immediately affect future upgrades and agent capacity limits. Proceed with deployment?',
            confirmText: 'Deploy Changes',
            type: 'warning'
        });

        if (confirmed) {
            try {
                await api.patch(`/admin/packages/${id}`, editData);
                await fetchPackages();
                setEditingId(null);
                showAlert({
                    title: 'Deployment Successful',
                    message: 'Package parameters have been propagated across the network.',
                    type: 'success'
                });
            } catch (error) {
                console.error('Failed to update package:', error);
                showAlert({
                    title: 'Deployment Failed',
                    message: 'The system rejected the package modification. Check connectivity and permissions.',
                    type: 'error'
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-black text-xs uppercase tracking-widest animate-pulse">Syncing Tiers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        Tier Architecture
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-2 uppercase tracking-[0.1em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Configure economic & capacity limits for agent tiers
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {packages.map((pkg, idx) => {
                        const isEditing = editingId === pkg.id;
                        const theme = getTheme(pkg.name);
                        
                        return (
                            <motion.div 
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={!isEditing ? { y: -8, transition: { duration: 0.2 } } : {}}
                                className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 flex flex-col ${
                                    isEditing 
                                    ? `border-indigo-500 ring-8 ${theme.ring} shadow-2xl scale-[1.02] z-10` 
                                    : `border-slate-100 hover:border-slate-200 hover:shadow-2xl ${theme.glow}`
                                }`}
                            >
                                {/* Tier Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-[0.03] rounded-bl-[5rem] pointer-events-none transition-opacity duration-500 group-hover:opacity-[0.08]`} />

                                <div className="p-8 flex-grow">
                                    {/* Header: Name & Price */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center font-black text-xl border-2 ${theme.border} ${theme.text} shadow-sm`}>
                                            {pkg.name.charAt(0)}
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-slate-400 mb-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Entry Fee</span>
                                            </div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 text-indigo-600 bg-slate-50 p-2 rounded-xl border border-indigo-100">
                                                    <input 
                                                        type="number" 
                                                        value={editData.price || 0}
                                                        onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                                                        className="w-24 text-xl font-black focus:outline-none bg-transparent"
                                                    />
                                                    <span className="text-xs font-black">ETB</span>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-black text-slate-900 leading-none">
                                                    {parseFloat(pkg.price.toString()).toLocaleString()}
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase ml-1.5 tracking-tighter">ETB</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title & Desc */}
                                    <div className="mb-8">
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={editData.displayName || ''}
                                                onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                                                className="text-2xl font-black text-slate-900 tracking-tight border-b-2 border-indigo-200 focus:outline-none bg-transparent w-full mb-3"
                                            />
                                        ) : (
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
                                                {pkg.displayName || pkg.name.replace('_', ' ')}
                                                {pkg.name === 'ABUNDANT_LIFE' && <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />}
                                            </h4>
                                        )}
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                ID: {pkg.name}
                                            </span>
                                            {isEditing ? (
                                                <textarea 
                                                    value={editData.description || ''}
                                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                                                    rows={2}
                                                    className="w-full text-sm text-slate-600 border border-indigo-100 rounded-xl p-3 focus:outline-none bg-slate-50/50 font-medium italic"
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                                                    "{pkg.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                        <div className="bg-slate-50/80 p-4 rounded-[1.5rem] border border-slate-100/50">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Referrals</span>
                                            </div>
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    value={editData.referralSlots || 0}
                                                    onChange={(e) => setEditData({...editData, referralSlots: parseInt(e.target.value)})}
                                                    className="w-full text-xl font-black text-indigo-600 focus:outline-none bg-transparent"
                                                />
                                            ) : (
                                                <p className="text-xl font-black text-slate-900">
                                                    {pkg.referralSlots}
                                                    <span className="text-[10px] text-slate-400 font-bold ml-1.5 uppercase">Slots</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-slate-50/80 p-4 rounded-[1.5rem] border border-slate-100/50">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Map className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Territory</span>
                                            </div>
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    value={editData.zoneLimit || 0}
                                                    onChange={(e) => setEditData({...editData, zoneLimit: parseInt(e.target.value)})}
                                                    className="w-full text-xl font-black text-indigo-600 focus:outline-none bg-transparent"
                                                />
                                            ) : (
                                                <p className="text-xl font-black text-slate-900">
                                                    {pkg.zoneLimit === 100 ? '∞' : pkg.zoneLimit}
                                                    <span className="text-[10px] text-slate-400 font-bold ml-1.5 uppercase">Zones</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 pt-0 mt-auto">
                                    {isEditing ? (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleCancel} 
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all active:scale-95"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                CANCEL
                                            </button>
                                            <button 
                                                onClick={() => handleSave(pkg.id)} 
                                                className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-2xl text-xs font-black hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-200"
                                            >
                                                <Save className="w-4 h-4" />
                                                DEPLOY CHANGES
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleEdit(pkg)} 
                                            className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white px-4 py-4 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95 group/btn"
                                        >
                                            RECONFIGURE TIER
                                            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <ShieldCheck className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <Info className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h5 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Governance Protocol Notice</h5>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-3xl">
                            Tier modifications are destructive to local edge caches. Agents currently in the upgrade flow may experience a session reset. 
                            All price adjustments must be verified against the <span className="text-white font-bold">AGLP Liquidity Pool</span> before deployment to mainnet.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PackageManagement;
