import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  Activity, 
  ShieldAlert,
  Search,
  MoreVertical,
  Timer,
  Zap
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface OperatorPerformance {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  user: {
      email: string;
  };
  _count: {
      operatorMatches: number;
  };
}

const OperatorOversight: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');
    const [operators, setOperators] = useState<OperatorPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchOperators = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/users?role=operator');
        setOperators(response.data);
      } catch (err) {
        console.error('Failed to fetch operators:', err);
        showAlert({
            title: 'Protocol Link Error',
            message: 'Unable to connect to the operator oversight registry.',
            type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchOperators();
    }, []);

    const handleStatusChange = async (operator: OperatorPerformance) => {
        const newStatus = !operator.isActive;
        const confirmed = await showConfirm({
            title: `Confirm ${newStatus ? 'Activation' : 'Operational Suspension'}`,
            message: `You are about to ${newStatus ? 'reactivate' : 'suspend'} ${operator.fullName}. This action immediately modifies their mediation rights across all assigned regions.`,
            confirmText: newStatus ? 'Activate Protocol' : 'Execute Suspension',
            type: newStatus ? 'success' : 'error'
        });

        if (confirmed) {
            try {
              setActionLoading(operator.id);
              await api.patch(`/admin/users/${operator.id}/status`, { isActive: newStatus });
              showAlert({
                  title: 'System State Modified',
                  message: `Operator ${operator.fullName} state updated to ${newStatus ? 'ACTIVE' : 'SUSPENDED'}.`,
                  type: 'success'
              });
              fetchOperators();
            } catch (err) {
              showAlert({
                title: 'Security Override Blocked',
                message: 'Failed to update operator state due to internal protocol violation.',
                type: 'error'
              });
            } finally {
              setActionLoading(null);
            }
        }
    };

    const filteredOperators = operators.filter(op => 
        op.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Operator Quality Control</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mediation efficiency & rejection monitoring</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter operators by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full transition-all" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Mediator Identity</th>
                                <th className="px-8 py-5">Mediation Volume</th>
                                <th className="px-8 py-5">Efficiency Metrics</th>
                                <th className="px-8 py-5">Quality Status</th>
                                <th className="px-8 py-5 text-right">Appellate Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-10"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredOperators.length > 0 ? (
                                filteredOperators.map((op) => (
                                    <tr key={op.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                    {op.fullName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{op.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{op.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 tracking-tight">{op._count.operatorMatches} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Bundles</span></span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    <Timer className="w-3 h-3" />
                                                    <span>Response: 14m</span>
                                                </div>
                                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                op.isActive 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' 
                                                : 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-100'
                                            }`}>
                                                {op.isActive ? 'Active Protocol' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button 
                                                    disabled={actionLoading === op.id}
                                                    onClick={() => handleStatusChange(op)}
                                                    className={`p-2.5 rounded-2xl border transition-all active:scale-90 ${
                                                        op.isActive 
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100' 
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                                    }`}
                                                >
                                                    {op.isActive ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all active:scale-90">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Zap className="w-8 h-8 text-slate-200" />
                                            <p className="text-slate-400 font-bold italic">No meditation personnel detected in query results.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight mb-2 uppercase">Core Mediation Privacy Standards</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-3xl">
                            As per Super Admin appellate guidelines, individual Operator commission tables are redacted to prevent 
                            mediation bias. Oversight efforts are strictly concentrated on aggregate quality KPIs, 
                            response latencies, and transaction rejection patterns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorOversight;

