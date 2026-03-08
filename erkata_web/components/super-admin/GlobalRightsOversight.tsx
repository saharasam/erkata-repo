import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown,
  Globe,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { Can } from '../ui/Can';
import { Action } from '../../hooks/usePermissions';

type AgentTier = 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface AgentRecord {
  id: string;
  name: string;
  tier: AgentTier;
  woreda: string;
  successRate: string;
  totalEarnings: string;
}

const MOCK_AGENTS: AgentRecord[] = [
  { id: 'AGT-001', name: 'Haile Selassie', tier: 'gold', woreda: 'Bole', successRate: '98%', totalEarnings: '45,200 ETB' },
  { id: 'AGT-042', name: 'Tewodros Kasshun', tier: 'silver', woreda: 'Kirkos', successRate: '94%', totalEarnings: '28,500 ETB' },
  { id: 'AGT-089', name: 'Zewditu Menelik', tier: 'platinum', woreda: 'Bole', successRate: '100%', totalEarnings: '89,900 ETB' },
  { id: 'AGT-112', name: 'Almaz Ayana', tier: 'bronze', woreda: 'Arada', successRate: '88%', totalEarnings: '12,400 ETB' },
];

const TIER_CONFIG = {
  standard: { color: 'text-slate-400 bg-slate-50', border: 'border-slate-200' },
  bronze: { color: 'text-orange-600 bg-orange-50', border: 'border-orange-100' },
  silver: { color: 'text-slate-500 bg-slate-100', border: 'border-slate-200' },
  gold: { color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
  platinum: { color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
};

const GlobalRightsOversight: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');

    const handleTierChange = async (agent: AgentRecord, direction: 'upgrade' | 'downgrade') => {
        const confirmed = await showConfirm({
            title: `Confirm Tier ${direction.toUpperCase()}`,
            message: `Are you sure you want to ${direction} ${agent.name} to the next tier? This will affect their earning commission and rights.`,
            confirmText: `Confirm ${direction}`,
            type: direction === 'upgrade' ? 'success' : 'warning'
        });

        if (confirmed) {
            showAlert({
                title: 'Tier Updated',
                message: `${agent.name} has been ${direction}d. Audit log entry created.`,
                type: 'success'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Agents', value: '1,248', icon: Users, color: 'text-indigo-600' },
                    { label: 'Avg Success', value: '94.2%', icon: TrendingUp, color: 'text-emerald-600' },
                    { label: 'Active Zones', value: '18', icon: Globe, color: 'text-amber-600' },
                    { label: 'Escalation Rate', value: '1.2%', icon: ShieldAlert, color: 'text-red-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">Agent Rights & Tier Control</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tier-based commission & geo-fencing</p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search agents..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Agent Identity</th>
                                <th className="px-8 py-5">Assigned Zone</th>
                                <th className="px-8 py-5">Tier Status</th>
                                <th className="px-8 py-5">Performance</th>
                                <th className="px-8 py-5 text-right">Tier Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_AGENTS.map((agent) => (
                                <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                                                {agent.id}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">Platform ID: {agent.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                            {agent.woreda}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${TIER_CONFIG[agent.tier].color} ${TIER_CONFIG[agent.tier].border}`}>
                                            {agent.tier}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-1.5 w-32">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 tracking-tighter uppercase">
                                                <span>Success</span>
                                                <span>{agent.successRate}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: agent.successRate }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Can perform={Action.UPDATE_TIER}>
                                                <button 
                                                    onClick={() => handleTierChange(agent, 'downgrade')}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </Can>
                                            <Can perform={Action.UPDATE_TIER}>
                                                <button 
                                                    onClick={() => handleTierChange(agent, 'upgrade')}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all active:scale-90"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                            </Can>
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900/50 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110 duration-700" />
                <div className="relative z-10">
                    <h4 className="text-xl font-black tracking-tight mb-2">Tier Override Warning</h4>
                    <p className="text-indigo-300 text-sm font-medium leading-relaxed max-w-xl">
                        Super Admin tier overrides bypass standard automated progression rules. 
                        Every tier change triggers an immediate physical audit check and notifies the Regional Admin.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalRightsOversight;
