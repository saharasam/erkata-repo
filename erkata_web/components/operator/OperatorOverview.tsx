import React from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Search,
  X
} from 'lucide-react';

interface OperatorOverviewProps {
    isOnline: boolean;
    toggleOnline: () => void;
    pushedRequest: any;
    timeLeft: number;
    formatTime: (s: number) => string;
    onAssignToAgent: () => void;
    trackerFilter: 'active' | 'disputed';
    onSetTrackerFilter: (f: 'active' | 'disputed') => void;
    searchQuery: string;
    onSetSearchQuery: (q: string) => void;
    filteredTransactions: any[];
    visibleCount: number;
    onLoadMore: () => void;
    onForceComplete: (tx: any) => void;
    heartbeatError: string | null;
}

const OperatorOverview: React.FC<OperatorOverviewProps> = ({
    isOnline,
    toggleOnline,
    pushedRequest,
    timeLeft,
    formatTime,
    onAssignToAgent,
    trackerFilter,
    onSetTrackerFilter,
    searchQuery,
    onSetSearchQuery,
    filteredTransactions,
    visibleCount,
    onLoadMore,
    onForceComplete,
    heartbeatError
}) => {
    return (
        <div className="space-y-8">
            {/* Header with Online Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Operator Console</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage request assignments and track live transactions.</p>
                </div>
                
                <button 
                    onClick={toggleOnline}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                        isOnline 
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                    }`}
                >
                    {isOnline ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    {isOnline ? 'ONLINE' : 'GO ONLINE'}
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Center Column: The Push Console */}
                <div className="lg:col-span-2">
                    {!isOnline ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                <ShieldAlert className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">You are currently Offline</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Switch to Online mode to start receiving service requests. Our automated system will pair you with the next available task.
                            </p>
                            <button 
                                onClick={toggleOnline}
                                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Start Accepting Requests
                            </button>
                        </div>
                    ) : pushedRequest ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    New Assignment Pushed!
                                </h2>
                                <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold border border-rose-100">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-indigo-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Priority</span>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                                            {pushedRequest.category}
                                        </span>
                                        {pushedRequest.metadata?.declinedByAgentName && (
                                            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-bold">
                                                <ShieldAlert className="w-4 h-4" />
                                                PREVIOUSLY DECLINED BY: {pushedRequest.metadata.declinedByAgentName.toUpperCase()}
                                            </div>
                                        )}
                                        <h3 className="text-3xl font-black text-slate-900">
                                            {pushedRequest.description || pushedRequest.category}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer</p>
                                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                                <Users className="w-4 h-4 text-indigo-500" />
                                                {pushedRequest.customer?.fullName}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location Zone</p>
                                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                                <MapPin className="w-4 h-4 text-rose-500" />
                                                {pushedRequest.zone?.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={onAssignToAgent}
                                            className="w-full py-5 bg-indigo-600 text-white text-lg font-black rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200"
                                        >
                                            Assign Eligible Agent
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                        <p className="text-center text-xs text-slate-400 mt-4 font-medium italic">
                                            Failing to assign an agent within 5 minutes will mark you as offline.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-24 text-center shadow-sm">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
                                <div className="absolute inset-4 bg-indigo-50 rounded-full animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="w-10 h-10 text-indigo-500 fill-indigo-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Waiting for next request...</h2>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                The system is scanning for incoming requests in your assigned zones. You will receive an alert as soon as one is found.
                            </p>
                            {heartbeatError && <p className="text-rose-500 text-xs mt-4 font-bold uppercase tracking-widest">{heartbeatError}</p>}
                        </div>
                    )}
                </div>

                {/* Right Column: Transactions & History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Active Tracker
                        </h2>
                    </div>

                    {/* Filter & Search */}
                    <div className="space-y-4">
                        <div className="flex p-1 bg-slate-100 rounded-2xl">
                            <button 
                                onClick={() => onSetTrackerFilter('active')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                    trackerFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => onSetTrackerFilter('disputed')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                    trackerFilter === 'disputed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Disputed
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => onSetSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => onSetSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {trackerFilter === 'active' ? 'Live Updates' : 'Disputed Tasks'}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Live</span>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.slice(0, visibleCount).map((tx) => (
                                    <div key={tx.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {tx.request?.category || 'General Service'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-tight">
                                                    ID: {tx.id.split('-')[0].toUpperCase()}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                tx.request?.status === 'disputed' ? 'bg-rose-50 text-rose-600' :
                                                tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                                {tx.request?.status === 'disputed' ? 'disputed' : tx.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <div className="flex -space-x-2">
                                                <div title={`Customer: ${tx.request?.customer?.fullName}`} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500 cursor-help">
                                                    {tx.request?.customer?.fullName?.[0] || 'C'}
                                                </div>
                                                <div title={`Agent: ${tx.agent?.fullName}`} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 cursor-help">
                                                    {tx.agent?.fullName?.[0] || 'A'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {(tx.request?.status === 'fulfilled' || tx.request?.status === 'disputed') && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onForceComplete(tx);
                                                        }}
                                                        className="text-[11px] font-black px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-sm shadow-rose-200 flex items-center gap-1.5"
                                                    >
                                                        <AlertTriangle className="w-3 h-3" />
                                                        FORCE COMPLETE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-slate-300 font-bold italic">No {trackerFilter} transactions found</p>
                                </div>
                            )}
                        </div>
                        
                        {filteredTransactions.length > visibleCount && (
                            <div className="p-5 bg-slate-50 text-center border-t border-slate-100">
                                <button 
                                    onClick={onLoadMore}
                                    className="flex items-center gap-2 mx-auto text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Guidelines Card */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white shadow-xl shadow-slate-200">
                        <Zap className="w-6 h-6 text-indigo-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Push Protocol</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Requests are assigned based on your wait time and zone coverage. Once pushed, you have 5 minutes to assign an agent before the task is reclaimed.
                        </p>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
                            Protocol Docs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorOverview;
