import React, { useState } from 'react';
import { ViewState, ServiceRequest, RequestStatus } from '../types';
import { MOCK_REQUESTS } from '../constants';
import { ArrowLeft, CheckCircle2, Circle, Clock, Package, UserCheck, RefreshCcw, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestStatusProps {
  setView: (view: ViewState) => void;
}

const RequestStatusView: React.FC<RequestStatusProps> = ({ setView }) => {
  // State to toggle between list view and detail view
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Default timeline steps for the detail view
  const steps = [
    { label: 'Request Submitted', date: 'Oct 24, 10:00 AM', status: 'completed', icon: CheckCircle2, desc: 'Your request has been received.' },
    { label: 'Agent Assigned', date: 'Oct 24, 02:30 PM', status: 'completed', icon: UserCheck, desc: 'Dawit M. is handling your case.' },
    { label: 'Searching', date: 'In Progress', status: 'current', icon: Clock, desc: 'Agent is verifying availability.' },
    { label: 'Fulfilled', date: 'Pending', status: 'pending', icon: Package, desc: 'Items delivered / Contract signed.' },
  ];

  // If a request is selected, show the tracking details
  if (selectedRequest) {
    return (
      <div className="min-h-screen bg-ethio-light pb-32">
        {/* Header */}
        <div className="px-5 py-6 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-20">
          <button 
            onClick={() => setSelectedRequest(null)} 
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Track Request</h1>
          <button className="p-2 -mr-2 text-ethio-blue hover:bg-blue-50 rounded-full">
            <RefreshCcw size={20} />
          </button>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          {/* Request Summary Card */}
          <div className="bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-start mb-2">
               <h2 className="font-bold text-gray-800">{selectedRequest.title}</h2>
               <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                 selectedRequest.status === RequestStatus.IN_PROGRESS ? 'bg-ethio-green-light text-ethio-green' :
                 selectedRequest.status === RequestStatus.FULFILLED ? 'bg-ethio-green text-white' :
                 'bg-gray-100 text-gray-600'
               }`}>
                 {selectedRequest.status}
               </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">ID: #{selectedRequest.id}</p>
            <p className="text-sm text-gray-500">{selectedRequest.location}</p>
          </div>

          {/* Timeline */}
          <div className="relative pl-4 space-y-10 before:absolute before:inset-y-0 before:left-[27px] before:w-[2px] before:bg-gray-100 before:z-0 py-4">
            {steps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative z-10 flex items-start gap-4"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${
                    isCompleted ? 'bg-ethio-green-light text-ethio-green' : 
                    isCurrent ? 'bg-ethio-green text-white shadow-ethio-green/30 shadow-lg' : 'bg-gray-50 text-gray-300'
                  }`}>
                    <step.icon size={24} strokeWidth={isCurrent ? 2.5 : 2} />
                  </div>
                  
                  <div className="pt-1 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-base ${isCurrent ? 'text-ethio-green' : 'text-gray-800'}`}>
                        {step.label}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                        {step.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Area */}
          <div className="mt-12">
              <button className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Contact Agent
              </button>
          </div>
        </div>
      </div>
    );
  }

  // Activity List View
  return (
    <div className="min-h-screen bg-ethio-light pb-32">
      <div className="px-5 py-6 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Activity</h1>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
          <Filter size={20} />
        </button>
      </div>

      <div className="px-5 space-y-4 mt-4">
        {MOCK_REQUESTS.map((req, index) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedRequest(req)}
            className="p-4 rounded-2xl border border-gray-100 shadow-sm bg-white active:scale-95 transition-all cursor-pointer flex items-center gap-4 hover:border-ethio-blue/30"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
              req.type === 'Property' ? 'bg-blue-50 text-ethio-blue' : 'bg-orange-50 text-orange-500'
            }`}>
              {req.type === 'Property' ? '🏠' : '🛋️'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-gray-800 truncate pr-2">{req.title}</h3>
                <span className="text-xs text-gray-400 shrink-0">{req.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{req.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  req.status === RequestStatus.IN_PROGRESS ? 'bg-ethio-green-light text-ethio-green' :
                  req.status === RequestStatus.FULFILLED ? 'bg-ethio-green text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {req.status}
                </span>
              </div>
            </div>
            
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RequestStatusView;