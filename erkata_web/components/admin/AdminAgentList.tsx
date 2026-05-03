import React, { useState, useEffect } from 'react';
import { Search, MapPin, Award, ShieldOff, ShieldCheck, Filter, ChevronDown, Zap, ShieldAlert, Heart, Users, Crown, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import InvitePersonnelModal from '../ui/InvitePersonnelModal';

interface Agent {
    id: string;
    fullName: string;
    isActive: boolean;
    referralLink: {
        tier: string;
    } | null;
    agentZones: {
        zone: { name: string } | null;
        woreda: string;
    }[];
    referredBy?: {
        id: string;
        fullName: string;
    } | null;
    createdAt: string;
    avgRating?: number;
    acceptedCount?: number;
    rejectedCount?: number;
    unfulfilledRate?: number;
    warningCount?: number;
}

interface AdminAgentListProps {
    onViewDetails: (id: string) => void;
}

const AdminAgentList: React.FC<AdminAgentListProps> = ({ onViewDetails }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('ALL');
    const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/users?role=agent');
            setAgents(res.data);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             agent.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = tierFilter === 'ALL' || (agent.referralLink?.tier || 'FREE') === tierFilter;
        return matchesSearch && matchesTier;
    });

    const TIER_CONFIG: Record<string, { color: string, icon: any }> = {
        FREE: { color: 'bg-slate-100 text-slate-500', icon: Zap },
        PEACE: { color: 'bg-emerald-50 text-emerald-600', icon: ShieldAlert },
        LOVE: { color: 'bg-rose-50 text-rose-500', icon: Heart },
        UNITY: { color: 'bg-indigo-50 text-indigo-600', icon: Users },
        ABUNDANT_LIFE: { color: 'bg-amber-50 text-amber-600', icon: Crown },
    };

    const toggleStatus = async (agent: Agent) => {
        try {
            const endpoint = agent.isActive ? `/users/${agent.id}/suspend` : `/users/${agent.id}/activate`;
            await api.patch(endpoint);
            fetchAgents();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">Agent Management</h2>
                     <p className="text-slate-500 text-sm">Monitor and manage agent tiers and status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTierMenuOpen(!isTierMenuOpen);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold transition-all hover:border-indigo-500 shadow-sm"
                        >
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700">
                                {tierFilter === 'ALL' ? 'All Packages' : tierFilter.replace('_', ' ')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTierMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isTierMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2"
                                >
                                    <button 
                                        onClick={() => { setTierFilter('ALL'); setIsTierMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${tierFilter === 'ALL' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">All Registry</span>
                                        </div>
                                        <span className="text-[10px] font-bold opacity-50">{agents.length}</span>
                                    </button>
                                    <div className="h-px bg-slate-50 my-1.5" />
                                    {Object.keys(TIER_CONFIG).map(tier => {
                                        const config = TIER_CONFIG[tier];
                                        const Icon = config.icon;
                                        const count = agents.filter(a => (a.referralLink?.tier || 'FREE') === tier).length;
                                        return (
                                            <button 
                                                key={tier}
                                                onClick={() => { setTierFilter(tier); setIsTierMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${tierFilter === tier ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-3.5 h-3.5 ${tierFilter === tier ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{tier.replace('_', ' ')}</span>
                                                </div>
                                                <span className="text-[10px] font-bold opacity-50">{count}</span>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input 
                            type="text" 
                            placeholder="Search agents..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Agent</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Tier</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Zones</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Referrer</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                    <p className="text-sm text-slate-400 font-medium">Loading agents...</p>
                                </td>
                            </tr>
                        ) : filteredAgents.map(agent => (
                            <tr 
                                key={agent.id} 
                                onClick={() => onViewDetails(agent.id)}
                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {agent.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{agent.fullName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{agent.id.split('-')[0].toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                        agent.isActive 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                                        {agent.isActive ? 'active' : 'inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Award className={`w-4 h-4 ${
                                            agent.referralLink?.tier === 'ABUNDANT_LIFE' ? 'text-purple-500' :
                                            agent.referralLink?.tier === 'UNITY' ? 'text-indigo-500' :
                                            agent.referralLink?.tier === 'LOVE' ? 'text-amber-500' : 'text-slate-400'
                                        }`} />
                                        <div>
                                            <p className="font-medium text-slate-700 capitalize whitespace-nowrap">{agent.referralLink?.tier || 'FREE'}</p>
                                            <p className="text-[10px] text-slate-400 whitespace-nowrap">Joined: {new Date(agent.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {agent.agentZones.length > 0 ? agent.agentZones.map((az, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" />
                                                {az.zone?.name || 'Unknown'} / {az.woreda}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] text-slate-300 italic">No zones assigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {agent.referredBy ? (
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(agent.referredBy!.id);
                                            }}
                                            className="flex items-center gap-2 hover:bg-white p-1.5 rounded-xl border border-transparent hover:border-indigo-100 hover:shadow-sm transition-all"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">
                                                {agent.referredBy.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-xs hover:text-indigo-600 transition-colors">{agent.referredBy.fullName}</p>
                                                <p className="text-[9px] text-slate-400 font-mono">#{agent.referredBy.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-slate-50 rounded text-[10px] font-bold text-slate-400 border border-slate-100">
                                            Direct Signup
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStatus(agent);
                                            }}
                                            className={`p-2 rounded-xl border transition-all active:scale-90 ${
                                                agent.isActive 
                                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100' 
                                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                            }`}
                                            title={agent.isActive ? 'Suspend Agent' : 'Activate Agent'}
                                        >
                                            {agent.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAgentList;
