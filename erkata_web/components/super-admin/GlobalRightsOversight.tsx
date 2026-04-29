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
  Zap,
  UserCheck,
  UserMinus,
  Heart,
  Crown,
  Anchor,
  Flame,
  Filter
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemPackage {
    id: string;
    name: string;
    displayName: string;
}

interface AgentRecord {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tier: string;
  acceptedCount: number;
  rejectedCount: number;
  unfulfilledCount: number;
  unfulfilledRate?: number;
  avgRating: number;
  package?: {
    displayName: string;
    description?: string;
  };
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

interface GlobalRightsOversightProps {
    onViewDetails: (agentId: string) => void;
}

const GlobalRightsOversight: React.FC<GlobalRightsOversightProps> = ({ onViewDetails }) => {
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('ALL');
    const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);
    const [agents, setAgents] = useState<AgentRecord[]>([]);
    const [systemPackages, setSystemPackages] = useState<SystemPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [agentsRes, packagesRes] = await Promise.all([
                api.get('/users?role=agent'),
                api.get('/admin/packages')
            ]);
            setAgents(agentsRes.data);
            setSystemPackages(packagesRes.data);
        } catch (error) {
            console.error('Failed to fetch oversight data:', error);
            showAlert({
                title: 'Data Synchronization Error',
                message: 'Unable to retrieve the latest agent and protocol registry.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
              fetchData();
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
    
    const toggleStatus = async (agent: AgentRecord) => {
        const action = agent.isActive ? 'SUSPEND' : 'ACTIVATE';
        const confirmed = await showConfirm({
            title: `${action} AGENT PROTOCOL`,
            message: `You are about to ${action.toLowerCase()} platform access for ${agent.fullName}. ${agent.isActive ? 'This will instantly block all dashboard access.' : 'This will restore full operational authority.'}`,
            confirmText: `Confirm ${action}`,
            type: agent.isActive ? 'error' : 'success'
        });

        if (confirmed) {
            try {
              setActionLoading(agent.id);
              await api.patch(`/admin/users/${agent.id}/status`, { isActive: !agent.isActive });
              showAlert({
                  title: 'Governance Synchronized',
                  message: `Agent ${agent.fullName} status updated to ${!agent.isActive ? 'ACTIVE' : 'SUSPENDED'}.`,
                  type: 'success'
              });
              fetchData();
            } catch (err) {
              showAlert({
                title: 'Override Rejected',
                message: 'Internal system validation failed for status modification.',
                type: 'error'
              });
            } finally {
              setActionLoading(null);
            }
        }
    };

    const counts = {
        ALL: agents.length,
        FREE: agents.filter(a => a.tier === 'FREE').length,
        PEACE: agents.filter(a => a.tier === 'PEACE').length,
        LOVE: agents.filter(a => a.tier === 'LOVE').length,
        UNITY: agents.filter(a => a.tier === 'UNITY').length,
        ABUNDANT_LIFE: agents.filter(a => a.tier === 'ABUNDANT_LIFE').length,
    };

    const TIER_ICONS: Record<string, any> = {
        FREE: Zap,
        PEACE: ShieldAlert,
        LOVE: Heart,
        UNITY: Users,
        ABUNDANT_LIFE: Crown,
    };

    const filteredAgents = agents.filter(a => {
        const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = tierFilter === 'ALL' || a.tier === tierFilter;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-visible flex flex-col">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Agent Rights & Tier Control</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tier-based commission & geo-fencing authority</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsTierMenuOpen(!isTierMenuOpen)}
                                    className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:border-indigo-500 transition-all min-w-[200px] justify-between group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {tierFilter === 'ALL' ? (
                                            <Filter className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                        ) : (
                                            <div className={`w-2 h-2 rounded-full ${TIER_CONFIG[tierFilter].color.split(' ')[0].replace('text-', 'bg-')}`} />
                                        )}
                                        <span className="text-slate-900">
                                            {tierFilter === 'ALL' ? 'All Packages' : tierFilter.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isTierMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isTierMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setIsTierMenuOpen(false)}
                                            />
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 z-20 overflow-hidden p-2"
                                            >
                                                <div 
                                                    onClick={() => { setTierFilter('ALL'); setIsTierMenuOpen(false); }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                                                        tierFilter === 'ALL' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Filter className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">All Registry</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-black">{counts.ALL}</span>
                                                </div>
                                                <div className="h-px bg-slate-50 my-2 mx-2" />
                                                {systemPackages.map(pkg => {
                                                    const Icon = TIER_ICONS[pkg.name] || Filter;
                                                    const isActive = tierFilter === pkg.name;
                                                    return (
                                                        <div 
                                                            key={pkg.id}
                                                            onClick={() => { setTierFilter(pkg.name); setIsTierMenuOpen(false); }}
                                                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                                                                isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Icon className={`w-4 h-4 ${isActive ? TIER_CONFIG[pkg.name]?.color.split(' ')[0] : 'text-slate-300'}`} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{pkg.displayName || pkg.name}</span>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-black">
                                                                {agents.filter(a => a.tier === pkg.name).length}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Instant Search Registry..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 w-full transition-all" 
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Agent Identity</th>
                                <th className="px-8 py-5">Geographic Zones</th>
                                <th className="px-8 py-5">Tier Status</th>
                                <th className="px-8 py-5">Account Status</th>
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
                                    <tr key={agent.id} className={`hover:bg-slate-50/30 transition-colors group ${!agent.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
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
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                                                TIER_CONFIG[agent.tier]?.color || TIER_CONFIG.FREE.color
                                            } ${TIER_CONFIG[agent.tier]?.border || TIER_CONFIG.FREE.border}`}>
                                                {agent.package?.displayName || agent.tier.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                                agent.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                                            }`}>
                                                {agent.isActive ? '● active' : '○ suspended'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {(() => {
                                                const successRate = 100 - (agent.unfulfilledRate || 0);
                                                return (
                                                    <div className="space-y-1.5 w-32">
                                                        <div className="flex justify-between text-[9px] font-black text-slate-400 tracking-tighter uppercase leading-none">
                                                            <span>Success Rate</span>
                                                            <span className="text-slate-600">{successRate.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500" style={{ width: `${successRate}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
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
                                                <button 
                                                    disabled={actionLoading === agent.id}
                                                    onClick={() => toggleStatus(agent)}
                                                    className={`p-2.5 rounded-2xl border transition-all active:scale-90 ${
                                                        agent.isActive 
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100' 
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                                    }`}
                                                    title={agent.isActive ? 'Suspend Agent' : 'Activate Agent'}
                                                >
                                                    {agent.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={() => onViewDetails(agent.id)}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all active:scale-90"
                                                >
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
