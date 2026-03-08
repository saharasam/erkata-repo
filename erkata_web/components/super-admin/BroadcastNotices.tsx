import React, { useState } from 'react';
import { Megaphone, Users, Calendar, Send, History, Search, Trash2 } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

const BroadcastNotices: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('everyone');

    const handleSend = async () => {
        if (!title) return;
        
        const confirmed = await showConfirm({
            title: 'Broadcast System-wide Notice',
            message: `Are you sure you want to broadcast this message to ${target.toUpperCase()}?`,
            confirmText: 'Send Now',
            type: 'warning'
        });

        if (confirmed) {
            showAlert({
                title: 'Broadcast Success',
                message: 'System-wide notice has been queued for immediate delivery.',
                type: 'success'
            });
            setTitle('');
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Megaphone className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Global Broadcast</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Audience</label>
                                <div className="flex gap-2">
                                    {['everyone', 'agents', 'operators', 'admins'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setTarget(t)}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                target === t ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Notice Title / Message</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter system notice title..."
                                    className="w-full bg-slate-50 border-none outline-none rounded-2xl p-4 text-sm font-bold placeholder:text-slate-300 focus:ring-1 focus:ring-indigo-500/50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Extended Content (Optional)</label>
                                <textarea 
                                    placeholder="Enter full message details..."
                                    className="w-full h-32 bg-slate-50 border-none outline-none rounded-2xl p-4 text-sm font-medium placeholder:text-slate-300 focus:ring-1 focus:ring-indigo-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSend}
                            disabled={!title}
                            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
                                title ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-900/20 hover:scale-[1.01]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-4 h-4" />
                            Dispatch Broadcast
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Broadcast History</h4>
                    <div className="space-y-3">
                        {[
                            { title: 'Server Maintenance', date: '2026-02-14', target: 'everyone' },
                            { title: 'New Tier Incentive', date: '2026-02-12', target: 'agents' },
                            { title: 'Compliance Update', date: '2026-02-10', target: 'operators' },
                        ].map((b, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded tracking-tighter uppercase">{b.target}</span>
                                    <Trash2 className="w-3 h-3 text-slate-200 group-hover:text-red-500 cursor-pointer transition-colors" />
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 mb-1">{b.title}</h5>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    Sent: {b.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotices;
