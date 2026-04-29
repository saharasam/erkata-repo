import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Loader2, MapPin, UserPlus, ShieldCheck } from 'lucide-react';
import InvitePersonnelModal from '../ui/InvitePersonnelModal';
import AdminInviteList from './AdminInviteList';

interface Personnel {
    id: string;
    fullName: string;
    isActive: boolean;
    phone?: string;
    role: string;
    zone?: {
        name: string;
    };
    missedAssignments?: number;
    createdAt: string;
}

const AdminOperatorList: React.FC = () => {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchPersonnel = async () => {
        setIsLoading(true);
        try {
            // Fetch both operators and financial operators
            const [ops, finOps] = await Promise.all([
                api.get('/admin/users?role=operator'),
                api.get('/admin/users?role=financial_operator')
            ]);
            
            // Combine and sort by date
            const combined = [...ops.data, ...finOps.data].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setPersonnel(combined);
        } catch (error) {
            console.error('Failed to fetch personnel:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonnel();
    }, []);

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Personnel Management</h2>
                    <p className="text-slate-500 text-sm">Manage platform operators and financial verifiers.</p>
                </div>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Personnel
                </button>
            </div>

            <AdminInviteList 
                refreshTrigger={refreshTrigger}
                onInviteCancelled={() => setRefreshTrigger(prev => prev + 1)}
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-500 font-bold">Loading personnel...</p>
                </div>
            ) : personnel.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Activity className="w-7 h-7 text-slate-300" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-600">No personnel registered yet.</p>
                        <p className="text-sm text-slate-400 mt-1">Use the invite button above to bring team members onto the platform.</p>
                    </div>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-black transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite First Member
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personnel.map(p => {
                        const isFinancial = p.role === 'financial_operator';
                        return (
                            <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isFinancial ? 'bg-indigo-900 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {p.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{p.fullName}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                <p className="text-xs text-slate-500 capitalize">{p.isActive ? 'Active' : 'Suspended'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${isFinancial ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {isFinancial ? 'Financial' : 'Operator'}
                                    </span>
                                </div>

                                {isFinancial ? (
                                    <div className="py-3 border-t border-slate-50 mb-3">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Financial Desk</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-3 border-t border-slate-50 mb-3 justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">
                                                {p.zone?.name || 'Global Access'}
                                            </span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            (p.missedAssignments || 0) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'
                                        }`} title="Missed Backlog">
                                            Missed: {p.missedAssignments || 0}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-2 flex gap-2">
                                    <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                                        Profile
                                    </button>
                                    <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <InvitePersonnelModal
            isOpen={inviteModalOpen}
            onClose={() => { setInviteModalOpen(false); fetchPersonnel(); setRefreshTrigger(prev => prev + 1); }}
            availableRoles={['operator', 'financial_operator']}
            defaultRole="operator"
        />
        </>
    );
};

export default AdminOperatorList;
