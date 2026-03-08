import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { useAuth } from '../contexts/AuthContext';

type Role = 'customer' | 'agent' | 'operator';

interface RegisterProps {
  initialRole?: Role;
}
const Register: React.FC<RegisterProps> = ({ initialRole = 'customer' }) => {
  const [role, setRole] = useState<Role>(initialRole);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  const isFromRequest = (location.state as any)?.fromRequest;

  // Lock role to 'customer' if coming from request intake
  useEffect(() => {
    if (isFromRequest) {
      setRole('customer');
    }
  }, [isFromRequest]);

  const handleRegister = async () => {
    setError('');
    setIsSubmitting(true);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await signup({
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: role,
      });
      
      // Post-registration: Redirect to login
      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          role: role,
          message: 'Account created successfully. Please sign in.'
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
            alt="Handshake"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 p-16 text-white"
          >
            <h2 className="text-5xl font-medium mb-6 leading-tight">Join the Network.</h2>
            <p className="text-lg text-gray-200 max-w-md font-light leading-relaxed">
              Create an account to start mediating, requesting, or fulfilling services in your zone.
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
              <Link to="/" className="inline-flex items-center text-gray-400 hover:text-erkata-primary mb-10 transition-colors font-medium text-sm tracking-wide uppercase">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-10">
              <h1 className="text-4xl md:text-5xl font-medium mb-3 text-erkata-text">Get Started</h1>
              <p className="text-gray-500 text-lg">
                {isFromRequest ? 'Create an account to finish your request.' : 'Select your role to begin.'}
              </p>
            </motion.div>


            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {!isFromRequest && (
            <motion.div variants={itemVariants} className="flex bg-white p-2 rounded-full border border-gray-100 mb-10 shadow-sm relative z-10">
              <div className="absolute inset-0 p-2 pointer-events-none">
                 <motion.div 
                  layoutId="roleHighlight"
                  initial={false}
                  animate={{ 
                    x: role === 'customer' ? '0%' : role === 'agent' ? '100%' : '200%',
                    backgroundColor: role === 'customer' ? '#000000' : role === 'agent' ? '#FFBB00' : '#00A86B'
                  }}
                  className="h-full w-1/3 rounded-full shadow-lg"
                 />
              </div>
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 relative z-20 ${role === 'customer' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('agent')}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 relative z-20 ${role === 'agent' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Agent
              </button>
               <button
                type="button"
                onClick={() => setRole('operator')}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 relative z-20 ${role === 'operator' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Operator
              </button>
            </motion.div>
            )}

            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">First Name</label>
                   <input
                     type="text"
                     placeholder="Abebe"
                     value={formData.firstName}
                     onChange={(e) => updateField('firstName', e.target.value)}
                     required
                     className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-gray-800"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Last Name</label>
                   <input
                     type="text"
                     placeholder="Kebede"
                     value={formData.lastName}
                     onChange={(e) => updateField('lastName', e.target.value)}
                     required
                     className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-gray-800"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Confirm Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    required
                    className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleRegister}
                disabled={isSubmitting}
                className={`w-full text-white font-medium text-lg py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 mt-6 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : (role === 'agent' ? 'bg-erkata-secondary' : role === 'operator' ? 'bg-erkata-primary' : 'bg-black')}`}
              >
                {isSubmitting ? 'Submitting...' : (role === 'customer' ? 'Create Account' : 'Submit Application')}
              </button>
            </form>

            <motion.div variants={itemVariants} className="mt-10 text-center pb-8">
              <p className="text-gray-500">Already have an account?</p>
              <Link to="/login" className="inline-block mt-2 text-erkata-text font-bold border-b-2 border-erkata-primary hover:text-erkata-primary transition-colors pb-1">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;