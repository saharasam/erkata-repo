import React, { useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface FulfillmentConfirmationProps {
  requestId: string;
  onSuccess: (confirmed: boolean) => void;
  onClose: () => void;
}

const FulfillmentConfirmation: React.FC<FulfillmentConfirmationProps> = ({ requestId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (confirmed: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/requests/${requestId}/confirm-fulfillment`, { confirmed });
      onSuccess(confirmed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="absolute top-4 right-4">
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-8">
        <div className="w-16 h-16 bg-erkata-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-erkata-primary" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-2">Service Fulfillment</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Has the agent successfully delivered the service to your satisfaction? 
          Your confirmation helps us maintain high standards for all leads.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleConfirm(true)}
            disabled={loading}
            className="w-full py-4 bg-erkata-primary hover:bg-erkata-secondary text-white font-bold rounded-2xl transition-all shadow-lg shadow-erkata-primary/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Yes, Fulfilled'}
          </button>
          <button
            onClick={() => handleConfirm(false)}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-2xl transition-all border border-slate-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'No, Raise Dispute'}
          </button>
        </div>
        
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Disputed leads trigger immediate operator intervention.
        </p>
      </div>
    </motion.div>
  );
};

export default FulfillmentConfirmation;
