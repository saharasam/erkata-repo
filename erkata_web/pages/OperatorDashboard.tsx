import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Users, 
  Clock, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import api from '../utils/api';
import { Can } from '../components/ui/Can';
import { Action } from '../hooks/usePermissions';
import OperatorSidebar from '../components/operator/OperatorSidebar';
import AgentAssignmentModal from '../components/operator/AgentAssignmentModal';

const OperatorDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showAlert, showConfirm } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [activeTransactions, setActiveTransactions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<{id: string} | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [requestsRes, transactionsRes] = await Promise.all([
                    api.get(`/requests/queue${user?.zoneId ? `?zoneId=${user.zoneId}` : ''}`),
                    api.get('/transactions')
                ]);
                setPendingRequests(requestsRes.data);
                setActiveTransactions(transactionsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                showAlert({ title: 'Error', message: 'Failed to load dashboard data. Please try again later.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssignToAgent = (request: any) => {
        setSelectedRequest({ id: request.id });
        setIsAssignmentModalOpen(true);
    };

    const onAssignmentComplete = (agentId: string) => {
        showAlert({ 
            title: 'Assignment Successful', 
            message: 'The agent has been assigned to the request effectively.', 
            type: 'success' 
        });
        // Refresh data
        window.location.reload(); // Simple refresh for now to update all states
    };

    const handleTransactionUpdate = async (transactionId: string, status: string) => {
        try {
            await api.patch(`/transactions/${transactionId}/status`, { status });
            showAlert({ title: 'Success', message: `Transaction marked as ${status}`, type: 'success' });
            // Refresh data
            const transactionsRes = await api.get('/transactions');
            setActiveTransactions(transactionsRes.data);
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to update transaction status', type: 'error' });
        }
    };

    const filteredRequests = pendingRequests.filter(req => 
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.customer?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Pending Requests', value: pendingRequests.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Active Jobs', value: activeTransactions.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Agent Zones', value: '12', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Payout', value: '4.2k ETB', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="operator" sidebarContent={<OperatorSidebar currentView="overview" onViewChange={() => {}} />}>
                <div className="animate-pulse space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
                        ))}
                    </div>
                    <div className="h-96 bg-slate-100 rounded-2xl" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="operator" sidebarContent={<OperatorSidebar currentView="overview" onViewChange={() => {}} />}>
            <div className="space-y-8">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Assignment Console */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Assignment Queue
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search requests..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-48 md:w-64"
                                    />
                                </div>
                                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Request Cards */}
                        <div className="grid gap-4">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div key={request.id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        RQ-{request.id.split('-')[0]}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                                {request.description || request.category}
                                            </h4>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    {request.customer?.fullName || 'Anonymous'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {request.zone?.name || 'Unknown Zone'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end sm:border-l sm:border-slate-100 sm:pl-6 min-w-[140px]">
                                            <Can perform={Action.ASSIGN_AGENT}>
                                                <button 
                                                    onClick={() => handleAssignToAgent(request)}
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                                                >
                                                    Assign Agent
                                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </Can>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg mb-1">No requests found</h3>
                                    <p className="text-slate-500 text-sm">Try adjusting your search or check back later.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Processing Status */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Live Process
                        </h2>

                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Transactions</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Live</span>
                            </div>
                            
                            <div className="divide-y divide-slate-50">
                                {activeTransactions.length > 0 ? (
                                    activeTransactions.map((tx) => (
                                        <div key={tx.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {tx.match?.request?.category}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-400">
                                                        ID: {tx.id.split('-')[0].toUpperCase()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">C</div>
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">A</div>
                                                </div>
                                                <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-slate-400 font-medium">No active transactions</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-slate-50 text-center">
                                <button className="text-xs font-bold text-slate-800 hover:underline">
                                    View Transaction History
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions or Reminders */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <h3 className="font-bold mb-2">Operator Tip</h3>
                            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                Always verify communication before marking a transaction as physically completed. 
                                Unbundling feedback requires Admin approval.
                            </p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-colors">
                                View Full Guidelines
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedRequest && (
                <AgentAssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={() => setIsAssignmentModalOpen(false)}
                    requestId={selectedRequest.id}
                    onAssigned={onAssignmentComplete}
                />
            )}
        </DashboardLayout>
    );
};

export default OperatorDashboard;
