import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown,
  Globe,
  Search,
  ArrowUpRight,
  Activity,
  Zap
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface AgentRecord {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tier: string;
  referralLink?: {
    tier: string;
  };
  agentZones: Array<{
    id: string;
    woreda: string;
    zone: {
      name: string;
    };
  }>;
}

const TIER_CONFIG: Record<string, { color: string; border: string }> = {
  FREE: { color: 'text-slate-400 bg-slate-50', border: 'border-slate-200' },
  PEACE: { color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
  LOVE: { color: 'text-rose-500 bg-rose-100', border: 'border-rose-200' },
  UNITY: { color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
  ABUNDANT_LIFE: { color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
};

const TIERS = ['FREE', 'PEACE', 'LOVE', 'UNITY', 'ABUNDANT_LIFE'];

const GlobalRightsOversight: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');
    const [agents, setAgents] = useState<AgentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/users?role=agent');
        setAgents(response.data);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        showAlert({
            title: 'Registry Sync Error',
            message: 'Unable to synchronize global agent rights database.',
            type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchAgents();
    }, []);

    const handleTierChange = async (agent: AgentRecord, direction: 'upgrade' | 'downgrade') => {
        const currentTier = agent.referralLink?.tier || 'FREE';
        const currentIndex = TIERS.indexOf(currentTier);
        let nextTier = currentTier;

        if (direction === 'upgrade' && currentIndex < TIERS.length - 1) {
            nextTier = TIERS[currentIndex + 1];
        } else if (direction === 'downgrade' && currentIndex > 0) {
            nextTier = TIERS[currentIndex - 1];
        }

        if (nextTier === currentTier) return;

        const confirmed = await showConfirm({
            title: `Confirm Tier ${direction.toUpperCase()}`,
            message: `You are shifting ${agent.fullName} from ${currentTier} to ${nextTier}. This update modifies operational zone limits and commission logic immediately.`,
            confirmText: `Execute ${direction}`,
            type: direction === 'upgrade' ? 'success' : 'warning'
        });

        if (confirmed) {
            try {
              setActionLoading(agent.id);
              await api.patch(`/users/agent/${agent.id}/tier`, { tier: nextTier });
              showAlert({
                  title: 'Cryptographic Tier Shift Success',
                  message: `Authority updated. Agent ${agent.fullName} is now on ${nextTier} protocol.`,
                  type: 'success'
              });
              fetchAgents();
            } catch (err) {
              showAlert({
                title: 'Override Rejected',
                message: 'Internal system validation failed for tier shift.',
                type: 'error'
              });
            } finally {
              setActionLoading(null);
            }
        }
    };

    const filteredAgents = agents.filter(a => 
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Agents', value: agents.length.toString(), icon: Users, color: 'text-indigo-600' },
                    { label: 'Avg Success', value: '94.2%', icon: TrendingUp, color: 'text-emerald-600' },
                    { label: 'Active Zones', value: Array.from(new Set(agents.flatMap(a => a.agentZones.map(z => z.woreda)))).length.toString(), icon: Globe, color: 'text-amber-600' },
                    { label: 'Escalation Rate', value: '1.2%', icon: ShieldAlert, color: 'text-red-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-indigo-500/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-all">Global</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Agent Rights & Tier Control</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tier-based commission & geo-fencing authority</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search agents by name or key..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full transition-all" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Agent Identity</th>
                                <th className="px-8 py-5">Geographic Zones</th>
                                <th className="px-8 py-5">Tier Status</th>
                                <th className="px-8 py-5">Performance</th>
                                <th className="px-8 py-5 text-right">Oversight Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-10"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredAgents.length > 0 ? (
                                filteredAgents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs uppercase group-hover:scale-110 transition-transform">
                                                    {agent.fullName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{agent.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">Protocol: {agent.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {agent.agentZones.length > 0 ? agent.agentZones.map(z => (
                                                    <span key={z.id} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 border border-slate-200">
                                                        <MapPin className="w-2.5 h-2.5 text-indigo-500" />
                                                        {z.woreda}
                                                    </span>
                                                )) : (
                                                    <span className="text-[9px] font-black text-slate-300 italic uppercase">Zero zones assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${TIER_CONFIG[agent.referralLink?.tier || 'FREE']?.color} ${TIER_CONFIG[agent.referralLink?.tier || 'FREE']?.border}`}>
                                                {agent.referralLink?.tier.replace('_', ' ') || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5 w-32">
                                                <div className="flex justify-between text-[9px] font-black text-slate-400 tracking-tighter uppercase leading-none">
                                                    <span>Success Rate</span>
                                                    <span className="text-slate-600">92%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: '92%' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    disabled={actionLoading === agent.id}
                                                    onClick={() => handleTierChange(agent, 'downgrade')}
                                                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all active:scale-90"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    disabled={actionLoading === agent.id}
                                                    onClick={() => handleTierChange(agent, 'upgrade')}
                                                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all active:scale-90"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all active:scale-90">
                                                    <ArrowUpRight className="w-4 h-4" />
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
                                            <p className="text-slate-400 font-bold italic">No intelligence matching this protocol identifier.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-[100px] transition-transform group-hover:scale-110 duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shrink-0">
                        <Activity className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight mb-2 uppercase">Appellate Tier Override Warning</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-3xl">
                            Super Admin tier overrides bypass standard automated performance benchmarks and referral progression paths. 
                            Manual escalation should only be performed in extraordinary cases where regional consensus 
                            is absent. Every adjustment is cryptographically recorded in the platform board's permanent ledger.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalRightsOversight;
