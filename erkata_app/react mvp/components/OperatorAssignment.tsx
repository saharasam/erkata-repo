import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, MapPin, Zap, Star, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorAssignmentProps {
  setView: (view: ViewState) => void;
}

const OperatorAssignment: React.FC<OperatorAssignmentProps> = ({ setView }) => {
  const agents = [
    { id: 1, name: 'Dawit M.', rating: 4.8, active: 3, zone: 'Bole', match: 98 },
    { id: 2, name: 'Sara K.', rating: 4.9, active: 1, zone: 'Bole', match: 95 },
    { id: 3, name: 'Yonas B.', rating: 4.5, active: 5, zone: 'Yeka', match: 82 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-20 shrink-0">
        <button onClick={() => setView(ViewState.OPERATOR_DASHBOARD)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Assignment Logic</h1>
          <p className="text-xs text-gray-500">Request #REQ-2023-004 • Studio in Kazanchis</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Map Simulation Panel */}
        <div className="flex-1 bg-gray-100 relative min-h-[300px]">
           {/* Abstract Map Background */}
           <div className="absolute inset-0 bg-[#e5e7eb] overflow-hidden">
              <div className="w-full h-full opacity-30" style={{
                  backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
              }}></div>
              
              {/* Roads Simulation */}
              <div className="absolute top-1/2 left-0 w-full h-2 bg-white/50 -rotate-3"></div>
              <div className="absolute top-0 left-1/3 w-2 h-full bg-white/50 rotate-12"></div>
              
              {/* Request Pin */}
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-1/2 left-1/3 -mt-6 -ml-6"
              >
                 <div className="relative">
                   <div className="w-12 h-12 bg-red-500/20 rounded-full animate-ping absolute inset-0"></div>
                   <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 relative z-10 border-2 border-red-500">
                      <MapPin size={24} fill="currentColor" />
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                      Request Location
                   </div>
                 </div>
              </motion.div>

              {/* Agent Pins */}
              {agents.map((agent, i) => (
                <div key={agent.id} className="absolute" style={{ top: `${30 + i * 15}%`, left: `${50 + i * 10}%` }}>
                    <div className="w-8 h-8 bg-ethio-blue text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold hover:scale-110 transition-transform cursor-pointer">
                        {agent.name.charAt(0)}
                    </div>
                </div>
              ))}
           </div>
           
           <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-sm text-xs text-gray-500">
              Simulated Map View
           </div>
        </div>

        {/* Sidebar / Logic Panel */}
        <div className="w-full md:w-96 bg-white border-l border-gray-200 overflow-y-auto p-4 shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-gray-800">Suggested Agents</h3>
             <button className="text-ethio-blue text-xs font-bold hover:underline">Auto-Assign</button>
          </div>

          <div className="space-y-3">
             {agents.map((agent) => (
               <div key={agent.id} className="p-3 border border-gray-200 rounded-xl hover:border-ethio-blue hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                           {agent.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-gray-800">{agent.name}</p>
                           <p className="text-[10px] text-gray-500 flex items-center gap-1">
                             <Star size={10} className="text-yellow-500 fill-yellow-500" /> {agent.rating} • {agent.active} Active Tasks
                           </p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-green-600">{agent.match}% Match</span>
                        <span className="text-[10px] text-gray-400">Zone: {agent.zone}</span>
                     </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                     <button className="flex-1 py-1.5 bg-ethio-blue text-white text-xs font-bold rounded-lg hover:bg-[#1e425e]">
                        Assign
                     </button>
                     <button className="px-2 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>
               </div>
             ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Assignment Rules</h4>
             <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                <li>Prioritize agents with &lt; 5 active tasks</li>
                <li>Match Kifle Ketema exactly</li>
                <li>Rating must be &gt; 4.2 stars</li>
             </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OperatorAssignment;