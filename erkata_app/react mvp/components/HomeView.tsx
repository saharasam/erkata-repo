import React from 'react';
import { ViewState, ServiceRequest, RequestStatus } from '../types';
import { MOCK_REQUESTS } from '../constants';
import { ArrowRight, Sparkles, MapPin, Search, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeViewProps {
  setView: (view: ViewState) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW: return 'bg-blue-100 text-ethio-blue';
      case RequestStatus.ASSIGNED: return 'bg-yellow-100 text-yellow-700';
      case RequestStatus.IN_PROGRESS: return 'bg-ethio-green-light text-ethio-green';
      case RequestStatus.FULFILLED: return 'bg-ethio-green text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="pb-32 pt-6 px-5 max-w-lg mx-auto bg-ethio-light min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ethio-charcoal">Selam, Abebe 👋</h1>
          <p className="text-gray-500 text-sm">Find your perfect home or furniture.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-ethio-blue text-white flex items-center justify-center font-bold text-lg shadow-md">
          A
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder="What are you looking for?" 
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 shadow-sm bg-white text-gray-700 focus:ring-2 focus:ring-ethio-blue focus:outline-none transition-all"
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </div>

      {/* Quick Stats / Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-ethio-blue to-[#1e425e] rounded-3xl p-6 text-white mb-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-lg font-semibold mb-2">New Listings in Bole</h2>
          <p className="text-blue-100 text-sm mb-4">Explore premium apartments available now.</p>
          <button onClick={() => setView(ViewState.NEW_REQUEST)} className="bg-white text-ethio-blue px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
            Start Request
          </button>
        </div>
      </motion.div>

      {/* Recent Requests */}
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-bold text-gray-800">Recent Requests</h3>
        <button onClick={() => setView(ViewState.TRACKING)} className="text-ethio-blue text-sm font-medium flex items-center hover:text-ethio-charcoal transition-colors">
          View All <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_REQUESTS.map((req, index) => (
          <motion.div 
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
                <span className="text-xs text-gray-400">{req.date}</span>
              </div>
              <Sparkles size={16} className="text-ethio-accent" />
            </div>
            
            <h4 className="font-semibold text-gray-800">{req.title}</h4>
            
            <div className="flex items-center text-xs text-gray-500 gap-4 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                {req.location}
              </div>
              <div className="font-medium text-ethio-blue bg-blue-50 px-2 py-0.5 rounded-md">
                {req.budget}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

       {/* Floating Action Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView(ViewState.NEW_REQUEST)}
        className="fixed bottom-28 right-6 bg-ethio-blue text-white p-4 rounded-full shadow-lg shadow-ethio-blue/40 z-40 flex items-center justify-center"
      >
        <PlusCircle size={28} />
      </motion.button>
    </div>
  );
};

export default HomeView;