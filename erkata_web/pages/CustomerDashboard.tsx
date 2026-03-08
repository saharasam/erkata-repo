import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Star, MessageSquare, Plus, X } from 'lucide-react';
import FeedbackForm, { FeedbackData } from '../components/FeedbackForm';
import RequestIntakeFlow from '../components/RequestIntakeFlow';
import { agentRequests } from '../utils/mockData';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import api from '../utils/api';
import { useModal } from '../contexts/ModalContext';

const CustomerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackRequest, setFeedbackRequest] = useState<{id: string, agentName: string} | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const location = useLocation();
  const { showAlert } = useModal();
  const showSuccess = location.state?.requestSubmitted;

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data.map((r: any) => ({
        ...r,
        submittedDate: new Date(r.createdAt).toLocaleDateString(),
        submittedTime: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requirementSummary: r.description || r.category,
        zone: r.zone?.name || 'Unknown',
        woreda: r.details?.woreda || 'N/A'
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

  const handleFeedbackSubmit = (data: FeedbackData) => {
    console.log('Customer Feedback submitted:', data);
    setRequests(prev => prev.map(req => 
      req.id === data.requestId ? { ...req, status: 'fulfilled' } : req
    ));
    setFeedbackRequest(null);
  };

  return (
    <DashboardLayout role="customer" sidebarContent={<div className="p-4 text-xs font-bold text-slate-400">Customer Menu</div>}>
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
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  request.status === 'delivered' ? 'bg-blue-50 text-blue-600' : 
                  request.status === 'fulfilled' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {request.status}
                </span>
                <span className="text-slate-400 text-xs font-bold">{request.submittedDate}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">{request.requirementSummary}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">Zone: {request.zone} ({request.woreda})</p>

              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Package className="w-3.5 h-3.5" />
                  ID: {request.id}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {request.submittedTime}
                </div>
              </div>

              {request.status === 'delivered' && (
                <Can perform={Action.SUBMIT_CUSTOMER_FEEDBACK}>
                  <button
                    onClick={() => setFeedbackRequest({ id: request.id, agentName: 'Assigned Agent' })}
                    className="w-full bg-erkata-primary text-white font-bold py-3 rounded-xl hover:bg-erkata-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Review Delivery
                  </button>
                </Can>
              )}

              {request.status === 'fulfilled' && (
                <div className="w-full bg-green-50 text-green-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-green-100">
                  <CheckCircle className="w-4 h-4" />
                  Request Fulfilled
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

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
