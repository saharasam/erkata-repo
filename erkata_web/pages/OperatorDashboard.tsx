import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../contexts/ModalContext';
import api from '../utils/api';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import AccessDenied from '../components/ui/AccessDenied';
import ViewNotFound from '../components/ui/ViewNotFound';
import AgentAssignmentModal from '../components/operator/AgentAssignmentModal';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { useSocket } from '../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components
const OperatorOverview = lazy(() => import('../components/operator/OperatorOverview'));
const DisputesBoard = lazy(() => import('../components/operator/DisputesBoard'));
const BroadcastInbox = lazy(() => import('../components/shared/BroadcastInbox'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
);

const HistoryPlaceholder = () => (
    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Assignment History</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
            You can view your past assignments, completion rates, and performance trends here. This view is currently being optimized.
        </p>
    </div>
);

const VIEWS_REGISTRY: Record<string, { component: React.ComponentType<any>; permission: Action }> = {
    'overview': { component: OperatorOverview, permission: Action.VIEW_QUEUE },
    'disputes': { component: DisputesBoard, permission: Action.VIEW_QUEUE },
    'history': { component: HistoryPlaceholder, permission: Action.VIEW_MANAGED_TRANSACTIONS },
    'notices': { component: BroadcastInbox, permission: Action.VIEW_BROADCASTS },
};

const OperatorDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showAlert } = useModal();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = searchParams.get('view') || 'overview';

    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pushedRequest, setPushedRequest] = useState<any>(null);
    const [activeTransactions, setActiveTransactions] = useState<any[]>([]);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(300);
    
    // Tracker State (kept here to persist across view changes within same session)
    const [trackerFilter, setTrackerFilter] = useState<'active' | 'disputed'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(5);
    
    const [forceCompleteModal, setForceCompleteModal] = useState<{ txId: string; requestId: string } | null>(null);
    const [forceCompleteReason, setForceCompleteReason] = useState('');
    const [isForceCompleting, setIsForceCompleting] = useState(false);

    const { pushedRequestId, error: heartbeatError, trigger: triggerCheck } = useHeartbeat(isOnline);
    const { socket } = useSocket();

    // Guard: Reset invalid views
    useEffect(() => {
        if (searchParams.has('view') && !VIEWS_REGISTRY[searchParams.get('view')!]) {
            setSearchParams({ view: 'overview' }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (!socket) return;
        const handleNotification = (notification: any) => {
            if (notification.type === 'request.pushed') {
                triggerCheck();
            } else if (notification.type === 'request.disputed') {
                setSearchParams({ view: 'disputes' });
            }
        };
        socket.on('notification', handleNotification);
        return () => { socket.off('notification', handleNotification); };
    }, [socket, triggerCheck, setSearchParams]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transactions');
                setActiveTransactions(res.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        let list = [...activeTransactions];
        if (trackerFilter === 'disputed') {
            list = list.filter(tx => tx.request?.status === 'disputed');
        } else {
            list = list.filter(tx => tx.request?.status !== 'disputed');
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(tx =>
                tx.request?.category?.toLowerCase().includes(q) ||
                tx.id?.toLowerCase().includes(q) ||
                tx.request?.description?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [activeTransactions, trackerFilter, searchQuery]);

    const handleForceCompleteSubmit = async () => {
        if (!forceCompleteModal || forceCompleteReason.trim().length < 10) return;
        setIsForceCompleting(true);
        try {
            await api.post(`/requests/${forceCompleteModal.requestId}/force-complete`, { note: forceCompleteReason.trim() });
            showAlert({ title: 'Success', message: 'Request force completed successfully.', type: 'success' });
            setForceCompleteModal(null);
            setForceCompleteReason('');
            const res = await api.get('/transactions');
            setActiveTransactions(res.data);
        } catch (err) {
            showAlert({ title: 'Error', message: 'Failed to force complete.', type: 'error' });
        } finally {
            setIsForceCompleting(false);
        }
    };

    useEffect(() => {
        if (pushedRequestId) {
            api.get(`/requests/${pushedRequestId}`).then(res => {
                setPushedRequest(res.data);
                setTimeLeft(300);
            }).catch(console.error);
        } else {
            setPushedRequest(null);
        }
    }, [pushedRequestId]);

    useEffect(() => {
        if (!pushedRequest) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPushedRequest(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [pushedRequest]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleViewChange = (view: string) => {
        setSearchParams({ view });
    };

    const renderContent = () => {
        const viewConfig = VIEWS_REGISTRY[currentView];
        if (!viewConfig) return <ViewNotFound />;

        const Component = viewConfig.component;
        
        // Inject props for Overview
        const componentProps = currentView === 'overview' ? {
            isOnline,
            toggleOnline: () => setIsOnline(!isOnline),
            pushedRequest,
            timeLeft,
            formatTime,
            onAssignToAgent: () => setIsAssignmentModalOpen(true),
            trackerFilter,
            onSetTrackerFilter: setTrackerFilter,
            searchQuery,
            onSetSearchQuery: setSearchQuery,
            filteredTransactions,
            visibleCount,
            onLoadMore: () => setVisibleCount(prev => prev + 5),
            onForceComplete: (tx: any) => setForceCompleteModal({ txId: tx.id, requestId: tx.requestId }),
            heartbeatError
        } : {};

        return (
            <Can perform={viewConfig.permission} fallback={<AccessDenied />}>
                <Component {...componentProps} />
            </Can>
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout role="operator" currentView={currentView} onViewChange={handleViewChange}>
                <LoadingFallback />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout 
            role="operator" 
            currentView={currentView}
            onViewChange={handleViewChange}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        {renderContent()}
                    </Suspense>
                </motion.div>
            </AnimatePresence>

            {pushedRequest && (
                <AgentAssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={() => setIsAssignmentModalOpen(false)}
                    requestId={pushedRequest.id}
                    zoneId={pushedRequest.zoneId}
                    onAssigned={() => {
                        showAlert({ title: 'Success', message: 'Agent assigned successfully.', type: 'success' });
                        setPushedRequest(null);
                        triggerCheck();
                    }}
                />
            )}

            <AnimatePresence>
                {forceCompleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Force Completion</h3>
                            <textarea 
                                value={forceCompleteReason}
                                onChange={(e) => setForceCompleteReason(e.target.value)}
                                placeholder="Explain why this request must be force completed (min 10 characters)..."
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[120px] mb-6"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setForceCompleteModal(null)} className="flex-1 py-4 text-slate-600 font-bold">Cancel</button>
                                <button 
                                    disabled={forceCompleteReason.trim().length < 10 || isForceCompleting}
                                    onClick={handleForceCompleteSubmit}
                                    className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl"
                                >
                                    {isForceCompleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Force Complete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default OperatorDashboard;
