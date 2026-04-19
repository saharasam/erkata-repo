import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, History, Search, Loader2, Sparkles, Bell, Inbox } from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Broadcast {
    id: string;
    title: string;
    content?: string;
    target: string;
    createdAt: string;
}

const BroadcastInbox: React.FC = () => {
    const [history, setHistory] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/admin/broadcasts');
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch broadcast history:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                            <Megaphone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Notices</h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-tight">Stay updated with the latest announcements from the platform administration.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search notices..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-slate-100 shadow-sm" />
                    ))
                ) : filteredHistory.length > 0 ? (
                    <AnimatePresence mode='popLayout'>
                        {filteredHistory.map((b, index) => (
                            <motion.div 
                                key={b.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/10 hover:border-indigo-500/20 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-[40px] group-hover:bg-indigo-500/10 transition-colors" />
                                
                                <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shrink-0">
                                        <Bell className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-widest uppercase border ${
                                                b.target === 'EVERYONE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                b.target === 'AGENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {b.target}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(b.createdAt).toLocaleDateString(undefined, { 
                                                    month: 'long', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {b.title}
                                        </h2>
                                        
                                        {b.content && (
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-4xl whitespace-pre-wrap">
                                                {b.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-white border-dashed text-center space-y-4 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Inbox className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">No active notices</h3>
                            <p className="text-slate-500 max-w-xs text-sm font-medium">
                                Your inbox is clean. System announcements will appear here as they are broadcasted.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Authority Disclaimer */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                <div className="flex items-center gap-4 relative z-10">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                    <div>
                        <h5 className="text-sm font-black uppercase tracking-widest mb-1">Authenticated Delivery</h5>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            These communications are official platform directives issued by the Super Admin authority.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastInbox;
