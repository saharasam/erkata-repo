import React, { useState, useEffect } from 'react';
import { Users, X, MapPin, Award, CheckCircle2, ChevronRight, Loader2, Clock } from 'lucide-react';
import api from '../../utils/api';

interface Agent {
  id: string;
  fullName: string;
  tier: string;
  zones: string[];
}

interface AgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  onAssigned: (agentId: string) => void;
}

const AgentAssignmentModal: React.FC<AgentAssignmentModalProps> = ({ 
  isOpen, 
  onClose, 
  requestId, 
  onAssigned 
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAgents = async () => {
        setIsLoading(true);
        try {
          const res = await api.get('/requests/eligible-agents');
          setAgents(res.data);
        } catch (error) {
          console.error('Failed to fetch eligible agents:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAgents();
    }
  }, [isOpen]);

  const handleAssign = async (agentId: string) => {
    setIsAssigning(agentId);
    try {
      await api.post(`/requests/${requestId}/assign`, { agentId });
      onAssigned(agentId);
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Assign Eligible Agent</h3>
              <p className="text-sm font-medium text-slate-400">Request: {requestId.substring(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="font-bold text-slate-500">Loading active agents...</p>
              <p className="text-xs">Sorted by tier and zone</p>
            </div>
          ) : agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="group bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-100 p-5 rounded-3xl transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-300 text-xl shadow-sm">
                      {agent.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{agent.fullName}</h4>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <Award className="w-3 h-3 text-amber-500" />
                          {agent.tier}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full text-[10px] font-bold text-green-600 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full text-[10px] font-semibold text-blue-500 tracking-wide">
                          <MapPin className="w-3 h-3" />
                          {agent.zones.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={!!isAssigning}
                    onClick={() => handleAssign(agent.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10 group/btn"
                  >
                    {isAssigning === agent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Confirm
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                  <MapPin className="w-8 h-8 text-slate-200" />
               </div>
               <h4 className="font-bold text-slate-800 text-lg mb-1">No active agents found</h4>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">No agents are currently active on the platform.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Matchmaking Engine v2.0</span>
            </div>
            <button 
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
                Cancel Process
            </button>
        </div>
      </div>
    </div>
  );
};

export default AgentAssignmentModal;


