import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  MapPin, 
  Users, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown,
  Globe,
  Activity,
  Zap,
  UserCheck,
  UserMinus,
  Wallet,
  Clock,
  ExternalLink,
  Target,
  Award
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface AgentProfile {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tier: string;
  phone: string;
  email?: string;
  referralCode?: string;
  package?: {
    displayName: string;
  };
  agentZones: Array<{
    id: string;
    woreda: string;
    zone: {
      name: string;
    };
  }>;
  referrals: Array<{
    id: string;
    fullName: string;
    createdAt: string;
    role: string;
  }>;
}

interface FinanceSummary {
  balance: number;
  aglpAvailable: number;
  aglpPending: number;
  aglpWithdrawn: number;
  usedSlots: number;
  totalSlots: number;
  usedZones: number;
  totalZones: number;
  currentTier: string;
  tier: string;
  weeklyGrowth: {
    percentage: string;
    amount: number;
    chart: number[];
  };
  history: Array<{
    id: string;
    action: string;
    amount: number;
    type: string;
    createdAt: string;
    metadata: any;
  }>;
}

interface AgentDeepDiveProps {
  agentId: string;
  onBack: () => void;
}

const TIER_CONFIG: Record<string, { color: string; border: string; bg: string }> = {
  FREE: { color: 'text-slate-400', border: 'border-slate-200', bg: 'bg-slate-50' },
  PEACE: { color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50' },
  LOVE: { color: 'text-rose-500', border: 'border-rose-100', bg: 'bg-rose-50' },
  UNITY: { color: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50' },
  ABUNDANT_LIFE: { color: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50' },
};

const TIERS = ['FREE', 'PEACE', 'LOVE', 'UNITY', 'ABUNDANT_LIFE'];

const AgentDeepDive: React.FC<AgentDeepDiveProps> = ({ agentId, onBack }) => {
  const { showConfirm, showAlert } = useModal();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, financeRes] = await Promise.all([
        api.get(`/users/${agentId}/profile`),
        api.get(`/users/${agentId}/finance`)
      ]);
      setProfile(profileRes.data);
      setFinance(financeRes.data);
    } catch (err) {
      console.error('Failed to fetch agent details:', err);
      showAlert({
        title: 'Registry Sync Error',
        message: 'Unable to synchronize agent deep-dive data.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [agentId]);

  const handleTierChange = async (direction: 'upgrade' | 'downgrade') => {
    if (!profile) return;
    const currentTier = profile.tier || 'FREE';
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
      message: `You are shifting ${profile.fullName} from ${currentTier} to ${nextTier}. This modifies operational capacity immediately.`,
      confirmText: `Execute ${direction}`,
      type: direction === 'upgrade' ? 'success' : 'warning'
    });

    if (confirmed) {
      try {
        setActionLoading(true);
        await api.patch(`/users/agent/${profile.id}/tier`, { tier: nextTier });
        showAlert({
          title: 'Tier Shift Success',
          message: `${profile.fullName} is now on ${nextTier} protocol.`,
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
        setActionLoading(false);
      }
    }
  };

  const toggleStatus = async () => {
    if (!profile) return;
    const action = profile.isActive ? 'SUSPEND' : 'ACTIVATE';
    const confirmed = await showConfirm({
      title: `${action} AGENT PROTOCOL`,
      message: `You are about to ${action.toLowerCase()} platform access for ${profile.fullName}.`,
      confirmText: `Confirm ${action}`,
      type: profile.isActive ? 'error' : 'success'
    });

    if (confirmed) {
      try {
        setActionLoading(true);
        await api.patch(`/admin/users/${profile.id}/status`, { isActive: !profile.isActive });
        showAlert({
          title: 'Governance Synchronized',
          message: `Agent ${profile.fullName} status updated.`,
          type: 'success'
        });
        fetchData();
      } catch (err) {
        showAlert({
          title: 'Override Rejected',
          message: 'Status modification failed.',
          type: 'error'
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Synchronizing Intelligence...</p>
      </div>
    );
  }

  if (!profile || !finance) return null;

  const tierStyles = TIER_CONFIG[profile.tier] || TIER_CONFIG.FREE;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            disabled={actionLoading}
            onClick={() => handleTierChange('downgrade')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <ChevronDown className="w-3 h-3" /> Downgrade
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleTierChange('upgrade')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <ChevronUp className="w-3 h-3" /> Upgrade Tier
          </button>
          <button 
            disabled={actionLoading}
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 border rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 disabled:opacity-50 ${
              profile.isActive 
              ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-500 hover:text-white' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            {profile.isActive ? <UserMinus className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
            {profile.isActive ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-10 flex flex-col md:flex-row gap-10">
          <div className="w-32 h-32 rounded-[2rem] bg-indigo-900 flex items-center justify-center font-black text-white text-3xl shrink-0 shadow-2xl shadow-indigo-900/20">
            {profile.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.fullName}</h1>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tierStyles.color} ${tierStyles.bg} ${tierStyles.border}`}>
                  {profile.package?.displayName || profile.tier.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${profile.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {profile.isActive ? '● Active' : '○ Suspended'}
                </span>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">ID: {profile.id} • Protocol: {profile.role}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-slate-900">92.4%</p>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referral Code</p>
                <p className="text-xl font-black text-indigo-600">{profile.referralCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                <p className="text-xl font-black text-slate-900">{profile.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-black text-slate-900">4.8</p>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Finance & Zones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wallet Overview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Aglp Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Financial liquidity & earnings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Growth</p>
                <span className="text-emerald-600 font-black text-sm">+{finance.weeklyGrowth.percentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Available', value: finance.aglpAvailable.toLocaleString(), sub: 'Ready for withdrawal', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                { label: 'Pending', value: finance.aglpPending.toLocaleString(), sub: 'Awaiting confirmation', color: 'text-amber-600', bg: 'bg-amber-50/50' },
                { label: 'Withdrawn', value: finance.aglpWithdrawn.toLocaleString(), sub: 'Total payout volume', color: 'text-slate-600', bg: 'bg-slate-50' },
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-3xl ${stat.bg} border border-transparent hover:border-slate-100 transition-all`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value} <span className="text-[10px]">AGLP</span></p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent Ledger History */}
            <div className="mt-8 pt-8 border-t border-slate-50">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Recent Activity Stream
              </h4>
              <div className="space-y-3">
                {finance.history.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                        log.type === 'Withdrawal' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {log.type[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(log.createdAt).toLocaleDateString()} • {log.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${log.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()} AGLP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zones Overview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Geographic Authority</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Assigned operational zones</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                <span className="text-indigo-600 font-black text-sm">{finance.usedZones} / {finance.totalZones}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.agentZones.map((z) => (
                <div key={z.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-500/20 transition-all">
                  <Globe className="w-4 h-4 text-indigo-500 mb-2" />
                  <p className="text-xs font-black text-slate-900 uppercase">{z.woreda}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{z.zone.name}</p>
                </div>
              ))}
              {profile.agentZones.length === 0 && (
                <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">No regional zones assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Referrals & Network */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-[60px]" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest leading-none">Referral Network</h3>
                <p className="text-[10px] text-indigo-200/50 font-bold uppercase tracking-tight mt-1">1st-generation downline</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Recruited</p>
                <p className="text-2xl font-black">{finance.usedSlots}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Max Capacity</p>
                <p className="text-2xl font-black">{finance.totalSlots}</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {profile.referrals.map((ref) => (
                <div key={ref.id} className="group cursor-pointer">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-300">
                        {ref.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-black">{ref.fullName}</p>
                        <p className="text-[9px] text-indigo-200/40 font-bold uppercase">Joined {new Date(ref.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-indigo-200/20 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
              {profile.referrals.length === 0 && (
                <div className="py-12 text-center text-indigo-200/20">
                  <p className="text-[10px] font-black uppercase tracking-widest italic">No downline nodes detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest leading-none">Integrity Radar</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Platform performance metrics</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Platform Reliability', value: 94, color: 'bg-indigo-500' },
                { label: 'Client Satisfaction', value: 88, color: 'bg-emerald-500' },
                { label: 'Regional Dominance', value: 42, color: 'bg-amber-500' },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{stat.label}</span>
                    <span className="text-slate-900">{stat.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-indigo-900 rounded-3xl text-white relative overflow-hidden group">
               <ShieldAlert className="w-8 h-8 text-indigo-400/30 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform duration-500" />
               <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-indigo-300">Enforcement Note</p>
               <p className="text-[10px] font-medium leading-relaxed">Agent has maintained zero critical disputes for the last 30 operational cycles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDeepDive;
