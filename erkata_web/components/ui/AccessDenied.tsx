import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccessDenied: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-12 text-center">
     <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
     </div>
     <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
     <p className="text-slate-500 mt-3 max-w-md mx-auto font-medium">
        Your current security clearance level does not permit access to this administrative module. 
        Please contact a Super Admin if you believe this is an error.
     </p>
     <div className="mt-8">
        <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
            Refresh Authorization
        </button>
     </div>
  </div>
);

export default AccessDenied;
