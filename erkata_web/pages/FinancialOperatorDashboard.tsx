import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Megaphone, Loader2 } from 'lucide-react';
import UpgradeVerificationsBoard from '../components/financial/UpgradeVerificationsBoard';
import BroadcastInbox from '../components/shared/BroadcastInbox';

const FinancialOperatorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState('verifications');

  return (
    <DashboardLayout 
      title="Financial Desk" 
      role="financial_operator"
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'verifications' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Upgrade Verifications</h1>
                    <p className="text-slate-500 font-medium">Verify ETB bank transfers and approve package upgrades for agents.</p>
                  </div>
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                </div>

                <UpgradeVerificationsBoard />
              </div>
            )}

            {currentView === 'notices' && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[600px]">
                <BroadcastInbox />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default FinancialOperatorDashboard;
