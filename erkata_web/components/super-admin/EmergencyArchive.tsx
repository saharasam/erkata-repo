import React, { useState } from 'react';
import { 
  Archive, 
  AlertTriangle, 
  Timer, 
  Trash2, 
  ShieldAlert,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface AbandonedCase {
  id: string;
  type: string;
  daysStuck: number;
  lastActivity: string;
  status: string;
}

const MOCK_ABANDONED: AbandonedCase[] = [
  { id: 'BND-1920', type: 'Mediation Timeout', daysStuck: 42, lastActivity: '2026-01-01', status: 'TimedOut' },
  { id: 'REQ-4402', type: 'Proposal Stale', daysStuck: 35, lastActivity: '2026-01-08', status: 'Proposed' },
  { id: 'BND-2210', type: 'Agent Abandoned', daysStuck: 31, lastActivity: '2026-01-12', status: 'In-Progress' },
];

const EmergencyArchive: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleArchive = async () => {
        if (!selectedId) return;

        const firstConfirm = await showConfirm({
            title: 'EMERGENCY ARCHIVE',
            message: 'This will permanently close the case without a final decision. This is a break-glass procedure. Do you wish to proceed?',
            confirmText: 'Continue to Reason',
            type: 'error'
        });

        if (firstConfirm) {
            const reason = prompt('Please enter the mandatory reason for emergency archive (min 10 chars):');
            if (reason && reason.length >= 10) {
                 const finalConfirm = await showConfirm({
                    title: 'CRITICAL CONFIRMATION',
                    message: `Reason: "${reason}". Final confirmation for emergency archive of ${selectedId}.`,
                    confirmText: 'Permanently Archive',
                    type: 'error'
                });

                if (finalConfirm) {
                    showAlert({
                        title: 'Emergency Action Logged',
                        message: `Case ${selectedId} has been archived with code EMERGENCY_ARCHIVE_NO_DECISION.`,
                        type: 'success'
                    });
                    setSelectedId(null);
                }
            } else if (reason !== null) {
                showAlert({
                    title: 'Action Cancelled',
                    message: 'A valid reason is mandatory for emergency archival.',
                    type: 'error'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4 items-start">
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                    <h3 className="text-lg font-black text-red-900 tracking-tight">Break-Glass Archive Facility</h3>
                    <p className="text-sm text-red-700/80 font-medium max-w-2xl leading-relaxed">
                        This interface is reserved for cases stuck beyond 30 days or abandoned due to systemic failure. 
                        Archiving here creates a permanent "NO_DECISION" state and closes the mediation chain.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stuck / Abandoned Queue</h4>
                    <div className="relative">
                        <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search ID..." className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-red-500 w-48" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Case ID</th>
                                <th className="px-6 py-4">Classification</th>
                                <th className="px-6 py-4">Days Stuck</th>
                                <th className="px-6 py-4">Current state</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-semibold">
                            {MOCK_ABANDONED.map((k) => (
                                <tr key={k.id} className={`hover:bg-red-50/30 transition-colors ${selectedId === k.id ? 'bg-red-50/50' : ''}`}>
                                    <td className="px-6 py-4 font-black text-slate-900">{k.id}</td>
                                    <td className="px-6 py-4 text-slate-600">{k.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Timer className="w-3 h-3 text-red-500" />
                                            <span className="text-red-600 font-bold">{k.daysStuck}d</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">{k.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedId(k.id)}
                                            className={`p-2 rounded-lg transition-all ${selectedId === k.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white hover:text-red-600 border border-transparent hover:border-red-100'}`}
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    disabled={!selectedId}
                    onClick={handleArchive}
                    className={`px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
                        selectedId 
                        ? 'bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-700' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                >
                    <Trash2 className="w-4 h-4" />
                    Emergency Archive Selection
                </button>
            </div>
        </div>
    );
};

export default EmergencyArchive;
