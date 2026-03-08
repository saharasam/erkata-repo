import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, TrendingUp, Download, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentCommissionProps {
  setView: (view: ViewState) => void;
}

const AgentCommission: React.FC<AgentCommissionProps> = ({ setView }) => {
  // Chart Data
  const data = [1200, 2100, 1800, 2800, 2400, 3800, 3200];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Chart Logic
  const max = Math.max(...data) * 1.1; // Add some headroom
  const height = 150;
  const width = 300; // SVG internal coordinate system

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <div className="min-h-screen bg-ethio-light pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => setView(ViewState.AGENT_DASHBOARD)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Earnings</h1>
      </div>

      <div className="p-5 max-w-lg mx-auto">
        
        {/* Total Earned Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-2 bg-green-100 text-ethio-green rounded-lg">
                <TrendingUp size={20} />
             </div>
             <span className="text-sm font-semibold text-gray-500">Total Revenue</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">45,200 <span className="text-lg text-gray-400 font-normal">ETB</span></h2>
          <div className="flex items-center gap-2 text-xs">
             <span className="text-green-600 font-bold flex items-center">+12.5%</span>
             <span className="text-gray-400">vs last month</span>
          </div>
        </div>

        {/* Custom SVG Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Weekly Performance</h3>
          
          <div className="w-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines (Horizontal) */}
              <line x1="0" y1="0" x2={width} y2="0" stroke="#f0f0f0" strokeDasharray="4 4" />
              <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#f0f0f0" strokeDasharray="4 4" />
              <line x1="0" y1={height} x2={width} y2={height} stroke="#f0f0f0" />

              {/* Area Fill */}
              <motion.polygon 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                points={areaPoints} 
                fill="url(#gradient)" 
              />
              
              {/* Line Stroke */}
              <motion.polyline 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                points={points} 
                fill="none" 
                stroke="#4CAF50" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              {/* Data Points */}
              {data.map((val, i) => {
                 const x = (i / (data.length - 1)) * width;
                 const y = height - (val / max) * height;
                 return (
                   <motion.circle 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 0.5 + (i * 0.1) }}
                     key={i} 
                     cx={x} 
                     cy={y} 
                     r="4" 
                     fill="white" 
                     stroke="#4CAF50" 
                     strokeWidth="2" 
                   />
                 )
              })}
            </svg>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
               {labels.map((label, i) => (
                 <span key={i}>{label}</span>
               ))}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <p className="text-xs text-gray-500 mb-1">Pending</p>
             <p className="text-xl font-bold text-orange-500">8,500 ETB</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <p className="text-xs text-gray-500 mb-1">Withdrawable</p>
             <p className="text-xl font-bold text-ethio-charcoal">36,700 ETB</p>
           </div>
        </div>

        {/* Transaction List */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { id: '#TRX-9821', desc: 'Commission - REQ-2023-001', amount: '+ 2,500 ETB', date: 'Today, 10:30 AM' },
            { id: '#TRX-9820', desc: 'Payout to Telebirr', amount: '- 10,000 ETB', date: 'Yesterday' },
            { id: '#TRX-9819', desc: 'Commission - REQ-2023-005', amount: '+ 1,800 ETB', date: 'Oct 22' },
          ].map((trx, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${trx.amount.includes('+') ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {trx.amount.includes('+') ? <CheckCircle2 size={16} /> : <Download size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{trx.desc}</p>
                  <p className="text-[10px] text-gray-400">{trx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${trx.amount.includes('+') ? 'text-green-600' : 'text-gray-800'}`}>
                {trx.amount}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AgentCommission;