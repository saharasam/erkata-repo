import React from 'react';
import { ViewState } from '../types';
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileViewProps {
  setView: (view: ViewState) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ setView }) => {
  const menuItems = [
    { icon: User, label: 'Personal Information', sub: 'Edit your details' },
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts' },
    { icon: Shield, label: 'Security & Privacy', sub: 'Password, 2FA' },
    { icon: Settings, label: 'Preferences', sub: 'Language, Theme' },
    { icon: CircleHelp, label: 'Help & Support', sub: 'FAQ, Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Profile Section */}
      <div className="bg-white pb-8 pt-12 px-6 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-ethio-blue flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-ethio-blue/30">
              A
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-ethio-charcoal text-white rounded-full border-4 border-white shadow-sm">
              <Settings size={14} />
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Abebe Kebede</h1>
          <p className="text-gray-500 text-sm">abebe.k@example.com</p>
          <div className="mt-4 flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Verified User</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Member since 2023</span>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-5 space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </motion.button>
        ))}

        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-6 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-semibold hover:bg-red-50 transition-colors"
        >
            <LogOut size={18} />
            Log Out
        </motion.button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-300">Version 1.0.2</p>
      </div>
    </div>
  );
};

export default ProfileView;