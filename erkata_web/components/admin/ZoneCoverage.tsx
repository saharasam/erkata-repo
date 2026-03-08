import React from 'react';
import { Map, AlertTriangle } from 'lucide-react';

interface ZoneData {
    id: string;
    name: string;
    agents: number;
    requests: number;
    status: 'good' | 'warning' | 'critical';
}

const MOCK_ZONES: ZoneData[] = [
    { id: 'Z-01', name: 'Bole', agents: 45, requests: 120, status: 'good' },
    { id: 'Z-02', name: 'Yeka', agents: 12, requests: 80, status: 'warning' },
    { id: 'Z-03', name: 'Kirkos', agents: 5, requests: 90, status: 'critical' },
    { id: 'Z-04', name: 'Arada', agents: 22, requests: 40, status: 'good' },
    { id: 'Z-05', name: 'Lideta', agents: 8, requests: 25, status: 'warning' },
];

const ZoneCoverage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">Zone Coverage</h2>
                     <p className="text-slate-500 text-sm">Geographic distribution of agents and request demand.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Map Placeholder */}
                <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 h-80 flex flex-col items-center justify-center text-slate-400">
                    <Map className="w-12 h-12 mb-2 opacity-50" />
                    <p className="font-medium">Interactive Map Module</p>
                    <p className="text-xs">Map visualization would be integrated here</p>
                </div>

                {/* Data List */}
                <div className="space-y-4">
                     <h3 className="font-bold text-slate-800">Coverage Status by Woreda</h3>
                     <div className="space-y-3">
                         {MOCK_ZONES.map(zone => (
                             <div key={zone.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <h4 className="font-bold text-slate-800">{zone.name}</h4>
                                         {zone.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                     </div>
                                     <div className="text-xs text-slate-500 flex gap-3 mt-1">
                                         <span>Agents: <strong className="text-slate-700">{zone.agents}</strong></span>
                                         <span>Requests: <strong className="text-slate-700">{zone.requests}</strong></span>
                                     </div>
                                 </div>
                                 
                                 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                     zone.status === 'good' ? 'bg-green-100 text-green-700' :
                                     zone.status === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                 }`}>
                                     {zone.status}
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ZoneCoverage;
