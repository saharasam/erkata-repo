import React from 'react';
import { ViewState, ServiceRequest, RequestType, RequestStatus } from '../types';
import { MOCK_REQUESTS } from '../constants';
import { MapPin, Clock, DollarSign, Check, X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentDashboardProps {
  setView: (view: ViewState) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ setView }) => {
  // Filter for 'New' requests to simulate incoming assignments
  const incomingRequests = MOCK_REQUESTS.filter(r => r.status === RequestStatus.NEW || r.status === RequestStatus.ASSIGNED);

  return (
    <div className="pb-32 pt-6 px-5 max-w-lg mx-auto bg-ethio-light min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ethio-charcoal">Agent Dashboard</h1>
          <p className="text-gray-500 text-sm">You have 3 new assignments.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-ethio-charcoal text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
          AG
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Active Leads</p>
          <p className="text-2xl font-bold text-ethio-blue">12</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-ethio-green">68%</p>
        </div>
      </div>

      {/* Assignment Feed */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Incoming Requests</h3>
        <button className="text-gray-400 hover:text-ethio-blue">
          <Filter size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {incomingRequests.map((req, index) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  req.type === RequestType.PROPERTY ? 'bg-blue-50 text-ethio-blue' : 'bg-orange-50 text-orange-600'
                }`}>
                  {req.type}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {req.date}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-800 text-lg mb-1">{req.title}</h4>
              <p className="text-sm text-gray-500 mb-4">{req.id}</p>
              
              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {req.location}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400" />
                  {req.budget}
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                  <X size={16} /> Decline
                </button>
                <button className="flex-1 py-2 rounded-xl bg-ethio-blue text-white font-semibold text-sm shadow-md shadow-ethio-blue/20 hover:bg-[#1e425e] flex items-center justify-center gap-2">
                  <Check size={16} /> Accept
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;