import React, { useState } from 'react';
import { ViewState, UserRole } from './types';
import Navigation from './components/Navigation';
import AuthView from './components/AuthView';
// Customer Views
import HomeView from './components/HomeView';
import RequestIntake from './components/RequestIntake';
import RequestStatusView from './components/RequestStatus';
import PaymentView from './components/PaymentView';
import ProfileView from './components/ProfileView';
// Agent Views
import AgentDashboard from './components/AgentDashboard';
import AgentSubscription from './components/AgentSubscription';
import AgentCommission from './components/AgentCommission';
import AgentCommunication from './components/AgentCommunication';
// Operator Views
import OperatorDashboard from './components/OperatorDashboard';
import OperatorAssignment from './components/OperatorAssignment';
import OperatorMediation from './components/OperatorMediation';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AUTH);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === UserRole.CUSTOMER) {
      setCurrentView(ViewState.HOME);
    } else if (role === UserRole.AGENT) {
      setCurrentView(ViewState.AGENT_DASHBOARD);
    } else if (role === UserRole.OPERATOR) {
      setCurrentView(ViewState.OPERATOR_DASHBOARD);
    }
  };

  const renderView = () => {
    switch (currentView) {
      // Auth
      case ViewState.AUTH:
        return <AuthView onLogin={handleLogin} />;
      
      // Customer
      case ViewState.HOME:
        return <HomeView setView={setCurrentView} />;
      case ViewState.NEW_REQUEST:
        return <RequestIntake setView={setCurrentView} />;
      case ViewState.TRACKING:
        return <RequestStatusView setView={setCurrentView} />;
      case ViewState.PAYMENT:
        return <PaymentView setView={setCurrentView} />;
      case ViewState.PROFILE:
        return <ProfileView setView={setCurrentView} />;
      
      // Agent
      case ViewState.AGENT_DASHBOARD:
        return <AgentDashboard setView={setCurrentView} />;
      case ViewState.AGENT_SUBSCRIPTION:
        return <AgentSubscription setView={setCurrentView} />;
      case ViewState.AGENT_COMMISSION:
        return <AgentCommission setView={setCurrentView} />;
      case ViewState.AGENT_COMMUNICATION:
        return <AgentCommunication setView={setCurrentView} />;

      // Operator
      case ViewState.OPERATOR_DASHBOARD:
        return <OperatorDashboard setView={setCurrentView} />;
      case ViewState.OPERATOR_ASSIGNMENT:
        return <OperatorAssignment setView={setCurrentView} />;
      case ViewState.OPERATOR_MEDIATION:
        return <OperatorMediation setView={setCurrentView} />;
        
      default:
        return <HomeView setView={setCurrentView} />;
    }
  };

  return (
    <div className="bg-ethio-light min-h-screen font-sans text-gray-900 selection:bg-ethio-blue/30">
      <main className="w-full mx-auto max-w-md bg-white shadow-2xl min-h-screen overflow-hidden relative transition-all duration-300">
        {renderView()}
        
        {/* Navigation - Hidden on Auth and Request Intake */}
        {currentView !== ViewState.AUTH && currentView !== ViewState.NEW_REQUEST && (
          <Navigation 
            currentView={currentView} 
            setView={setCurrentView} 
            userRole={userRole} 
          />
        )}
      </main>
    </div>
  );
};

export default App;