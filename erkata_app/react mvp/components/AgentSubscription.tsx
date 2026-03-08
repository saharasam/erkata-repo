import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, CheckCircle2, Zap, Map } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentSubscriptionProps {
  setView: (view: ViewState) => void;
}

const AgentSubscription: React.FC<AgentSubscriptionProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-ethio-light pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => setView(ViewState.AGENT_DASHBOARD)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Subscription</h1>
      </div>

      <div className="p-5 max-w-lg mx-auto">
        
        {/* Current Plan Card */}
        <div className="bg-ethio-charcoal text-white rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Current Tier</p>
                <h2 className="text-2xl font-bold">Standard Agent</h2>
              </div>
              <div className="bg-ethio-green/20 text-ethio-green px-3 py-1 rounded-full text-xs font-bold border border-ethio-green/30">
                ACTIVE
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Request Capacity</span>
                <span className="font-bold">18 / 25</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '72%' }}
                  className="h-full bg-ethio-green"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Renews in 12 days</p>
            </div>

            <button className="w-full py-3 bg-white text-ethio-charcoal font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Zap size={16} className="text-ethio-accent" /> Upgrade Plan
            </button>
          </div>
        </div>

        {/* Geographic Eligibility */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Coverage Area</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-start gap-4 mb-4">
             <div className="p-3 bg-blue-50 text-ethio-blue rounded-xl">
               <Map size={24} />
             </div>
             <div>
               <h4 className="font-bold text-gray-800">Bole & Yeka</h4>
               <p className="text-sm text-gray-500">Your subscribed zones</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Bole 03', 'Bole 05', 'CMC', 'Ayat', 'Kotebe'].map(zone => (
              <span key={zone} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                {zone}
              </span>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Recent Invoices</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { date: 'Oct 01, 2023', amount: '2,500 ETB', status: 'Paid' },
            { date: 'Sep 01, 2023', amount: '2,500 ETB', status: 'Paid' },
            { date: 'Aug 01, 2023', amount: '2,500 ETB', status: 'Paid' },
          ].map((inv, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0">
               <div>
                 <p className="font-semibold text-gray-800 text-sm">Monthly Subscription</p>
                 <p className="text-xs text-gray-400">{inv.date}</p>
               </div>
               <div className="text-right">
                 <p className="font-bold text-gray-800 text-sm">{inv.amount}</p>
                 <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">{inv.status}</span>
               </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AgentSubscription;