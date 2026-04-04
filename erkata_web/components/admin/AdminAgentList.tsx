import React, { useState, useEffect } from 'react';
import { Search, MapPin, Award, MoreHorizontal, ShieldOff, ShieldCheck, UserPlus } from 'lucide-react';
import api from '../../utils/api';
import { Loader2 } from 'lucide-react';
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
    createdAt: string;
}

const AdminAgentList: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

    const filteredAgents = agents.filter(agent => 
        agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = async (agent: Agent) => {
        try {
            const endpoint = agent.isActive ? `/users/${agent.id}/suspend` : `/users/${agent.id}/activate`;
            await api.patch(endpoint);
            fetchAgents();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
        setActionMenuOpen(null);
    };

    return (
        <> 
        <div className="space-y-6" onClick={() => setActionMenuOpen(null)}>
            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">Agent Management</h2>
                     <p className="text-slate-500 text-sm">Monitor and manage agent tiers and status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Search agents..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
                        />
                    </div>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Agent
                    </button>
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
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                    <p className="text-sm text-slate-400 font-medium">Loading agents...</p>
                                </td>
                            </tr>
                        ) : filteredAgents.map(agent => (
                            <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
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
                                            <p className="font-medium text-slate-700 capitalize">{agent.referralLink?.tier || 'FREE'}</p>
                                            <p className="text-[10px] text-slate-400">Joined: {new Date(agent.createdAt).toLocaleDateString()}</p>
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
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActionMenuOpen(actionMenuOpen === agent.id ? null : agent.id);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    
                                    {/* Action Dropdown */}
                                    {actionMenuOpen === agent.id && (
                                        <div className="absolute right-0 top-12 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden">
                                           <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleStatus(agent);
                                                }}
                                                className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                {agent.isActive ? (
                                                    <>
                                                        <ShieldOff className="w-4 h-4 text-red-500" />
                                                        Suspend Agent
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                                        Activate Agent
                                                    </>
                                                )}
                                           </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <InvitePersonnelModal
            isOpen={inviteModalOpen}
            onClose={() => { setInviteModalOpen(false); fetchAgents(); }}
            availableRoles={['agent']}
            defaultRole="agent"
        />
        </>
    );
};

export default AdminAgentList;
