import React from 'react';
import { HelpCircle } from 'lucide-react';

const ViewNotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-12 text-center">
     <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
        <HelpCircle className="w-10 h-10 text-slate-300" />
     </div>
     <h2 className="text-3xl font-black text-slate-900 tracking-tight">View Not Found</h2>
     <p className="text-slate-500 mt-3 max-w-md mx-auto font-medium">
        The requested module could not be located in your dashboard. 
        It may have been moved or you might be using an invalid view identifier.
     </p>
  </div>
);

export default ViewNotFound;
