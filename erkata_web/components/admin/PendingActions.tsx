import React from 'react';
import { AlertCircle, ArrowRight, UserPlus, FileText } from 'lucide-react';

const PendingActions: React.FC = () => {
    const [actions, setActions] = React.useState([
        { id: 1, type: 'bottleneck', days: 5, description: 'Transaction #TX-9921 waiting for feedback', subtext: 'Assigned to: Operator Solomon D.', color: 'red', actionLabel: 'Nudge Operator' },
        { id: 2, type: 'bottleneck', days: 3, description: 'Request #REQ-8812 unassigned', subtext: 'Zone: Bole', color: 'orange', actionLabel: 'Escalated Assign' }
    ]);
    const [message, setMessage] = React.useState('');

    const handleAction = (id: number, label: string) => {
        setMessage(`${label} successful! Item removed from queue.`);
        setActions(prev => prev.filter(a => a.id !== id));
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="space-y-6 relative">
             {/* Toast Message */}
             {message && (
                <div className="absolute top-0 right-0 bg-slate-800 text-white text-xs px-4 py-3 rounded-xl shadow-xl z-50 animate-fade-in-up">
                    {message}
                </div>
            )}

            <h2 className="text-2xl font-bold text-slate-800">Pending Actions</h2>
            
            <div className="space-y-4">
                 {/* Section 1: Bottlenecks */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Operational Bottlenecks
                    </h3>
                    {actions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic">
                            No bottlenecks detected. Good job!
                        </div>
                    ) : (
                    <div className="space-y-3">
                        {actions.map(action => (
                        <div key={action.id} className={`flex items-center justify-between p-3 bg-${action.color}-50 border border-${action.color}-100 rounded-lg`}>
                            <div className="flex items-center gap-3">
                                <div className="text-center min-w-[3rem]">
                                    <span className={`block text-xl font-bold text-${action.color}-600`}>{action.days}</span>
                                    <span className={`text-[10px] text-${action.color}-500 uppercase font-bold`}>Days</span>
                                </div>
                                <div className={`h-8 w-px bg-${action.color}-200`} />
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{action.description}</p>
                                    <p className="text-xs text-slate-500">{action.subtext}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleAction(action.id, action.actionLabel)}
                                className={`px-3 py-1.5 text-xs font-bold text-${action.color}-700 bg-white border border-${action.color}-200 rounded-lg hover:bg-${action.color}-50 transition-colors shadow-sm`}
                            >
                                {action.actionLabel}
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
                 </div>

                 {/* Section 2: Agent Approvals */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-600" />
                        Agent Onboarding (Super Admin Required)
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">You can review details but final approval requires Super Admin.</p>
                    {/* Placeholder list */}
                    <div className="text-sm text-slate-400 italic">No pending agent approvals currently visible to you.</div>
                 </div>
            </div>
        </div>
    );
};

export default PendingActions;
