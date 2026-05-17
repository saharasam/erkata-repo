import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Plus, 
  X, 
  Loader2,
  Package,
  History,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import api from '../utils/api';
import { useModal } from '../contexts/ModalContext';
import { useSocket } from '../contexts/SocketContext';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';

// Lazy load components
const FeedbackForm = lazy(() => import('../components/FeedbackForm'));
const RequestIntakeFlow = lazy(() => import('../components/RequestIntakeFlow'));
const FulfillmentConfirmation = lazy(() => import('../components/FulfillmentConfirmation'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const VALID_VIEWS = ['requests', 'profile', 'notices'];

interface RequestsListProps {
    requests: any[];
    statusFilter: 'active' | 'history';
    onSetStatusFilter: (filter: 'active' | 'history') => void;
    onNewRequest: () => void;
    onConfirm: (req: any) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ requests, statusFilter, onSetStatusFilter, onNewRequest, onConfirm }) => {
    const filteredRequests = requests.filter((req: any) => {
        if (statusFilter === 'active') {
            return ['pending', 'assigned', 'fulfilled', 'disputed'].includes(req.status);
        } else {
            return ['completed', 'cancelled'].includes(req.status);
        }
    });

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">My Requests</h1>
                    <p className="text-slate-500 mt-2">Track your property and furniture requests here.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                        <button
                            onClick={() => onSetStatusFilter('active')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                statusFilter === 'active' 
                                    ? 'bg-erkata-primary text-white shadow-md shadow-erkata-primary/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            Active
                        </button>
                        <button
                            onClick={() => onSetStatusFilter('history')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                statusFilter === 'history' 
                                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                    </div>

                    <button
                        onClick={onNewRequest}
                        className="bg-erkata-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-erkata-secondary transition-all flex items-center gap-2 shadow-lg shadow-erkata-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request: any, index: number) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                        >
                            <div className="p-5 pb-3 flex justify-between items-center">
                                <span className={`status-badge ${request.status}`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    {request.submittedDate}
                                </span>
                            </div>

                            <div className="px-5 pb-5 flex-grow space-y-3">
                                <h3 className="text-lg font-semibold text-slate-900 leading-snug group-hover:text-erkata-primary transition-colors">
                                    {request.requirementSummary}
                                </h3>

                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin className="w-4 h-4 opacity-70" />
                                    <div className="flex items-baseline gap-1.5 text-xs font-medium text-slate-500">
                                        <span>{request.zone}</span>
                                        <span className="text-[11px] text-slate-400">{request.woreda}</span>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <span className="text-[10px] text-slate-300 font-medium uppercase tracking-tight">
                                        REF: {request.id.slice(0, 8)}
                                    </span>
                                </div>
                            </div>

                            <div className="px-5 pb-4">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${
                                            request.status === 'completed' ? 'w-full bg-emerald-500' :
                                            request.status === 'fulfilled' ? 'w-[90%] bg-erkata-primary' : 
                                            request.status === 'assigned' ? 'w-2/3 bg-erkata-primary' : 
                                            request.status === 'disputed' ? 'w-full bg-rose-500' : 'w-1/3 bg-erkata-primary'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 mt-auto">
                                {request.status === 'completed' ? (
                                    <div className="w-full text-emerald-600 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100">
                                        <CheckCircle className="w-4 h-4" />
                                        Transaction Closed
                                    </div>
                                ) : request.status === 'fulfilled' ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="w-full text-green-600 text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 bg-green-50">
                                            <CheckCircle className="w-4 h-4" />
                                            Service Fulfilled
                                        </div>
                                        <Can perform={Action.SUBMIT_CUSTOMER_FEEDBACK}>
                                            <button
                                                onClick={() => onConfirm(request)}
                                                className="w-full bg-erkata-primary text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-erkata-primary/20"
                                            >
                                                <Star className="w-4 h-4" />
                                                Rate & Confirm
                                            </button>
                                        </Can>
                                    </div>
                                ) : request.status === 'assigned' ? (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-erkata-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {request.agentName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Agent</p>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{request.agentName || 'Verifying Agent...'}</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-medium leading-relaxed text-erkata-primary italic">
                                            Our agent will contact you soon to finalize fulfillment.
                                        </p>
                                    </div>
                                ) : request.status === 'disputed' ? (
                                    <div className="w-full py-3 flex items-center justify-center text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                                        <span className="text-xs font-semibold">Under Mediation</span>
                                    </div>
                                ) : (
                                    <div className="w-full py-3 flex items-center justify-center text-slate-400">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span className="text-xs font-medium italic">Awaiting Operator Assignment</span>
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
                        <p className="text-slate-500 text-sm">You haven't submitted any requests yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'requests': { component: RequestsList, permission: Action.VIEW_OWN_REQUESTS },
    'profile': { component: RequestsList, permission: Action.VIEW_OWN_REQUESTS }, // Shared for MVP
    'notices': { component: RequestsList, permission: Action.VIEW_OWN_REQUESTS },
};

const CustomerDashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get('view') || 'requests';
    
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackRequest, setFeedbackRequest] = useState<{id: string, agentName: string, transactionId: string} | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [confirmationRequest, setConfirmationRequest] = useState<any | null>(null);
    const [statusFilter, setStatusFilter] = useState<'active' | 'history'>('active');
    
    const location = useLocation();
    const { showAlert } = useModal();
    const showSuccess = location.state?.requestSubmitted;

    // Strict URL Parameter Validation
    useEffect(() => {
        if (!VALID_VIEWS.includes(currentView)) {
            setSearchParams({ view: 'requests' }, { replace: true });
        }
    }, [currentView, setSearchParams]);

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

    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            const handleStatusUpdate = (notification: any) => {
                const relevantTypes = ['match.accepted', 'match.completed', 'request.disputed', 'request.fulfilled'];
                if (relevantTypes.includes(notification.type)) {
                    fetchRequests();
                }
            };
            socket.on('notification', handleStatusUpdate);
            return () => {
                socket.off('notification', handleStatusUpdate);
            };
        }
    }, [socket]);

    const handleFeedbackSubmit = async (data: any) => {
        if (!feedbackRequest?.transactionId) {
            showAlert({ title: 'Error', message: 'Transaction ID missing', type: 'error' });
            return;
        }
        await api.post(`/mediation/transaction/${feedbackRequest.transactionId}/feedback`, {
            content: data.comment,
            rating: data.rating,
            categories: data.categories
        });
        fetchRequests();
        setFeedbackRequest(null);
        showAlert({ title: 'Thank You', message: 'Your feedback has been submitted.', type: 'success' });
    };

    const handleConfirmationSuccess = (confirmed: boolean) => {
        if (confirmed) {
            const req = confirmationRequest;
            setFeedbackRequest({
                id: req.id,
                agentName: req.agentName || 'Assigned Agent',
                transactionId: req.transactionId
            });
        } else {
            fetchRequests();
            showAlert({ title: 'Dispute Raised', message: 'Raised for mediation.', type: 'info' });
        }
        setConfirmationRequest(null);
    };

    const renderContent = () => {
        const viewConfig = VIEWS_REGISTRY[currentView];
        if (!viewConfig) return <ViewNotFound />;

        const Component = viewConfig.component;
        const props: any = {
            requests,
            statusFilter,
            onSetStatusFilter: setStatusFilter,
            onNewRequest: () => setIsRequestModalOpen(true),
            onConfirm: (req: any) => setConfirmationRequest(req),
        };

        return (
            <Can perform={viewConfig.permission} fallback={<AccessDenied />}>
                <Component {...props} />
            </Can>
        );
    };

    if (isLoading && !requests.length) {
        return (
            <DashboardLayout role="customer" currentView={currentView} onViewChange={(v) => setSearchParams({ view: v })}>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout 
            role="customer" 
            sidebarContent={null}
            currentView={currentView}
            onViewChange={(v) => setSearchParams({ view: v })}
        >
            <div className="max-w-6xl mx-auto pt-4 px-4">
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Request Submitted Successfully!
                    </motion.div>
                )}
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Suspense fallback={<LoadingFallback />}>
                            {renderContent()}
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Modals */}
            <Suspense fallback={null}>
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
                                className="relative bg-white rounded-[2.5rem] w-full max-w-2xl p-6 overflow-hidden shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-slate-900">New Request</h2>
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
                                        showAlert({ title: 'Success', message: 'Request submitted!', type: 'success' });
                                    }}
                                    onCancel={() => setIsRequestModalOpen(false)}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Suspense>
        </DashboardLayout>
    );
};

export default CustomerDashboard;
