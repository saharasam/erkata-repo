import React, { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  Activity, 
  ShieldAlert,
  Search,
  MoreVertical,
  Timer
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface OperatorPerformance {
  id: string;
  name: string;
  volume: number;
  avgTime: string;
  rejectionRate: string;
  status: 'active' | 'suspended' | 'probation';
}

const MOCK_OPERATORS: OperatorPerformance[] = [
  { id: 'OP-501', name: 'Bruke Samuel', volume: 1240, avgTime: '14m', rejectionRate: '1.2%', status: 'active' },
  { id: 'OP-508', name: 'Lidya Mekonnen', volume: 840, avgTime: '18m', rejectionRate: '4.5%', status: 'probation' },
  { id: 'OP-512', name: 'Yonas Gebre', volume: 2100, avgTime: '12m', rejectionRate: '0.8%', status: 'active' },
  { id: 'OP-515', name: 'Hirut Tekle', volume: 450, avgTime: '22m', rejectionRate: '8.2%', status: 'suspended' },
];

const OperatorOversight: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = async (operator: OperatorPerformance, newStatus: string) => {
        const confirmed = await showConfirm({
            title: `Confirm Status: ${newStatus.toUpperCase()}`,
            message: `Are you sure you want to change status for ${operator.name} to ${newStatus}?`,
            confirmText: `Set to ${newStatus}`,
            type: newStatus === 'active' ? 'success' : 'error'
        });

        if (confirmed) {
            showAlert({
                title: 'Quality Action Logged',
                message: `Operator ${operator.id} status updated to ${newStatus}.`,
                type: 'success'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">Operator Quality Control</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mediation efficiency & rejection monitoring</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter operators..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 w-48" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Operator</th>
                            <th className="px-8 py-5">Mediation Volume</th>
                            <th className="px-8 py-5">Avg Time-to-Bundle</th>
                            <th className="px-8 py-5">Rejection Rate</th>
                            <th className="px-8 py-5">Quality status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_OPERATORS.map((op) => (
                            <tr key={op.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                                            {op.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{op.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">ID: {op.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-3 h-3 text-indigo-400" />
                                        <span className="text-xs font-bold text-slate-700">{op.volume} bundles</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-3 h-3 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-600">{op.avgTime}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 font-mono text-[11px] font-bold">
                                    <span className={parseFloat(op.rejectionRate) > 5 ? 'text-red-600' : 'text-emerald-600'}>
                                        {op.rejectionRate}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${
                                        op.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 
                                        op.status === 'probation' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {op.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {op.status === 'active' ? (
                                            <button 
                                                onClick={() => handleStatusChange(op, 'suspended')}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStatusChange(op, 'active')}
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Privacy Constraint Notice</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Per compliance rules, individual Operator transaction earnings are not visible in the Super Admin dashboard. 
                        Focus remains on aggregate quality KPIs and rejection patterns across the mediation layer.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OperatorOversight;
