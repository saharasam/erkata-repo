import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Lock, ShieldCheck, MessageSquare, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isFromRequest = location.state?.fromRequest;

  useEffect(() => {
    const draft = localStorage.getItem('erkata_draft_request');
    if (draft) setHasDraft(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(identifier, password);
    
    if (result.success) {
      if (hasDraft) {
        localStorage.removeItem('erkata_draft_request');
        localStorage.removeItem('erkata_request_intent');
      }
      // Navigation is handled by the user effect
    } else {
      setError(result.error || 'Invalid credentials. Check your email and password.');
    }
  };

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === UserRole.AGENT) navigate('/agent-dashboard');
      else if (role === UserRole.OPERATOR) navigate('/operator-dashboard');
      else if (role === UserRole.ADMIN) navigate('/admin-dashboard');
      else if (role === UserRole.SUPER_ADMIN) navigate('/superadmin');
      else if (role === UserRole.CUSTOMER) navigate('/customer');
    }
  }, [user, navigate]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-screen flex bg-erkata-surface font-sans text-erkata-text overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden lg:block w-1/2 h-full p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-full h-full overflow-hidden rounded-[2.5rem]"
        >
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1769&q=80"
            alt="Office"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 p-16 text-white"
          >
            <h2 className="text-5xl font-medium mb-6 leading-tight">Welcome Back.</h2>
            <p className="text-lg text-gray-200 max-w-md font-light leading-relaxed">
              Access your dashboard to manage requests, zones, and mediation tasks securely.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col h-full overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="max-w-md mx-auto w-full"
          >
            <motion.div variants={itemVariants}>
              <Link to="/" className="inline-flex items-center text-gray-400 hover:text-erkata-primary mb-12 transition-colors font-medium text-sm tracking-wide uppercase">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-12">
              <h1 className="text-4xl md:text-5xl font-medium mb-3 text-erkata-text">Sign In</h1>
              <p className="text-gray-500 text-lg">
                {isFromRequest ? 'Complete your account to finish submitting.' : 'Enter your details to proceed.'}
              </p>
            </motion.div>

            <AnimatePresence>
              {hasDraft && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-erkata-accent/10 border border-erkata-accent/20 rounded-[2rem] flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-erkata-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Draft Request Found</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Log in to automatically submit your pending request and connect with local agents.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-bold text-blue-900 mb-2">Demo Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Agent:</strong> 0911000001 / agent123</p>
                <p><strong>Operator:</strong> 0911000002 / operator123</p>
                <p><strong>Customer:</strong> 0911000003 / customer123</p>
                <p><strong>Admin:</strong> admin@erkata.com / admin123</p>
                <p><strong>Super Admin:</strong> superadmin@erkata.com / superadmin123</p>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800 placeholder-gray-400"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-erkata-primary transition-colors" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center ml-6 mr-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                  <Link to="#" className="text-xs font-bold text-erkata-primary hover:text-black transition-colors uppercase tracking-wider">Forgot?</Link>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-8 py-5 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800 placeholder-gray-400"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-erkata-primary transition-colors" />
                </div>
              </motion.div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                className="w-full bg-erkata-primary text-white font-medium text-lg py-5 rounded-full shadow-xl shadow-erkata-primary/20 hover:bg-black hover:shadow-2xl transition-all duration-300 mt-4"
              >
                Access Account
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="mt-12 text-center pb-8">
              <p className="text-gray-500">Don't have an account?</p>
              <Link to="/register" className="inline-block mt-2 text-erkata-text font-bold border-b-2 border-erkata-accent hover:text-erkata-accent transition-colors pb-1">
                Create an account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;