import React, { useState } from 'react';
import { User, Bell, Shield, Mail, Lock, Phone, Globe, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  role: 'agent' | 'operator' | 'admin' | 'customer';
}

const SettingsView: React.FC<SettingsViewProps> = ({ role }) => {
  const { user } = useAuth();
  const { showConfirm, showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  
  // Mock State for toggles
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your account preferences and security configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-erkata-primary shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-erkata-primary' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-sm">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{user?.email}</p>
                    <div className="flex gap-2">
                       <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                          Change Avatar
                       </button>
                       <button className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          Delete
                       </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <div className="relative">
                       <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                          type="text" 
                          defaultValue={user?.name || ''} 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="relative">
                       <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                          type="email" 
                          defaultValue={user?.email || ''} 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <div className="relative">
                       <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                          type="tel" 
                          placeholder="+251 911 234 567" 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                    <div className="relative">
                       <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all appearance-none">
                          <option>English</option>
                          <option>Amharic</option>
                          <option>Oromiffa</option>
                       </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <button 
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Save Changes',
                        message: 'Are you sure you want to update your profile settings?',
                        confirmText: 'Save Changes',
                        type: 'info'
                      });
                      if (confirmed) {
                        showAlert({
                          title: 'Settings Updated',
                          message: 'Your profile preferences have been successfully saved.',
                          type: 'success'
                        });
                      }
                    }}
                    className="bg-erkata-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-erkata-primary/30 hover:bg-erkata-secondary transition-colors"
                  >
                      Save Changes
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Alert Preferences</h3>
                    <p className="text-sm text-slate-500">Choose how you want to be notified about important updates.</p>
                 </div>

                 <div className="space-y-4">
                    {[
                       { key: 'email', title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                       { key: 'push', title: 'Push Notifications', desc: 'Get real-time updates on your browser or device.' },
                       { key: 'sms', title: 'SMS Alerts', desc: 'Receive urgent messages via text message.' },
                    ].map((item) => (
                       <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                             <h4 className="font-bold text-slate-700 text-sm">{item.title}</h4>
                             <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <button 
                             onClick={() => toggleNotification(item.key as any)}
                             className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications[item.key as keyof typeof notifications] ? 'bg-erkata-primary' : 'bg-slate-300'}`}
                          >
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    ))}
                 </div>
                 
                 <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => {
                        showAlert({
                          title: 'Notifications Updated',
                          message: 'Your notification preferences have been saved.',
                          type: 'success'
                        });
                      }}
                      className="bg-erkata-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-erkata-primary/30 hover:bg-erkata-secondary transition-colors"
                    >
                      Save Preferences
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
               <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Security & Login</h3>
                    <p className="text-sm text-slate-500">Manage your password and security questions.</p>
                 </div>

                 <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800">
                    <Shield className="w-5 h-5 shrink-0" />
                    <div>
                       <h4 className="font-bold text-sm">Two-Factor Authentication</h4>
                       <p className="text-xs opacity-80 mt-1">We recommend enabling 2FA for additional account security.</p>
                    </div>
                    <button 
                      onClick={() => {
                        showAlert({
                          title: '2FA Setup',
                          message: 'This feature will be available shortly.',
                          type: 'info'
                        });
                      }}
                      className="ml-auto text-xs font-bold underline"
                    >
                      Enable
                    </button>
                 </div>

                 <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                       <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                          <input type="password" placeholder="New password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                          <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex justify-end">
                   <button 
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Update Password',
                        message: 'Are you sure you want to change your password?',
                        confirmText: 'Update Now',
                        type: 'warning'
                      });
                      if (confirmed) {
                        showAlert({
                          title: 'Password Changed',
                          message: 'Your password has been updated successfully.',
                          type: 'success'
                        });
                      }
                    }}
                    className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 hover:bg-slate-700 transition-colors"
                  >
                      Update Password
                   </button>
                </div>
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
