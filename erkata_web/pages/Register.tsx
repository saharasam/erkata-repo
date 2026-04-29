import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, CheckCircle2, ShieldCheck, Loader2, Shield, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

type Role = 'customer' | 'agent' | 'operator' | 'admin' | 'super_admin';

interface RegisterProps {
  initialRole?: Role;
}

const Register: React.FC<RegisterProps> = ({ initialRole = 'customer' }) => {
  const { signup } = useAuth();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<Role>(initialRole);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: searchParams.get('ref') || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Invite State
  const inviteToken = searchParams.get('token');
  const [isVerifyingInvite, setIsVerifyingInvite] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState('');

  const navigate = useNavigate();
  const isFromRequest = (window.history.state as any)?.fromRequest as boolean | undefined;

  useEffect(() => {
    if (inviteToken) {
      setIsVerifyingInvite(true);
      api.get(`/auth/invite/${inviteToken}`)
        .then(res => {
          const { email, fullName, phone, role: invitedRole } = res.data;
          const [first, ...rest] = fullName.split(' ');
          setFormData(prev => ({
            ...prev,
            email: email || '',
            firstName: first || '',
            lastName: rest.join(' ') || '',
            phone: phone || '',
          }));
          setRole(invitedRole);
        })
        .catch(err => {
          setInviteError(err.response?.data?.message || 'Invalid or expired invite token.');
        })
        .finally(() => setIsVerifyingInvite(false));
    } else if (isFromRequest) {
      setRole('customer');
    }
  }, [inviteToken, isFromRequest]);

  const handleRegister = async () => {
    setError('');
    setIsSubmitting(true);
    if (!formData.phone) {
      setError('Phone number is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await signup({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role,
        inviteToken: inviteToken || undefined,
        referralCode: role === 'agent' ? (formData.referralCode || undefined) : undefined,
      });
      
      // Auto-login is now performed by the signup method in AuthProvider.
      // We check for a pending request draft to redirect back to intake if needed.
      const pendingRequest = localStorage.getItem('erkata_pending_request');
      
      if (pendingRequest && role === 'customer') {
        navigate('/submit-request');
      } else {
        // Default Role-based navigation
        if (role === 'agent') navigate('/agent-dashboard');
        else if (role === 'operator') navigate('/operator-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'super_admin') navigate('/superadmin');
        else navigate('/customer');
      }
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const isExclusive = role === 'admin' || role === 'operator' || role === 'super_admin';

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
          {isExclusive && inviteToken ? (
             <img
               src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
               alt="Executive Board"
               className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
             />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
              alt="Handshake"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 p-16 text-white"
          >
            {isExclusive && inviteToken ? (
               <>
                 <h2 className={`text-5xl font-medium mb-6 leading-tight ${role === 'admin' ? 'text-indigo-300' : 'text-amber-300'}`}>Exclusive Access.</h2>
                 <p className="text-lg text-gray-200 max-w-md font-light leading-relaxed">
                   You have been exclusively selected to oversee operations and mediate value on the Erkata Platform.
                 </p>
               </>
            ) : (
               <>
                 <h2 className="text-5xl font-medium mb-6 leading-tight">Join the Network.</h2>
                 <p className="text-lg text-gray-200 max-w-md font-light leading-relaxed">
                   Create an account to start mediating, requesting, or fulfilling services in your zone.
                 </p>
               </>
            )}
           
          </motion.div>
        </motion.div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col h-full overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative">
          
          <AnimatePresence>
            {isVerifyingInvite && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                 <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                 <h3 className="text-xl font-bold text-slate-800">Validating Invitation...</h3>
                 <p className="text-slate-500 mt-2">Checking secure token credentials.</p>
              </motion.div>
            )}
          </AnimatePresence>

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
              <h1 className="text-4xl md:text-5xl font-medium mb-3 text-erkata-text">
                 {isExclusive && inviteToken ? 'Accept Invitation' : 'Get Started'}
              </h1>
              <p className="text-gray-500 text-lg">
                {inviteError 
                  ? 'There is a problem with your invitation.'
                  : isFromRequest 
                   ? 'Create an account to finish your request.' 
                   : inviteToken 
                     ? `Please complete your profile configuration.` 
                     : 'Select your role to begin.'}
              </p>
            </motion.div>

            {inviteError ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center gap-4"
               >
                 <ShieldCheck className="w-12 h-12 text-red-400" />
                 <div>
                   <h3 className="text-lg font-bold text-red-800">Invalid Link</h3>
                   <p className="text-red-700 font-medium text-sm mt-1">{inviteError}</p>
                 </div>
                 <Link to="/login" className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold mt-4 shadow-sm hover:bg-red-700 transition-colors">
                    Go to Login
                 </Link>
               </motion.div>
            ) : (
                <>
                  {inviteToken && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${role === 'admin' ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}
                    >
                      <ShieldCheck className={`w-6 h-6 ${role === 'admin' ? 'text-indigo-600' : 'text-amber-600'}`} />
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${role === 'admin' ? 'text-indigo-900' : 'text-amber-900'}`}>
                           Exclusive {role.toUpperCase()} Invite
                        </p>
                        <p className={`text-[11px] font-medium mt-0.5 ${role === 'admin' ? 'text-indigo-700' : 'text-amber-700'}`}>
                           This link grants operational authority for {formData.email || 'this account'}.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Role indicator */}
                  <div className="flex justify-center mb-10">
                    <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex">
                      <span className="px-8 py-2.5 rounded-xl text-sm font-bold bg-white text-erkata-primary shadow-sm border border-gray-100 flex items-center gap-2 capitalize">
                        {role === 'customer' && <User className="w-4 h-4" />}
                        {role === 'agent' && <Shield className="w-4 h-4" />}
                        {role === 'operator' && <UserCheck className="w-4 h-4" />}
                        {role === 'admin' && <Lock className="w-4 h-4" />}
                        {role} Account
                      </span>
                    </div>
                  </div>

                  <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">First Name</label>
                        <input
                          type="text"
                          placeholder="Abebe"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          readOnly={!!inviteToken}
                          required
                          className={`w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-gray-800 ${inviteToken ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Last Name</label>
                        <input
                          type="text"
                          placeholder="Kebede"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          readOnly={!!inviteToken}
                          required
                          className={`w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-gray-800 ${inviteToken ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
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
                          readOnly={!!inviteToken}
                          className={`w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800 ${inviteToken ? 'bg-slate-50 opacity-70 cursor-not-allowed select-none' : ''}`}
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Phone Number</label>
                      <div className="relative group">
                        <input
                          type="tel"
                          placeholder="+251-911-00-11-22"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          required
                          readOnly={!!inviteToken}
                          className={`w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800 ${inviteToken ? 'bg-slate-50 opacity-70 cursor-not-allowed select-none' : ''}`}
                        />
                        <Phone className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
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

                    {role === 'agent' && !inviteToken && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-6">Referral Code (Optional)</label>
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="AGENT123"
                            value={formData.referralCode}
                            onChange={(e) => updateField('referralCode', e.target.value)}
                            className="w-full px-8 py-4 bg-white rounded-full border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all pl-14 text-gray-800 uppercase"
                          />
                          <User className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2 group-focus-within:text-black transition-colors" />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full text-white font-medium text-lg py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 mt-6 flex items-center justify-center gap-2 ${
                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 
                        inviteToken && role === 'admin' ? 'bg-indigo-600 shadow-indigo-500/30' : 
                        inviteToken && role === 'operator' ? 'bg-amber-600 shadow-amber-500/30' : 
                        (role === 'agent' ? 'bg-erkata-secondary' : role === 'operator' ? 'bg-amber-600' : 'bg-black')
                      }`}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                      ) : (
                        role === 'customer' ? 'Create Account' : 
                        inviteToken ? 'Activate Profile' : 'Submit Application'
                      )}
                    </button>
                  </form>

                  <motion.div variants={itemVariants} className="mt-10 text-center pb-8">
                    <p className="text-gray-500">Already have an account?</p>
                    <Link to="/login" className="inline-block mt-2 text-erkata-text font-bold border-b-2 border-erkata-primary hover:text-erkata-primary transition-colors pb-1">
                      Sign In
                    </Link>
                  </motion.div>
                </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;