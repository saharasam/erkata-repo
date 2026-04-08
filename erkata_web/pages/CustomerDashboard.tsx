import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Star, MessageSquare, Plus, X, MapPin, Calendar, ChevronRight, Info } from 'lucide-react';
import FeedbackForm, { FeedbackData } from '../components/FeedbackForm';
import RequestIntakeFlow from '../components/RequestIntakeFlow';
import { agentRequests } from '../utils/mockData';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import api from '../utils/api';
import { useModal } from '../contexts/ModalContext';
import FulfillmentConfirmation from '../components/FulfillmentConfirmation';

const CustomerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackRequest, setFeedbackRequest] = useState<{id: string, agentName: string, transactionId: string} | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const location = useLocation();
  const { showAlert } = useModal();
  const showSuccess = location.state?.requestSubmitted;
  const [confirmationRequest, setConfirmationRequest] = useState<any | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data.map((r: any) => ({
        ...r,
        transactionId: r.matches?.[0]?.transaction?.id,
        agentName: r.matches?.[0]?.agent?.fullName,
        submittedDate: new Date(r.createdAt).toLocaleDateString(),
        submittedTime: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requirementSummary: r.description || r.category,
        zone: r.zone?.name || 'Unknown',
        woreda: r.woreda || 'N/A'
      })));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFeedbackSubmit = async (data: FeedbackData) => {
    try {
      if (!feedbackRequest?.transactionId) {
        showAlert({ title: 'Error', message: 'Transaction ID missing for this request', type: 'error' });
        return;
      }

      await api.post(`/mediation/transaction/${feedbackRequest.transactionId}/feedback`, {
        content: data.comment,
        rating: data.rating,
        categories: data.categories
      });

      setRequests(prev => prev.map(req => 
        req.id === data.requestId ? { ...req, status: 'fulfilled' } : req
      ));
      setFeedbackRequest(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showAlert({ title: 'Error', message: 'Failed to submit feedback. Please try again.', type: 'error' });
    }
  };

  const handleConfirmationSuccess = (confirmed: boolean) => {
    if (confirmed) {
      // If confirmed, move to feedback phase
      const req = confirmationRequest;
      setFeedbackRequest({
        id: req.id,
        agentName: req.agentName || 'Assigned Agent',
        transactionId: req.transactionId
      });
      // Also update local status to completed visually immediately
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'completed' } : r));
    } else {
      // If disputed, refresh to show new status
      fetchRequests();
      showAlert({ 
        title: 'Dispute Raised', 
        message: 'A dispute has been raised. Our team will contact you shortly.', 
        type: 'info' 
      });
    }
    setConfirmationRequest(null);
  };

  const [currentView, setCurrentView] = useState('requests');

  return (
    <DashboardLayout 
      role="customer" 
      sidebarContent={null}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <div className="max-w-6xl mx-auto py-8 px-4">
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold"
          >
            <CheckCircle className="w-5 h-5" />
            Request Submitted Successfully! An operator will review it shortly.
          </motion.div>
        )}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Requests</h1>
            <p className="text-slate-500 mt-2">Track your property and furniture requests here.</p>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-erkata-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-erkata-secondary transition-all flex items-center gap-2 shadow-lg shadow-erkata-primary/20"
          >
            <Plus className="w-5 h-5" />
            Submit New Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
              >
                {/* Status Header */}
                <div className="p-5 pb-3 flex justify-between items-center">
                  <span className={`status-badge ${
                    request.status === 'completed' ? 'fulfilled' : 
                    request.status === 'delivered' ? 'delivered' : 
                    request.status === 'matched' ? 'assigned' :
                    request.status === 'in_progress' ? 'in_progress' :
                    request.status === 'DISPUTED' ? 'disputed' :
                    'pending'
                  }`}>
                    {request.status === 'completed' ? 'Fulfilled' : 
                     request.status === 'matched' ? 'Assigned' : 
                     request.status === 'DISPUTED' ? 'Disputed' :
                     request.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {request.submittedDate}
                  </span>
                </div>

                {/* Main Content */}
                <div className="px-5 pb-5 flex-grow space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug group-hover:text-erkata-primary transition-colors">
                    {request.requirementSummary}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-4 h-4 opacity-70" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-medium text-slate-500">{request.zone}</span>
                      <span className="text-[11px] text-slate-400">{request.woreda}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-300 font-medium uppercase tracking-tight">
                      REF: {request.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-5 pb-4">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-erkata-primary transition-all duration-700 ${
                        request.status === 'completed' ? 'w-full' : 
                        request.status === 'delivered' ? 'w-4/5' : 
                        request.status === 'in_progress' ? 'w-3/5' : 
                        request.status === 'matched' ? 'w-2/5' : 'w-1/5'
                      }`}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                  {request.status === 'delivered' ? (
                    <Can perform={Action.SUBMIT_CUSTOMER_FEEDBACK}>
                      <button
                        onClick={() => setConfirmationRequest(request)}
                        className="w-full bg-erkata-primary text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm Fulfillment
                      </button>
                    </Can>
                  ) : request.status === 'completed' ? (
                    <div className="w-full text-green-600 text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 bg-green-50">
                      <CheckCircle className="w-4 h-4" />
                      Service Finalized
                    </div>
                  ) : request.status === 'matched' || request.status === 'in_progress' ? (
                    <div className="w-full py-3 flex items-center justify-center text-erkata-primary bg-erkata-primary/5 rounded-xl border border-erkata-primary/10">
                      <Clock className="w-4 h-4 mr-2 animate-pulse" />
                      <span className="text-xs font-semibold">Fulfillment in progress</span>
                    </div>
                  ) : (
                    <div className="w-full py-3 flex items-center justify-center text-slate-400">
                      <span className="text-xs font-medium italic">Awaiting next stage</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <Package className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No Requests Found</h2>
              <p className="text-slate-500 max-w-sm mb-8">
                You haven't submitted any requests yet. Start by clicking the button above to find your perfect property or furniture.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fulfillment Confirmation Modal */}
      <AnimatePresence>
        {confirmationRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmationRequest(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <FulfillmentConfirmation
              requestId={confirmationRequest.id}
              onClose={() => setConfirmationRequest(null)}
              onSuccess={handleConfirmationSuccess}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackRequest(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <FeedbackForm
              requestId={feedbackRequest.id}
              recipientName={feedbackRequest.agentName}
              role="customer"
              onClose={() => setFeedbackRequest(null)}
              onSubmit={handleFeedbackSubmit}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Request Intake Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-2"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 px-4 pt-2">
                  <h2 className="text-2xl font-bold text-slate-900">Submit New Request</h2>
                  <button 
                    onClick={() => setIsRequestModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
                <RequestIntakeFlow 
                  embedded 
                  onSuccess={() => {
                    setIsRequestModalOpen(false);
                    fetchRequests();
                    showAlert({
                      title: 'Success',
                      message: 'Your request has been submitted successfully!',
                      type: 'success'
                    });
                  }}
                  onCancel={() => setIsRequestModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
