import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, Phone, Mail, MessageCircle, MessageSquare } from 'lucide-react';

interface AgentCommunicationProps {
  setView: (view: ViewState) => void;
}

const AgentCommunication: React.FC<AgentCommunicationProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-ethio-light pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button onClick={() => setView(ViewState.AGENT_DASHBOARD)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Contact Customer</h1>
      </div>

      <div className="p-5 max-w-lg mx-auto">
        
        {/* Customer Profile Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center mb-8">
           <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-2xl mb-4">
             👤
           </div>
           <h2 className="text-xl font-bold text-gray-800">Kebede Tesfaye</h2>
           <p className="text-gray-500 text-sm mb-6">Request ID: #REQ-2023-001</p>
           
           <div className="flex justify-center gap-4">
             <button className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm hover:bg-green-100 transition-colors">
                 <Phone size={20} />
               </div>
               <span className="text-xs font-medium text-gray-600">Call</span>
             </button>
             <button className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-blue-50 text-ethio-blue flex items-center justify-center shadow-sm hover:bg-blue-100 transition-colors">
                 <MessageSquare size={20} />
               </div>
               <span className="text-xs font-medium text-gray-600">SMS</span>
             </button>
             <button className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shadow-sm hover:bg-green-100 transition-colors">
                 <MessageCircle size={20} />
               </div>
               <span className="text-xs font-medium text-gray-600">WhatsApp</span>
             </button>
             <button className="flex flex-col items-center gap-2">
               <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors">
                 <Mail size={20} />
               </div>
               <span className="text-xs font-medium text-gray-600">Email</span>
             </button>
           </div>
        </div>

        {/* Chat Preview / Context */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Request Context</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
           <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <div className="w-2 h-2 rounded-full bg-ethio-blue"></div>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Looking for a custom L-shape sofa.</p>
                <p className="text-xs text-gray-400 mt-1">Requirements</p>
              </div>
           </div>
           <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="w-2 h-2 rounded-full bg-ethio-blue"></div>
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">Budget: 25,000 - 35,000 ETB</p>
                <p className="text-xs text-gray-400 mt-1">Budget Range</p>
              </div>
           </div>
        </div>

        {/* Main CTA */}
        <button className="w-full py-4 bg-ethio-blue text-white rounded-xl font-bold shadow-lg shadow-ethio-blue/30 flex items-center justify-center gap-2">
          <Phone size={20} /> Call Now
        </button>

      </div>
    </div>
  );
};

export default AgentCommunication;