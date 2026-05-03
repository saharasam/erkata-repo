import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  ShieldCheck, 
  Activity,
  Search,
  UserCheck,
  UserMinus,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import InvitePersonnelModal from '../ui/InvitePersonnelModal';
import api from '../../utils/api';
import AdminInviteList from '../admin/AdminInviteList';

interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    operatorMatches: number;
    resolutionProposals: number;
  };
}

interface AdminManagementProps {
    onViewDetails: (id: string) => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ onViewDetails }) => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const url = roleFilter === 'all' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
        const response = await api.get(url);
        setAdmins(response.data);
      } catch (err) {
        console.error('Failed to fetch personnel:', err);
        showAlert({
            title: 'Vault Sync Failed',
            message: 'Could not retrieve the administrative delegation list.',
            type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchAdmins();
    }, [roleFilter]);

    const toggleStatus = async (admin: AdminUser) => {
        const action = admin.isActive ? 'SUSPEND' : 'ACTIVATE';
        const confirmed = await showConfirm({
            title: `${action} PERSONNEL RIGHTS`,
            message: `You are about to ${action.toLowerCase()} administrative rights for ${admin.fullName}. This will affect their ability to manage platform operations immediately.`,
            confirmText: `Confirm ${action}`,
            type: admin.isActive ? 'error' : 'warning'
        });

        if (confirmed) {
            try {
              setActionLoading(admin.id);
              await api.patch(`/admin/users/${admin.id}/status`, { isActive: !admin.isActive });
              showAlert({
                  title: 'Permissions Synchronized',
                  message: `Status for ${admin.fullName} has been updated to ${!admin.isActive ? 'ACTIVE' : 'SUSPENDED'}.`,
                  type: 'success'
              });
              fetchAdmins();
            } catch (err) {
              showAlert({
                title: 'Intelligence Rejection',
                message: 'The system core rejected the status shift. Check permissions.',
                type: 'error'
              });
            } finally {
              setActionLoading(null);
            }
        }
    };

    const handleInviteSuccess = () => {
        fetchAdmins();
        setRefreshTrigger(prev => prev + 1);
    };

    const filteredAdmins = admins.filter(a => 
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.phone.includes(searchTerm)
    );

    return (
        <>
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div className="flex-1 w-full">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-4">Platform Delegation Layer</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or intelligence tag..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full transition-all" 
                            />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['all', 'admin', 'operator', 'financial_operator'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        roleFilter === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-slate-900/20 hover:bg-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                >
                    <UserPlus className="w-4 h-4" />
                    DELEGATE AUTHORITY
                </button>
            </div>

            <AdminInviteList 
                refreshTrigger={refreshTrigger}
                onInviteCancelled={() => setRefreshTrigger(prev => prev + 1)}
            />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Administrator / Identity</th>
                            <th className="px-8 py-5">Role Protocol</th>
                            <th className="px-8 py-5">Operational Load</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-8 py-6"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                                </tr>
                            ))
                        ) : filteredAdmins.length > 0 ? (
                            filteredAdmins.map((admin) => (
                                <tr 
                                    key={admin.id} 
                                    onClick={() => onViewDetails(admin.id)}
                                    className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100 uppercase group-hover:scale-110 transition-transform">
                                                {admin.fullName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{admin.fullName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Phone className="w-3 h-3 text-slate-300" />
                                                    <p className="text-[10px] text-slate-400 font-bold">{admin.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                            admin.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-16">Proposals</span>
                                                <span className="text-xs font-black text-slate-700">{admin._count.resolutionProposals}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-16">Matches</span>
                                                <span className="text-xs font-black text-slate-700">{admin._count.operatorMatches}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                            admin.isActive ? 'text-emerald-600' : 'text-red-500'
                                        }`}>
                                            {admin.isActive ? '● active' : '○ suspended'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                disabled={actionLoading === admin.id}
                                                onClick={() => toggleStatus(admin)}
                                                className={`p-2 rounded-xl transition-all ${
                                                    admin.isActive 
                                                    ? 'text-red-400 hover:text-red-600 hover:bg-red-50' 
                                                    : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {admin.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <p className="text-slate-400 font-bold italic">No intelligence records match the current filter.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 flex items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-24 h-24 text-white" />
                </div>
                <div className="w-12 h-12 bg-indigo-900/50 rounded-2xl flex items-center justify-center border border-indigo-500/30 shrink-0">
                    <ShieldAlert className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-lg font-black text-white mb-2 tracking-tight">Appellate Authority Protocol</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                        As Super Admin, you hold the sole power to delegate operational authority. 
                        Suspension is immediate across all system nodes. Every status shift is cryptographically 
                        logged in the permanent ledger for oversight by the platform board.
                    </p>
                </div>
            </div>
        </div>

        <InvitePersonnelModal
            isOpen={inviteModalOpen}
            onClose={() => { setInviteModalOpen(false); handleInviteSuccess(); }}
            availableRoles={['admin', 'operator', 'financial_operator']}
            defaultRole="operator"
        />
        </>
    );
};

export default AdminManagement;

