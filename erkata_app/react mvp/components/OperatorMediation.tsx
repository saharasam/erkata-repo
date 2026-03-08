import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, MessageSquareWarning, Flag, CheckCircle, Clock, Paperclip, Send } from 'lucide-react';

interface OperatorMediationProps {
  setView: (view: ViewState) => void;
}

const OperatorMediation: React.FC<OperatorMediationProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setView(ViewState.OPERATOR_DASHBOARD)} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               Mediation Panel <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase">Escalated</span>
            </h1>
            <p className="text-xs text-gray-500">Ticket #DISP-992 • Quality Dispute • Oct 28</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-green-700">
             <CheckCircle size={14} /> Resolve
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Details */}
         <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto hidden md:block">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Case Details</h3>
            
            <div className="space-y-4">
               <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-400 block mb-1">Customer</span>
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">A</div>
                     Abebe Kebede
                  </div>
               </div>
               
               <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-400 block mb-1">Agent</span>
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">D</div>
                     Dawit M.
                  </div>
               </div>

               <div>
                  <span className="text-xs text-gray-400 block mb-1">Reason</span>
                  <p className="text-sm text-gray-700">Customer claims the delivered sofa color does not match the sample provided.</p>
               </div>
               
               <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-800 mb-2">Operator Notes</h4>
                  <textarea className="w-full text-xs p-2 border border-gray-200 rounded-lg h-24 resize-none focus:outline-none focus:border-ethio-blue" placeholder="Add private notes..."></textarea>
               </div>
            </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="flex justify-center">
                  <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded-full">Today, 10:23 AM</span>
               </div>

               {/* System Msg */}
               <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                     <Flag size={12} /> Dispute escalated to Operator Support
                  </div>
               </div>

               {/* Customer Msg */}
               <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 font-bold">A</div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100">
                     <p>I ordered the "Midnight Blue" but this looks more like grey. I cannot accept this.</p>
                     <span className="text-[10px] text-gray-300 block mt-1 text-right">10:25 AM</span>
                  </div>
               </div>

               {/* Agent Msg */}
               <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs shrink-0 font-bold">D</div>
                  <div className="bg-orange-50 p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-gray-700 border border-orange-100">
                     <p>It is the correct code #MB-202. Lighting in the room might be affecting it.</p>
                     <span className="text-[10px] text-orange-300 block mt-1 text-right">10:28 AM</span>
                  </div>
               </div>
               
               {/* Operator Msg */}
               <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-ethio-charcoal text-white flex items-center justify-center text-xs shrink-0 font-bold">OP</div>
                  <div className="bg-gray-800 text-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
                     <p>Hello both. I am reviewing the order details and the photo evidence provided. Please standby.</p>
                     <span className="text-[10px] text-gray-400 block mt-1 text-right">10:30 AM</span>
                  </div>
               </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
               <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                     <Paperclip size={20} />
                  </button>
                  <input type="text" placeholder="Type a message to mediate..." className="flex-1 bg-transparent border-none focus:outline-none text-sm" />
                  <button className="p-2 bg-ethio-blue text-white rounded-lg hover:bg-[#1e425e] transition-colors">
                     <Send size={18} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OperatorMediation;