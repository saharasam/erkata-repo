import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './utils/constants';
import { ModalProvider } from './contexts/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentDashboard from './pages/AgentDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import RequestIntake from './pages/RequestIntake';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit-request" element={<RequestIntake />} />
          
          {/* Protected Routes with Role-Based Access Control */}
          <Route 
            path="/agent-dashboard" 
            element={
              <ProtectedRoute allowedRole={UserRole.AGENT}>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operator-dashboard" 
            element={
              <ProtectedRoute allowedRole={UserRole.OPERATOR}>
                <OperatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRole={UserRole.ADMIN}>
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/superadmin" 
            element={
              <ProtectedRoute allowedRole={UserRole.SUPER_ADMIN}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute allowedRole={UserRole.CUSTOMER}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/become-agent" element={<Register initialRole="agent" />} />  
          <Route path="/become-operator" element={<Register initialRole="operator" />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <HashRouter>
          <AnimatedRoutes />
        </HashRouter>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;