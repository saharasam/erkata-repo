import React from 'react';
import { Home, Activity, User, CreditCard, LayoutDashboard, Zap, TrendingUp, Phone } from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  userRole: UserRole | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, userRole }) => {
  let navItems = [];

  if (userRole === UserRole.CUSTOMER) {
    navItems = [
      { view: ViewState.HOME, icon: Home, label: 'Home' },
      { view: ViewState.TRACKING, icon: Activity, label: 'Activity' },
      { view: ViewState.PAYMENT, icon: CreditCard, label: 'Pay' },
      { view: ViewState.PROFILE, icon: User, label: 'Profile' },
    ];
  } else if (userRole === UserRole.AGENT) {
    navItems = [
      { view: ViewState.AGENT_DASHBOARD, icon: LayoutDashboard, label: 'Feed' },
      { view: ViewState.AGENT_COMMISSION, icon: TrendingUp, label: 'Earnings' },
      { view: ViewState.AGENT_SUBSCRIPTION, icon: Zap, label: 'Plan' },
      { view: ViewState.AGENT_COMMUNICATION, icon: Phone, label: 'Contact' },
    ];
  } else {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-ethio-blue bg-ethio-blue/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-200 ${isActive ? 'scale-105' : ''}`}
                />
                <span className="text-[10px] font-medium tracking-wide mt-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;