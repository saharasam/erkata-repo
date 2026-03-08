import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Activity,
  History,
  MoreVertical,
  Search
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  proposalsCount: number;
  status: 'active' | 'suspended';
}

const MOCK_ADMINS: AdminUser[] = [
  { id: 'ADM-101', name: 'Sarah Tekle', email: 'sarah.t@erkata.com', lastLogin: '10m ago', proposalsCount: 142, status: 'active' },
  { id: 'ADM-105', name: 'Kidus Yohannes', email: 'kidus.y@erkata.com', lastLogin: '2h ago', proposalsCount: 89, status: 'active' },
  { id: 'ADM-112', name: 'Abebe Bikila', email: 'abebe.b@erkata.com', lastLogin: '1d ago', proposalsCount: 204, status: 'suspended' },
];

const AdminManagement: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');

    const handleRevoke = async (admin: AdminUser) => {
        const confirmed = await showConfirm({
            title: 'REVOKE ADMIN RIGHTS',
            message: `Are you sure you want to PERMANENTLY revoke admin rights for ${admin.name}? This action will be audited.`,
            confirmText: 'Revoke Rights',
            type: 'error'
        });

        if (confirmed) {
            showAlert({
                title: 'Rights Revoked',
                message: `Admin rights for ${admin.email} have been terminated.`,
                type: 'success'
            });
        }
    };

    const handleAssign = () => {
        showAlert({
            title: 'Assign Admin Rights',
            message: 'Admin assignment interface requires secondary authentication (U2F/OTP).',
            type: 'info'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Platform Delegation Layer</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-80 transition-all" 
                            />
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleAssign}
                    className="bg-indigo-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:bg-slate-900 flex items-center gap-2 transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Assign New Admin
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-5">Administrator</th>
                            <th className="px-6 py-5">Last Activity</th>
                            <th className="px-6 py-5">Proposals</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_ADMINS.map((admin) => (
                            <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100 uppercase">
                                            {admin.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{admin.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                        <Clock className="w-3 h-3 text-slate-300" />
                                        {admin.lastLogin}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <History className="w-3 h-3 text-indigo-400" />
                                        <span className="text-sm font-black text-indigo-600 tracking-tight">{admin.proposalsCount}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                                        admin.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}>
                                        {admin.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Activity className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleRevoke(admin)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Delegation Audit Policy</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        All Admin rights assignments and revocations are recorded in the permanent global audit log. 
                        Revocation is immediate and invalidates all active sessions for the target user.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
