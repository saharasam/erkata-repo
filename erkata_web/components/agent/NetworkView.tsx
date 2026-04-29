import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Filter,
  Activity,
  UserCheck,
  ChevronDown,
  Zap,
  ShieldAlert,
  Heart,
  Crown
} from 'lucide-react';

const TIER_CONFIG: Record<string, { color: string; border: string }> = {
  FREE: { color: 'text-slate-400 bg-slate-50', border: 'border-slate-200' },
  PEACE: { color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
  LOVE: { color: 'text-rose-500 bg-rose-100', border: 'border-rose-200' },
  UNITY: { color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
  ABUNDANT_LIFE: { color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-100' },
};

const TIER_ICONS: Record<string, any> = {
  FREE: Zap,
  PEACE: ShieldAlert,
  LOVE: Heart,
  UNITY: Users,
  ABUNDANT_LIFE: Crown,
};

interface NetworkViewProps {
  profile: any;
  finance: any;
  onNavigateToPackages: () => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ profile, finance, onNavigateToPackages }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);
  
  const referrals = profile?.referrals || [];
  const filteredReferrals = referrals.filter((ref: any) => {
    const matchesSearch = ref.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || ref.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const counts = {
    ALL: referrals.length,
    FREE: referrals.filter((r: any) => r.tier === 'FREE').length,
    PEACE: referrals.filter((r: any) => r.tier === 'PEACE').length,
    LOVE: referrals.filter((r: any) => r.tier === 'LOVE').length,
    UNITY: referrals.filter((r: any) => r.tier === 'UNITY').length,
    ABUNDANT_LIFE: referrals.filter((r: any) => r.tier === 'ABUNDANT_LIFE').length,
  };

  const tiers = ['FREE', 'PEACE', 'LOVE', 'UNITY', 'ABUNDANT_LIFE'];

  const usedSlots = finance?.usedSlots || 0;
  const totalSlots = finance?.totalSlots || 0;
  const utilizationPct = Math.min((usedSlots / (totalSlots || 1)) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Referral Network</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitor your network's growth and slot utilization.</p>
        </div>
        {finance?.tier !== 'ABUNDANT_LIFE' && (
          <button 
             onClick={onNavigateToPackages}
             className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Get New Slots
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                 <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Network</p>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800">{referrals.length}</span>
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">+12% this month</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                 <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Commissions Earned</p>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800 uppercase leading-none">
                {finance?.totalEarnings?.toLocaleString() || '0'}
                <span className="text-sm font-bold text-slate-400 ml-1">AGLP</span>
              </span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                 </div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slot Usage</p>
              </div>
              <span className="text-sm font-black text-slate-800">{usedSlots}/{totalSlots}</span>
           </div>
           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${utilizationPct}%` }}
                 transition={{ duration: 1 }}
                 className="h-full bg-orange-500 rounded-full" 
              />
           </div>
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-visible">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Your Referrals
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsTierMenuOpen(!isTierMenuOpen)}
                className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-500 transition-all min-w-[180px] justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  {tierFilter === 'ALL' ? (
                    <Filter className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${TIER_CONFIG[tierFilter]?.color.split(' ')[0].replace('text-', 'bg-') || 'bg-slate-400'}`} />
                  )}
                  <span className="text-slate-600">
                    {tierFilter === 'ALL' ? 'All Packages' : tierFilter.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isTierMenuOpen ? 'rotate-180' : ''}`} />
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
                      className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 z-20 overflow-hidden p-2"
                    >
                      <div 
                        onClick={() => { setTierFilter('ALL'); setIsTierMenuOpen(false); }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                          tierFilter === 'ALL' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Filter className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">All Registry</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-black">{(counts as any).ALL}</span>
                      </div>
                      <div className="h-px bg-slate-50 my-2 mx-2" />
                      {tiers.map(tierName => {
                        const Icon = TIER_ICONS[tierName] || Filter;
                        const isActive = tierFilter === tierName;
                        const count = (counts as any)[tierName];
                        return (
                          <div 
                            key={tierName}
                            onClick={() => { setTierFilter(tierName); setIsTierMenuOpen(false); }}
                            className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                              isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-3.5 h-3.5 ${isActive ? TIER_CONFIG[tierName]?.color.split(' ')[0] : 'text-slate-300'}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{tierName.replace('_', ' ')}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-black">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600/40 transition-all w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Package</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined On</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredReferrals.map((referral: any, idx: number) => (
                  <motion.tr 
                    key={referral.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                           {referral.fullName.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{referral.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase ${
                        referral.package?.displayName ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {referral.package?.displayName || referral.tier?.replace('_', ' ') || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 lowercase capitalize">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {referral.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{new Date(referral.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    {searchQuery ? 'No referrals match your search.' : 'No referrals yet. Share your referral code to grow your network!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tips section */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <ExternalLink className="w-32 h-32" />
         </div>
         <div className="max-w-xl relative z-10">
            <h3 className="text-2xl font-black mb-4">Leverage Your Network</h3>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8">
               You earn commission on every transaction completed by agents you've referred. Help your network grow by sharing your referral code and mentorsing new joiners.
            </p>
            <button 
               onClick={onNavigateToPackages}
               className="bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
            >
               Upgrade Packages
            </button>
         </div>
      </div>
    </div>
  );
};

export default NetworkView;
