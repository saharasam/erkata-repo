import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'alert', title: 'High Latency Detected', message: 'System response time > 500ms in Zone Bole.', time: '2m ago', read: false },
    { id: '2', type: 'warning', title: 'Pending Approval', message: 'Agent "Abebe B." tier upgrade request pending.', time: '15m ago', read: false },
    { id: '3', type: 'success', title: 'Bundle Resolved', message: 'Correction bundle #BND-2024-001 approved by Super Admin.', time: '1h ago', read: true },
    { id: '4', type: 'info', title: 'System Update', message: 'Maintenance scheduled for tonight at 2:00 AM.', time: '4h ago', read: true },
];

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onMarkAllRead?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, onMarkAllRead }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
                    />
                    
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-erkata-primary" />
                                Notifications
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={onMarkAllRead} className="text-[10px] uppercase font-bold text-erkata-primary hover:text-erkata-secondary tracking-wide">
                                    Mark all read
                                </button>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {MOCK_NOTIFICATIONS.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {MOCK_NOTIFICATIONS.map(notification => (
                                        <div key={notification.id} className={`p-4 hover:bg-slate-50 transition-colors relative group ${notification.read ? 'opacity-70' : 'bg-blue-50/30'}`}>
                                            {!notification.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-erkata-primary rounded-r-full" />
                                            )}
                                            <div className="flex gap-3">
                                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                    notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                                    notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                    notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {notification.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                                                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />} {/* Reusing Icon */}
                                                    {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                                                    {notification.type === 'info' && <Info className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm ${notification.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationsPanel;
