import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/constants';
import RequestIntakeFlow from '../components/RequestIntakeFlow';

const RequestIntake: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Block staff members from accessing request intake
  useEffect(() => {
    if (isAuthenticated && user && user.role !== UserRole.CUSTOMER) {
      // Redirect staff to their respective dashboards
      if (user.role === UserRole.AGENT) {
        navigate('/agent-dashboard', { replace: true });
      } else if (user.role === UserRole.OPERATOR) {
        navigate('/operator-dashboard', { replace: true });
      } else if (user.role === UserRole.ADMIN) {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === UserRole.SUPER_ADMIN) {
        navigate('/superadmin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = () => {
    navigate('/customer', { state: { requestSubmitted: true } });
  };

  return (
    <div className="min-h-screen bg-erkata-surface font-sans text-erkata-text">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-400 hover:text-erkata-primary mb-6 transition-colors font-medium text-sm tracking-wide uppercase"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4 tracking-tight">
              Begin your request. <br />
              <span className="text-erkata-secondary">
                We'll find the best match for you.
              </span>
            </h1>
          </motion.div>

          {/* Reusable Flow Component */}
          <RequestIntakeFlow onSuccess={handleSuccess} />

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RequestIntake;
