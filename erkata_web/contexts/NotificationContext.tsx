import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useModal } from './ModalContext';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  payoutCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const { showAlert } = useModal();
  const processingNotification = useRef<string | null>(null);

  const checkSpecialNotifications = async (items: Notification[]) => {
    // Only process one special notification at a time to avoid overlapping modals
    const special = items.find(n => !n.read && (n.type === 'upgrade.approved' || n.type === 'upgrade.rejected'));
    
    if (special && processingNotification.current !== special.id) {
      processingNotification.current = special.id;
      
      const isApproved = special.type === 'upgrade.approved';
      
      await showAlert({
        title: isApproved ? 'Congratulations!' : 'Upgrade Update',
        message: special.message,
        type: isApproved ? 'success' : 'warning',
        confirmText: 'Great, Thanks!'
      });

      await markAsRead(special.id);
      processingNotification.current = null;
      
      // Check again if there are more
      const remaining = items.filter(n => n.id !== special.id);
      checkSpecialNotifications(remaining);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      checkSpecialNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        if (notification.type === 'upgrade.approved' || notification.type === 'upgrade.rejected') {
          checkSpecialNotifications([notification]);
        }
      };

      socket.on('notification', handleNewNotification);
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const payoutCount = notifications.filter(n => !n.read && n.type === 'payout.requested').length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, payoutCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
