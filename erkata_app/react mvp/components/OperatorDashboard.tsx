import React, { useState } from 'react';
import { ViewState, ServiceRequest, RequestStatus } from '../types';
import { MOCK_REQUESTS } from '../constants';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, UserPlus, SlidersHorizontal } from 'lucide-react';

interface OperatorDashboardProps {
  setView: (view: ViewState) => void;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ setView }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extended mock data for the dense table feel
  const allRequests = [
    ...MOCK_REQUESTS,
    { id: 'REQ-2023-004', type: 'Property', title: 'Studio in Kazanchis', date: 'Oct 25, 2023', status: 'New', location: 'Kirkos', budget: '10,000 ETB' },
    { id: 'REQ-2023-005', type: 'Furniture', title: 'Office Desk Bulk Order', date: 'Oct 26, 2023', status: 'Assigned', location: 'Bole', budget: '80,000 ETB' },
    { id: 'REQ-2023-006', type: 'Property', title: 'Villa for Rent', date: 'Oct 26, 2023', status: 'New', location: 'CMC', budget: '45,000 ETB' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Assigned': return 'bg-yellow-100 text-yellow-800';
      case 'In-Progress': return 'bg-purple-100 text-purple-800';
      case 'Fulfilled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Centralized Request Queue</h1>
          <p className="text-xs text-gray-500">Managing {allRequests.length} active requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID, Name..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-ethio-blue focus:border-ethio-blue w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter size={18} />
          </button>
          <div className="h-8 w-8 rounded-full bg-ethio-charcoal text-white flex items-center justify-center font-bold text-sm">
            OP
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Bulk Actions Bar */}
        <div className="flex items-center gap-2 mb-4">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
            <UserPlus size={14} /> Bulk Assign
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
            <CheckCircle size={14} /> Approve Selected
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm ml-auto">
            <SlidersHorizontal size={14} /> View Settings
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300 text-ethio-blue focus:ring-ethio-blue" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID & Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300 text-ethio-blue focus:ring-ethio-blue" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.id}</div>
                    <div className="text-xs text-gray-500">{req.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{req.title}</div>
                    <div className="text-xs text-gray-500">{req.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{req.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{req.budget}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                       <button className="text-green-600 hover:text-green-900"><CheckCircle size={18} /></button>
                       <button className="text-red-600 hover:text-red-900"><XCircle size={18} /></button>
                       <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
             <div className="text-xs text-gray-500">Showing 1 to {allRequests.length} of {allRequests.length} results</div>
             <div className="flex gap-1">
               <button className="px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50 disabled:opacity-50">Prev</button>
               <button className="px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50">Next</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;