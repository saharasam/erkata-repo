import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'assigned' | 'fulfilled' | 'disputed' | 'cancelled';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'assigned':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30';
      case 'fulfilled':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'completed':
        return 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200';
      case 'disputed':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
      case 'cancelled':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
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
