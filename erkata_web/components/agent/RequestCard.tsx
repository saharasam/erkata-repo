import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Share2 } from 'lucide-react';
import { Can } from '../ui/Can';
import { Action } from '../../hooks/usePermissions';

interface RequestCardProps {
  request: {
    id: string;
    transactionId: string;
    submittedTime: string;
    requirementSummary: string;
    customerName: string;
    woreda: string;
    status: 'assigned' | 'in-progress' | 'completed' | string;
  };
  onAccept: (id: string) => void;
  onComplete: (id: string, transactionId: string, customerName: string) => void;
  onTransfer: (id: string) => void;
  onDecline: (id: string) => void;
  hasReferrals?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onComplete, onTransfer, onDecline, hasReferrals }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'in-progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${getStatusColor(request.status)}`} />

      <div className="pl-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                {request.id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {request.submittedTime}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-erkata-primary transition-colors">
              {request.requirementSummary}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer</span>
            <span className="text-sm font-semibold text-slate-700">{request.customerName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Location</span>
            <span className="text-sm font-semibold text-slate-700">{request.woreda}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {request.status === 'assigned' && (
            <Can perform={Action.ACCEPT_REQUEST}>
              <button 
                onClick={() => onAccept(request.id)}
                className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Accept Request
              </button>
            </Can>
          )}
          {request.status === 'assigned' && (
            <Can perform={Action.TRANSFER_REQUEST}>
              {hasReferrals ? (
                <button 
                  onClick={() => onTransfer(request.id)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Transfer
                </button>
              ) : (
                <button 
                  onClick={() => onDecline(request.id)}
                  className="flex-1 bg-white border border-slate-200 text-red-600 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                  Decline
                </button>
              )}
            </Can>
          )}
          {request.status === 'in-progress' && hasReferrals && (
            <Can perform={Action.TRANSFER_REQUEST}>
              <button 
                onClick={() => onTransfer(request.id)}
                className="flex-none px-4 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                title="Transfer to a referral"
              >
                <Share2 className="w-3.5 h-3.5" />
                Transfer
              </button>
            </Can>
          )}
          {request.status === 'in-progress' && (
            <Can perform={Action.SUBMIT_PROOF}>
              <button 
                onClick={() => onComplete(request.id, request.transactionId, request.customerName)}
                className="flex-1 bg-erkata-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-erkata-secondary transition-colors"
              >
                Complete & Confirm
              </button>
            </Can>
          )}
          {request.status === 'completed' && (
            <div className="w-full py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
              <CheckCircle className="w-3.5 h-3.5" />
              Completed
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;
