import React, { useState, useEffect } from 'react';
import { AlertTriangle, FileText, Send, CheckCircle2, Clock } from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { Action, usePermissions } from '../../hooks/usePermissions';
import { Can } from '../ui/Can';

// Removed MOCK_BUNDLES

const EscalatedBundles: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const { hasPermission } = usePermissions();
    const [bundles, setBundles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState<any | null>(null);
    const [proposalText, setProposalText] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchBundles = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/mediation/bundles?state=BUNDLED');
                setBundles(res.data || []);
            } catch (error) {
                console.error('Failed to fetch bundles:', error);
                showAlert({ title: 'Error', message: 'Failed to load escalated bundles.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchBundles();
    }, [showAlert]);

    const handlePropose = async () => {
        if (!proposalText.trim() || !selectedBundle) return;
        
        try {
            await api.patch(`/mediation/bundle/${selectedBundle.id}/propose`, { proposedText: proposalText });
            setSuccessMessage('Proposal Submitted Successfully');
            setShowSuccess(true);
            setTimeout(() => {
                setBundles(prev => prev.filter(b => b.id !== selectedBundle.id));
                setSelectedBundle(null);
                setProposalText('');
                setShowSuccess(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to propose resolution:', error);
            showAlert({ title: 'Error', message: 'Failed to submit proposal.', type: 'error' });
        }
    };

    const handleFinalize = async () => {
        if (!proposalText.trim() || !selectedBundle) return;

        const confirmed = await showConfirm({
            title: 'Issue Binding Resolution',
            message: 'Are you sure you want to issue a FINAL resolution? This will close the mediation and trigger payouts/refunds as specified.',
            confirmText: 'Issue Final Resolution',
            type: 'warning'
        });

        if (!confirmed) return;
        
        try {
            await api.post(`/mediation/bundle/${selectedBundle.id}/finalize`, { resolutionText: proposalText });
            setSuccessMessage('Resolution Finalized Successfully');
            setShowSuccess(true);
            setTimeout(() => {
                setBundles(prev => prev.filter(b => b.id !== selectedBundle.id));
                setSelectedBundle(null);
                setProposalText('');
                setShowSuccess(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to finalize resolution:', error);
            showAlert({ title: 'Error', message: 'Failed to finalize resolution.', type: 'error' });
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Success Notification */}
            {showSuccess && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-900" />
                    </div>
                    <span className="font-bold">{successMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Escalated Feedback Bundles</h2>
                    <p className="text-slate-500 text-sm">Review bundled feedback and propose resolutions for Super Admin approval.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                        Total: {bundles.length}
                    </span>
                </div>
            </div>

            {bundles.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                    <p className="text-slate-500">No escalated bundles requiring your attention.</p>
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="lg:col-span-1 space-y-4">
                    {bundles.map(bundle => (
                        <div 
                            key={bundle.id}
                            onClick={() => setSelectedBundle(bundle)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedBundle?.id === bundle.id 
                                ? 'bg-indigo-50 border-indigo-200 shadow-md' 
                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-400">{bundle.id.split('-')[0].toUpperCase()}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    bundle.state === 'BUNDLED' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {bundle.state}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2">
                                {bundle.transaction?.match?.request?.description || 'Untitled Transaction'}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(bundle.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Column */}
                <div className="lg:col-span-2">
                    {selectedBundle ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                                            {selectedBundle.transaction?.match?.request?.description || 'Service Transaction'}
                                        </h3>
                                        <p className="text-sm text-slate-500">Bundle ID: {selectedBundle.id}</p>
                                    </div>
                                    {selectedBundle.state === 'PROPOSED' && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Proposed
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Feedbacks */}
                            <div className="p-6 grid gap-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                     {selectedBundle.transaction?.feedbacks?.map((fb: any, idx: number) => (
                                         <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                             <div className="flex justify-between mb-2">
                                                 <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{fb.author?.role}</span>
                                                 <span className="text-xs text-slate-400">{fb.author?.fullName}</span>
                                             </div>
                                             <p className="text-sm text-slate-600 italic">"{fb.content}"</p>
                                         </div>
                                     ))}
                                </div>

                                {/* Action Area */}
                                <div className="mt-4 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                        Propose Resolution
                                    </h4>
                                    
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-800 flex gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        {hasPermission(Action.FINALIZE_RESOLUTION) ? (
                                            <p>As Admin with Decision Authority, you can issue a <strong>binding resolution</strong> for this transaction.</p>
                                        ) : (
                                            <p>As Admin, you can only <strong>propose</strong> a resolution. Final decision power rests with the Super Admin.</p>
                                        )}
                                    </div>

                                    <textarea
                                        value={proposalText}
                                        onChange={(e) => setProposalText(e.target.value)}
                                        className="w-full h-32 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 resize-none"
                                        placeholder="Describe your proposed resolution, reasoning, and any recommended actions..."
                                    />
                                    
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Can perform={Action.PROPOSE_RESOLUTION}>
                                            <button
                                                onClick={handlePropose}
                                                disabled={!proposalText.trim()}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
                                            >
                                                <Send className="w-4 h-4" />
                                                Submit Proposal
                                            </button>
                                        </Can>

                                        <Can perform={Action.FINALIZE_RESOLUTION}>
                                            <button
                                                onClick={handleFinalize}
                                                disabled={!proposalText.trim()}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Finalize Resolution
                                            </button>
                                        </Can>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-2xl">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium">Select a bundle to view details</p>
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default EscalatedBundles;
