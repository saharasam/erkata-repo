import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../utils/constants';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case UserRole.SUPER_ADMIN: return '/superadmin';
      case UserRole.ADMIN: return '/admin-dashboard';
      case UserRole.OPERATOR: return '/operator-dashboard';
      case UserRole.AGENT: return '/agent-dashboard';
      case UserRole.CUSTOMER: return '/customer';
      default: return '/login';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = isAuthenticated 
    ? [] 
    : [
        { name: 'Login', path: '/login' },
        { name: 'Become an Agent', path: '/become-agent' },
      ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-white/5 backdrop-blur-sm py-6'}`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <Link to="/" className="text-2xl font-bold text-white tracking-wide uppercase leading-none">
              Erkata
            </Link>
            <span className="text-[10px] text-gray-300 tracking-wider font-light mt-1">
              Trusted Mediation Platform
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={link.path} className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  {link.name}
                </Link>
              </motion.div>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Link 
                    to={getDashboardPath()} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </motion.div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  to="/become-operator" 
                  className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95"
                >
                  Become an Operator
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden bg-black/95 fixed inset-0 z-50 flex flex-col justify-center items-center space-y-8"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white p-2">
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white">Home</Link>
            </motion.div>

            {isAuthenticated ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white">Dashboard</Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button onClick={handleLogout} className="text-2xl font-medium text-red-400">Logout</button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white">Login</Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/become-agent" onClick={() => setIsOpen(false)} className="text-2xl font-medium text-white">Become an Agent</Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link to="/become-operator" onClick={() => setIsOpen(false)} className="px-8 py-3 bg-white text-black text-xl font-bold rounded-full">Become an Operator</Link>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;