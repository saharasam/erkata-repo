import React from 'react';
import { Activity, AlertCircle, Clock, Users } from 'lucide-react';

const SystemHealth: React.FC = () => {
  return (
    <div className="space-y-6">
       <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                System Health
            </h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Active Requests</p>
                    <p className="text-lg font-bold text-slate-800">124</p>
                    <span className="text-[10px] text-green-600 font-medium">+12% vs last hr</span>
                </div>
                 <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">Bundles &gt; 14d</p>
                    <p className="text-lg font-bold text-red-600">3</p>
                    <span className="text-[10px] text-red-500 font-medium">Critical focus</span>
                </div>
            </div>
       </div>

       <div>
           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
               <AlertCircle className="w-4 h-4 text-indigo-600" />
               Attention Needed
           </h4>
           <div className="space-y-2">
               <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                   <div>
                       <p className="text-xs font-bold text-slate-800">Escalated Bundle #9281</p>
                       <p className="text-[10px] text-slate-500">Waiting for proposal (2 days)</p>
                   </div>
               </div>
               <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                   <div>
                       <p className="text-xs font-bold text-slate-800">Agent Onboarding</p>
                       <p className="text-[10px] text-slate-500">5 agents waiting for approval</p>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default SystemHealth;
