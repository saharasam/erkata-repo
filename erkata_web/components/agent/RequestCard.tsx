import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Share2, ChevronDown, MapPin, DollarSign, Home, LayoutGrid, Loader2 } from 'lucide-react';
import { Can } from '../ui/Can';
import { Action } from '../../hooks/usePermissions';

interface RequestCardProps {
  request: {
    id: string;
    transactionId: string;
    submittedTime: string;
    requirementSummary: string;
    category?: string;
    customerName: string;
    customerPhone?: string;
    zone?: string;
    woreda: string;
    budgetMax?: string;
    metadata?: Record<string, any>;
    status: 'assigned' | 'accepted' | 'completed' | 'rejected' | string;
  };
  onAccept: (id: string) => void;
  onComplete: (id: string, transactionId: string, customerName: string) => void;
  onTransfer: (id: string) => void;
  onDecline: (id: string) => void;
  hasReferrals?: boolean;
  isProcessing?: boolean;
}

// Maps raw metadata keys to human-readable labels and optional icons
const METADATA_LABELS: Record<string, { label: string; emoji: string }> = {
  constructionStatus: { label: 'Status', emoji: '🏗️' },
  bedrooms:           { label: 'Bedrooms', emoji: '🛏️' },
  bankLoan:           { label: 'Bank Loan', emoji: '🏦' },
  customization:      { label: 'Manufacturing', emoji: '🔧' },
  targetRoom:         { label: 'Room', emoji: '🚪' },
  paymentPlan:        { label: 'Payment Plan', emoji: '💳' },
};

const MetadataBadge: React.FC<{ metaKey: string; value: any }> = ({ metaKey, value }) => {
  const config = METADATA_LABELS[metaKey];
  if (!config || value === null || value === undefined || value === '') return null;

  // Format the value (handle booleans, etc.)
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <span className="text-base leading-none">{config.emoji}</span>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{config.label}</p>
        <p className="text-xs font-bold text-slate-700 leading-tight">{displayValue}</p>
      </div>
    </div>
  );
};

export const RequestCard = React.forwardRef<HTMLDivElement, RequestCardProps>(
  ({ request, onAccept, onComplete, onTransfer, onDecline, hasReferrals, isProcessing }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'assigned':  return 'bg-indigo-500';
        case 'accepted':  return 'bg-amber-500';
        case 'fulfilled': return 'bg-emerald-500';
        case 'completed': return 'bg-emerald-600';
        case 'rejected':  return 'bg-slate-300';
        case 'disputed':  return 'bg-rose-500';
        case 'pending':   return 'bg-blue-500';
        default:          return 'bg-slate-300';
      }
    };

    const metadataEntries = Object.entries(request.metadata || {}).filter(
      ([key]) => METADATA_LABELS[key]
    );

    const hasMetadata = metadataEntries.length > 0;
    const formattedBudget = request.budgetMax && Number(request.budgetMax) > 0
      ? `ETB ${Number(request.budgetMax).toLocaleString()}`
      : null;

    const CategoryIcon = request.category === 'Furniture' ? LayoutGrid : Home;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
      >
        {/* Status accent bar */}
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${getStatusColor(request.status)}`} />

        <div className="pl-4 pr-5 pt-5 pb-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {request.id.slice(0, 8)}…
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {request.submittedTime}
                </span>
                {request.category && (
                  <span className="text-[10px] font-bold text-erkata-primary bg-erkata-primary/5 px-2 py-0.5 rounded-full flex items-center gap-1 border border-erkata-primary/10">
                    <CategoryIcon className="w-2.5 h-2.5" />
                    {request.category}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-erkata-primary transition-colors line-clamp-2">
                {request.requirementSummary}
              </h3>
            </div>
          </div>

          {/* Core details row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer</span>
              <span className="text-sm font-semibold text-slate-700">{request.customerName}</span>
              {request.status !== 'assigned' && request.customerPhone && (
                <a
                  href={`tel:${request.customerPhone}`}
                  className="text-[11px] font-bold text-erkata-primary hover:underline flex items-center gap-1 mt-0.5"
                >
                  {request.customerPhone}
                </a>
              )}
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
                {[request.zone, request.woreda].filter(Boolean).filter(v => v !== 'N/A' && v !== 'Unknown').join(', ') || 'N/A'}
              </span>
            </div>
          </div>

          {/* Redo Warning */}
          {request.metadata?.needsRedo && (
            <div className="mb-4 bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                  ❗ Redo Required
                </span>
              </div>
              <p className="text-[10px] font-medium text-amber-700 leading-relaxed italic">
                "{request.metadata?.voidNote || 'Your previous fulfillment was voided. Please review and resubmit.'}"
              </p>
            </div>
          )}

          {/* Budget tag */}
          {formattedBudget && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-green-100">
                {formattedBudget}
              </span>
            </div>
          )}

          {/* Expandable Details Toggle */}
          {hasMetadata && (
            <button
              onClick={() => setIsExpanded(p => !p)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-erkata-primary transition-colors mb-3"
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
              {isExpanded ? 'Hide Details' : 'View Request Details'}
            </button>
          )}

          {/* Expanded Metadata Panel */}
          <AnimatePresence>
            {isExpanded && hasMetadata && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 mb-4 pt-1 pb-1 border-t border-slate-50">
                  {metadataEntries.map(([key, value]) => (
                    <MetadataBadge key={key} metaKey={key} value={value} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            {request.status === 'assigned' && (
              <Can perform={Action.ACCEPT_REQUEST}>
                <button
                  onClick={() => onAccept(request.id)}
                  disabled={isProcessing}
                  className={`flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Accept Assignment'
                  )}
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
                    disabled={isProcessing}
                    className={`flex-1 bg-white border border-slate-200 text-red-600 text-xs font-bold py-2.5 rounded-xl transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-100'}`}
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Decline'}
                  </button>
                )}
              </Can>
            )}
            {request.status === 'accepted' && hasReferrals && (
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
            {request.status === 'accepted' && (
              <Can perform={Action.SUBMIT_PROOF}>
                <button
                  onClick={() => onComplete(request.id, request.transactionId, request.customerName)}
                  disabled={isProcessing}
                  className={`flex-1 bg-erkata-primary text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-erkata-secondary'}`}
                >
                   {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    request.metadata?.needsRedo ? 'Resubmit Proof' : 'Complete & Confirm'
                  )}
                </button>
              </Can>
            )}
            {request.status === 'fulfilled' && (
              <div className="w-full py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                <Clock className="w-3.5 h-3.5" />
                Awaiting Customer Confirmation
              </div>
            )}
            {request.status === 'completed' && (
              <div className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Transaction Completed
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

RequestCard.displayName = 'RequestCard';

export default RequestCard;
