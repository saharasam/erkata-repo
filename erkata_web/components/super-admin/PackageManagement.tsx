import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Users, Map, Info, Save, RotateCcw } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Package className="w-6 h-6 text-indigo-600" />
                        Tier Architecture
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wider">Configure economic & capacity limits for agent tiers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => {
                    const isEditing = editingId === pkg.id;
                    return (
                        <div key={pkg.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isEditing ? 'border-indigo-500 ring-4 ring-indigo-500/5 shadow-xl scale-[1.01]' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
                                            pkg.name === 'ABUNDANT_LIFE' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                            pkg.name === 'UNITY' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                            pkg.name === 'LOVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                            'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}>
                                            {pkg.name.charAt(0)}
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <input 
                                                    type="text"
                                                    value={editData.displayName || ''}
                                                    onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                                                    className="text-lg font-black text-slate-900 tracking-tight border-b-2 border-indigo-200 focus:outline-none bg-transparent w-full"
                                                />
                                            ) : (
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{pkg.displayName || pkg.name.replace('_', ' ')}</h4>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">INTERNAL: {pkg.name}</span>
                                                {isEditing ? (
                                                    <input 
                                                        type="text"
                                                        value={editData.description || ''}
                                                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                                                        className="text-xs text-slate-600 border-b border-indigo-200 focus:outline-none flex-grow bg-transparent font-medium italic"
                                                    />
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic font-medium">{pkg.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <RotateCcw className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleSave(pkg.id)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                                                    <Save className="w-4 h-4" />
                                                    DEPLOY
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEdit(pkg)} className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl text-xs font-black transition-colors uppercase tracking-widest border border-indigo-100">
                                                Edit Config
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 mt-8 border-t border-slate-50 pt-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign className="w-3 h-3" />
                                            Acquisition Cost
                                        </p>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <input 
                                                    type="number" 
                                                    value={editData.price || 0}
                                                    onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                                                    className="w-24 text-xl font-black focus:outline-none bg-slate-50 rounded-lg px-2 py-1"
                                                />
                                                <span className="text-sm font-black">ETB</span>
                                            </div>
                                        ) : (
                                            <p className="text-xl font-black text-slate-900">{parseFloat(pkg.price.toString()).toLocaleString()} <span className="text-sm text-slate-400 font-bold uppercase tracking-tight ml-1">ETB</span></p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            Referral Slots
                                        </p>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                value={editData.referralSlots || 0}
                                                onChange={(e) => setEditData({...editData, referralSlots: parseInt(e.target.value)})}
                                                className="w-16 text-xl font-black focus:outline-none bg-slate-50 rounded-lg px-2 py-1"
                                            />
                                        ) : (
                                            <p className="text-xl font-black text-slate-900">{pkg.referralSlots} <span className="text-sm text-slate-400 font-bold uppercase tracking-tight ml-1">Slots</span></p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Map className="w-3 h-3" />
                                            Zone Capacity
                                        </p>
                                        {isEditing ? (
                                            <input 
                                                type="number" 
                                                value={editData.zoneLimit || 0}
                                                onChange={(e) => setEditData({...editData, zoneLimit: parseInt(e.target.value)})}
                                                className="w-16 text-xl font-black focus:outline-none bg-slate-50 rounded-lg px-2 py-1"
                                            />
                                        ) : (
                                            <p className="text-xl font-black text-slate-900">{pkg.zoneLimit === 100 ? '∞' : pkg.zoneLimit} <span className="text-sm text-slate-400 font-bold uppercase tracking-tight ml-1">Zones</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <Info className="w-12 h-12 text-white" />
                </div>
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Governance Notice</h5>
                <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">
                    Package modifications are destructive to local tier caches. Agents currently in the upgrade flow may experience a session reset. All price changes must be verified against the AGLP Liquidity Pool.
                </p>
            </div>
        </div>
    );
};

export default PackageManagement;
