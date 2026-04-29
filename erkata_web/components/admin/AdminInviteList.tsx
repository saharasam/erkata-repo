import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Clock, 
  Trash2, 
  Loader2, 
  UserCheck, 
  Shield, 
  ExternalLink 
} from 'lucide-react';
import api from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useSocket } from '../../contexts/SocketContext';

interface Invite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  token: string;
}

interface AdminInviteListProps {
  onInviteCancelled?: () => void;
  refreshTrigger?: number;
}

const AdminInviteList: React.FC<AdminInviteListProps> = ({ onInviteCancelled, refreshTrigger }) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { showConfirm, showAlert } = useModal();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleInviteClaimed = (data: any) => {
        if (data.type === 'invite.claimed') {
          setInvites(prev => prev.filter(i => i.id !== data.inviteId));
        }
      };

      socket.on('notification', handleInviteClaimed);
      return () => {
        socket.off('notification', handleInviteClaimed);
      };
    }
  }, [socket]);

  const fetchInvites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/users/invites');
      setInvites(response.data);
    } catch (err) {
      console.error('Failed to fetch pending invites:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites, refreshTrigger]);

  const handleCancelInvite = async (invite: Invite) => {
    const confirmed = await showConfirm({
      title: 'REVOKE INVITATION',
      message: `Are you sure you want to revoke the invitation for ${invite.email}? The registration link will be immediately invalidated.`,
      confirmText: 'Revoke Link',
      type: 'error'
    });

    if (confirmed) {
      try {
        setIsDeleting(invite.id);
        await api.delete(`/admin/users/${invite.id}/invite`);
        setInvites(prev => prev.filter(i => i.id !== invite.id));
        showAlert({
          title: 'Invitation Revoked',
          message: `The access token for ${invite.email} has been purged.`,
          type: 'success'
        });
        if (onInviteCancelled) onInviteCancelled();
      } catch (err) {
        showAlert({
          title: 'Operation Failed',
          message: 'The system could not revoke the invitation at this time.',
          type: 'error'
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (isLoading && invites.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Checking pending delegation records...
      </div>
    );
  }

  if (invites.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-3.5 h-3.5 text-indigo-500" />
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Personnel Invitations</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invites.map((invite) => (
          <div 
            key={invite.id} 
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Mail className="w-12 h-12 text-slate-900" />
            </div>

            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 w-fit ${
                  invite.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {invite.role}
                </span>
                <p className="font-bold text-slate-800 truncate pr-8">{invite.email}</p>
              </div>
              <button 
                onClick={() => handleCancelInvite(invite)}
                disabled={isDeleting === invite.id}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Revoke Invitation"
              >
                {isDeleting === invite.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  SENT {new Date(invite.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 bg-indigo-50/50 px-2 py-1 rounded-lg">
                <Shield className="w-3 h-3" />
                SECURE LINK
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInviteList;
