import React from 'react';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Proposal {
    id: string;
    bundleId: string;
    date: string;
    summary: string;
    status: 'approved' | 'rejected' | 'pending';
    myUse: string;
}

const MOCK_PROPOSALS: Proposal[] = [
    { id: 'PROP-001', bundleId: 'BND-2026-003', date: '2026-02-12', summary: 'Refund rider 50%', status: 'approved', myUse: 'Fair compromise based on GPS data.' },
    { id: 'PROP-002', bundleId: 'BND-2026-004', date: '2026-02-13', summary: 'Suspend driver for 3 days', status: 'pending', myUse: 'Repeated offense of rude behavior.' },
    { id: 'PROP-003', bundleId: 'BND-2026-002', date: '2026-02-10', summary: 'Full refund to customer', status: 'rejected', myUse: 'Customer evidence was weak.' },
];

const ProposalHistory: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">My Proposal History</h2>
                     <p className="text-slate-500 text-sm">Track the outcome of your proposed resolutions.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Proposal</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">My Recommendation</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Final Outcome</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_PROPOSALS.map(prop => (
                            <tr key={prop.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-slate-800">{prop.summary}</p>
                                        <p className="text-xs text-slate-500">Bundle: {prop.bundleId}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{prop.date}</td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-slate-600 italic">"{prop.myUse}"</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                        prop.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        prop.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {prop.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                        {prop.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {prop.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {prop.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProposalHistory;
