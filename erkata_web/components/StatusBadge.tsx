import React from 'react';

interface StatusBadgeProps {
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'pending' | 'awaiting-feedback' | 'in-review' | 'resolved';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Color coding based on guidelines:
  // Blue/Green = action required
  // Grey = completed/archived

  const getStatusStyle = () => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'pending':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'in-progress':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'in-review':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
      case 'resolved':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };



  const formatStatus = (s: string) => {
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle()}`}>
        {formatStatus(status)}
      </span>
    </div>
  );
};

export default StatusBadge;
