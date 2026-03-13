import React, { useState, useEffect } from 'react';
import { Megaphone, Users, Calendar, Send, History, Search, Trash2, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import api from '../../utils/api';

interface Broadcast {
    id: string;
    title: string;
    content?: string;
    target: string;
    createdAt: string;
}

const BroadcastNotices: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState('EVERYONE');
    const [history, setHistory] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

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

    const handleSend = async () => {
        if (!title) return;
        
        const confirmed = await showConfirm({
            title: 'Authorize Global Transmission',
            message: `You are about to broadcast this notice to all ${target.toUpperCase()} users. This action will trigger immediate system-wide notifications.`,
            confirmText: 'Dispatch Protocol',
            type: 'warning'
        });

        if (confirmed) {
            try {
                setIsSending(true);
                await api.post('/admin/broadcasts', { title, content, target });
                showAlert({
                    title: 'Transmission Successful',
                    message: 'System-wide notice has been successfully injected into the global notification bus.',
                    type: 'success'
                });
                setTitle('');
                setContent('');
                fetchHistory();
            } catch (err) {
                showAlert({
                    title: 'Transmission Fault',
                    message: 'Failed to dispatch broadcast due to a routing error in the notification layer.',
                    type: 'error'
                });
            } finally {
                setIsSending(false);
            }
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <Megaphone className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">System-Wide Broadcast</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global notification injection protocol</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Protocol Target Audience</label>
                                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-[1.25rem] border border-slate-100">
                                    {['EVERYONE', 'AGENT', 'OPERATOR', 'ADMIN'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setTarget(t)}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                target === t 
                                                ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Notice Header</label>
                                <div className="relative group">
                                    <Sparkles className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-indigo-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter the critical focus of this notice..."
                                        className="w-full bg-slate-50 border border-slate-100 outline-none rounded-2xl p-5 text-sm font-black placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Detailed Payload (Markdown Supported)</label>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter exhaustive details regarding this system-wide event..."
                                    className="w-full h-40 bg-slate-50 border border-slate-100 outline-none rounded-2xl p-5 text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSend}
                            disabled={!title || isSending}
                            className={`w-full py-5 rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] relative overflow-hidden group ${
                                title && !isSending 
                                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-95' 
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                        >
                            {isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <Send className="w-4 h-4" />
                                    Dispatch Global Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol History</h4>
                        <History className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-32 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />
                            ))
                        ) : history.length > 0 ? (
                            history.map((b) => (
                                <div key={b.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/10 hover:border-indigo-500/20 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg tracking-widest uppercase border ${
                                            b.target === 'EVERYONE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            b.target === 'AGENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {b.target}
                                        </span>
                                        <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h5 className="text-sm font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{b.title}</h5>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 text-center space-y-3">
                                <History className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest uppercase">No previous transmissions</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]" />
                         <ShieldAlert className="w-6 h-6 text-indigo-400 mb-4" />
                        <h5 className="text-xs font-black uppercase tracking-widest mb-2">Authority Note</h5>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Every broadcast is cryptographically signed and archived. Misuse of the global notification bus affects platform trust benchmarks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotices;

