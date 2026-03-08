import React from 'react';
import { 
  User, 
  MapPin, 
  Shield, 
  Users, 
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileViewProps {
  profile: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  if (!profile) return null;

  const tier = profile.referralLink?.tier || 'FREE';
  
  // Helper to determine limits based on Tier (Sync with backend logic)
  const getLimits = (tier: string) => {
    switch (tier) {
      case 'ABUNDANT_LIFE': return { zones: 100, referrals: 31 };
      case 'UNITY': return { zones: 5, referrals: 23 };
      case 'LOVE': return { zones: 3, referrals: 16 };
      case 'PEACE': return { zones: 2, referrals: 7 };
      default: return { zones: 1, referrals: 3 };
    }
  };

  const limits = getLimits(tier);
  const zoneUsage = (profile.agentZones?.length || 0) / limits.zones;
  const referralUsage = (profile.referrals?.length || 0) / limits.referrals;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Agent Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your professional credentials and subscription limits.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-erkata-primary/10 text-erkata-primary rounded-2xl border border-erkata-primary/20">
           <Shield className="w-4 h-4" />
           <span className="text-sm font-bold uppercase tracking-wider">{tier.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex items-center gap-6 relative overflow-hidden">
             <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                <User className="w-12 h-12" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">{profile.fullName}</h2>
                <p className="text-slate-500 font-medium mb-3">{profile.email}</p>
                <div className="flex gap-2">
                   <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">Verified Agent</span>
                   <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 uppercase">Active</span>
                </div>
             </div>
          </div>

          {/* Territory Management */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-indigo-600" />
                   Operating Territory
                </h3>
                <span className="text-xs font-bold text-slate-400">
                   {profile.agentZones?.length || 0} / {limits.zones} Zones Active
                </span>
             </div>
             
             <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {profile.agentZones?.map((zone: any) => (
                      <div key={zone.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                         <div>
                            <p className="text-sm font-bold text-slate-800">{zone.kifleKetema}</p>
                            <p className="text-xs text-slate-500">Woreda {zone.woreda}</p>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-indigo-600">Active</span>
                         </div>
                      </div>
                   ))}
                   {(!profile.agentZones || profile.agentZones.length === 0) && (
                      <div className="col-span-2 p-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                         <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                         <p className="text-sm font-medium">No zones assigned yet.</p>
                      </div>
                   )}
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-50">
                   <div className="flex justify-between items-center mb-4">
                      <div>
                         <p className="text-sm font-bold text-slate-800">Zone Limit Reach</p>
                         <p className="text-xs text-slate-400">Upgrade your tier to expand your operational reach.</p>
                      </div>
                      <span className="text-lg font-black text-slate-900">{Math.round(zoneUsage * 100)}%</span>
                   </div>
                   <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min(zoneUsage * 100, 100)}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className={`h-full rounded-full ${zoneUsage >= 1 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Referral & Tier Stats */}
        <div className="space-y-8">
           {/* Referral Summary */}
           <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <Users className="w-5 h-5 text-indigo-600" />
                 <h3 className="font-bold text-slate-800">Referral Network</h3>
              </div>

              <div className="relative">
                 <div className="flex justify-between text-xs mb-2 font-bold text-slate-600">
                    <span>Slot Usage</span>
                    <span>{profile.referrals?.length || 0} / {limits.referrals}</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(referralUsage * 100, 100)}%` }}
                       transition={{ duration: 1, delay: 0.2 }}
                       className="h-full bg-purple-500 rounded-full" 
                    />
                 </div>
                 <div className="bg-purple-50 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p className="text-[10px] text-purple-700 leading-relaxed font-medium">
                       You've reached {Math.round(referralUsage * 100)}% of your slots. Successful referrals earn you 5% commission on their transactions.
                    </p>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Referrals</p>
                 {profile.referrals?.slice(0, 3).map((ref: any) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                       <span className="text-xs font-bold text-slate-700 line-clamp-1">{ref.fullName}</span>
                       <span className="text-[10px] text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>
                 ))}
                 {(!profile.referrals || profile.referrals.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No referrals found.</p>
                 )}
              </div>
           </div>

           {/* Tier Upgrade Banner */}
           <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
              <Zap className="w-8 h-8 mb-4 text-indigo-300" />
              <h3 className="text-xl font-bold mb-2 tracking-tight">Expand Your Reach</h3>
              <p className="text-xs text-indigo-100 leading-relaxed mb-6">
                 Upgrade to the next tier for unlimited zones and more referral slots. Secure higher commission brackets.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 font-bold text-sm rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
                 Upgrade Now
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
