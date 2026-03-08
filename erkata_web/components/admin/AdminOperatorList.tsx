import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Users, Clock, Loader2, MapPin } from 'lucide-react';

interface Operator {
    id: string;
    fullName: string;
    isActive: boolean;
    zone?: {
        name: string;
    };
    createdAt: string;
}

const AdminOperatorList: React.FC = () => {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOperators = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/users?role=operator');
                setOperators(res.data);
            } catch (error) {
                console.error('Failed to fetch operators:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOperators();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800">Operator Management</h2>
                     <p className="text-slate-500 text-sm">Track operator capacity and performance metrics.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-500 font-bold">Loading operators...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {operators.map(op => (
                        <div key={op.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                        {op.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{op.fullName}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${op.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            <p className="text-xs text-slate-500 capitalize">{op.isActive ? 'Online' : 'Offline'}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{op.id.split('-')[0].toUpperCase()}</span>
                            </div>

                            <div className="flex items-center gap-2 py-3 border-t border-slate-50 mb-3">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">
                                    {op.zone?.name || 'Global Access'}
                                </span>
                            </div>

                            <div className="mt-2 flex gap-2">
                                 <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                                    View Profile
                                 </button>
                                 <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                    Manage
                                 </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOperatorList;
