import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, MapPin, Sparkles, Heart, ArrowUpCircle, AlertCircle, Link as LinkIcon, CheckCheck, Copy } from 'lucide-react';
import { PackageSelection } from './PackageSelection';
import api from '../../utils/api';

export interface PackagesViewProps {
  finance: any;
  profile: any;
  onUpgradeComplete: () => void;
}

const tierMeta: Record<string, { icon: any, color: string, bg: string, text: string }> = {
  FREE: { icon: Shield, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', text: 'text-slate-600' },
  PEACE: { icon: Shield, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  LOVE: { icon: Heart, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-600' },
  UNITY: { icon: Users, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  ABUNDANT_LIFE: { icon: Sparkles, color: 'from-purple-600 to-fuchsia-600', bg: 'bg-purple-50', text: 'text-purple-600' }
};

export const PackagesView: React.FC<PackagesViewProps> = ({ finance, profile, onUpgradeComplete }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const rawTier = finance?.tier || 'FREE';
  const meta = tierMeta[rawTier] || tierMeta.FREE;
  const Icon = meta.icon;

  const [referralData, setReferralData] = useState<{ code: string; link: string } | null>(
    profile?.referralCode ? { code: profile.referralCode as string, link: `${window.location.origin}/register?ref=${profile.referralCode as string}` } : null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post<{ code: string; link: string }>('/users/me/referral-code');
      setReferralData(res.data);
    } catch (e) {
      console.error('Failed to generate referral code:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!referralData) return;
    await navigator.clipboard.writeText(referralData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isUpgrading) {
    return (
      <PackageSelection 
        currentTier={rawTier}
        onComplete={() => {
          setIsUpgrading(false);
          onUpgradeComplete();
        }} 
        onSkip={() => setIsUpgrading(false)}
        skipText="Cancel Upgrade"
      />
    );
  }

  const referralsPct = Math.min((finance?.usedSlots || 0) / (finance?.totalSlots || 1) * 100, 100);
  const zonesPct = Math.min((finance?.usedZones || 0) / (finance?.totalZones || 1) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 w-full pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Package</h1>
          <p className="text-slate-500 font-medium">Manage your tier, operational limits, and upgrades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className={`col-span-1 md:col-span-1 bg-gradient-to-br ${meta.color} rounded-3xl p-8 text-white shadow-lg relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon className="w-32 h-32" />
          </div>
          <div className={`w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Current Tier</p>
          <h2 className="text-4xl font-black mb-8">{finance?.currentTier || 'Free'}</h2>
          
          <button 
            onClick={() => setIsUpgrading(true)}
            className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm shadow-sm hover:scale-[1.02] hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade Package
          </button>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Perks & Utilization</h3>
          
          <div className="space-y-8">
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Direct Referrals</h4>
                    <p className="text-xs text-slate-500">Number of agents you can refer.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-800">{finance?.usedSlots || 0}</span>
                  <span className="text-sm font-bold text-slate-400">/{finance?.totalSlots || 0}</span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${referralsPct}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-blue-500 rounded-full" 
                />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Territory Zones</h4>
                    <p className="text-xs text-slate-500">Active zones you can accept requests in.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-800">{finance?.usedZones || 0}</span>
                  <span className="text-sm font-bold text-slate-400">/{finance?.totalZones || 0}</span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${zonesPct}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-orange-500 rounded-full" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <h3 className="font-bold text-slate-800">Referral Network</h3>
              </div>
               {!referralData ? (
                  <button
                     onClick={handleGenerateCode}
                     disabled={isGenerating}
                     className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                     <LinkIcon className="w-4 h-4" />
                     {isGenerating ? 'Generating...' : 'Generate My Referral Link'}
                  </button>
               ) : (
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Referral Link</p>
                     <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-mono text-slate-600 flex-1 truncate">{referralData.link}</span>
                        <button
                           onClick={handleCopy}
                           className="flex-shrink-0 p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 transition-colors"
                        >
                           {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                     </div>
                     {copied && <p className="text-xs text-green-600 font-medium text-center">Link copied!</p>}
                  </div>
               )}

              <div className="bg-purple-50 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  <p className="text-[10px] text-purple-700 leading-relaxed font-medium">
                     You've reached {Math.round(referralsPct)}% of your slots. Successful referrals earn you commission on their transactions.
                  </p>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Referrals</p>
                 {profile?.referrals?.slice(0, 3).map((ref: any) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                       <span className="text-xs font-bold text-slate-700 line-clamp-1">{ref.fullName}</span>
                       <span className="text-[10px] text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>
                 ))}
                 {(!profile?.referrals || profile.referrals.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No referrals found.</p>
                 )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
