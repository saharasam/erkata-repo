import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Loader2, MapPin, UserPlus, ShieldCheck, ShieldOff, Search, ArrowUpRight } from 'lucide-react';
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

interface AdminOperatorListProps {
    onViewDetails: (id: string) => void;
}

const AdminOperatorList: React.FC<AdminOperatorListProps> = ({ onViewDetails }) => {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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

    const toggleStatus = async (person: Personnel) => {
        try {
            setActionLoading(person.id);
            // Use the administrative status endpoint
            await api.patch(`/admin/users/${person.id}/status`, { isActive: !person.isActive });
            fetchPersonnel();
        } catch (error) {
            console.error('Failed to toggle personnel status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchPersonnel();
    }, []);

    const filteredPersonnel = personnel.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Personnel Management</h2>
                    <p className="text-slate-500 text-sm">Manage platform operators and financial verifiers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Search personnel..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95 whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Personnel
                    </button>
                </div>
            </div>

            <AdminInviteList 
                refreshTrigger={refreshTrigger}
                onInviteCancelled={() => setRefreshTrigger(prev => prev + 1)}
            />

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Personnel</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Role</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Region / Zone</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Performance</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                                        <p className="text-slate-400 font-bold">Loading personnel database...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPersonnel.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                                            <Activity className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-600">No personnel records found.</p>
                                            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or invite new members.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPersonnel.map(p => {
                                const isFinancial = p.role === 'financial_operator';
                                return (
                                    <tr 
                                        key={p.id} 
                                        onClick={() => onViewDetails(p.id)}
                                        className="group hover:bg-slate-50/80 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                                                    isFinancial ? 'bg-indigo-950 text-white' : 'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                    {p.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 tracking-tight">{p.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono uppercase">ID: {p.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                isFinancial ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {isFinancial ? (
                                                    <>
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Financial
                                                    </>
                                                ) : (
                                                    <>
                                                        <Activity className="w-3 h-3" />
                                                        Operator
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
                                                <span className={`text-xs font-bold ${p.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {p.isActive ? 'Live' : 'Suspended'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">
                                                    {isFinancial ? 'Global Desk' : (p.zone?.name || 'Global Access')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {!isFinancial && (
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    (p.missedAssignments || 0) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    Missed: {p.missedAssignments || 0}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    disabled={actionLoading === p.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatus(p);
                                                    }}
                                                    className={`p-2 rounded-xl border transition-all active:scale-90 ${
                                                        p.isActive 
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100' 
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                                    }`}
                                                    title={p.isActive ? 'Suspend Personnel' : 'Activate Personnel'}
                                                >
                                                    {p.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
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
