import React, { useState } from 'react';
import { UserRole } from '../types';
import { motion } from 'framer-motion';
import { ArrowRight, UserCircle, Briefcase } from 'lucide-react';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);

  return (
    <div className="min-h-screen bg-ethio-light flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-16 bg-ethio-blue rounded-full flex items-center justify-center shadow-lg shadow-ethio-blue/30 text-white text-2xl font-bold">
          A
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ethio-charcoal">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access AddisHome Services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-2xl border border-gray-100">
          <div className="space-y-6">
            
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole(UserRole.CUSTOMER)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    selectedRole === UserRole.CUSTOMER 
                      ? 'border-ethio-blue bg-blue-50 text-ethio-blue' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <UserCircle size={28} className="mb-2" />
                  <span className="text-sm font-bold">Customer</span>
                </button>
                <button
                  onClick={() => setSelectedRole(UserRole.AGENT)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    selectedRole === UserRole.AGENT 
                      ? 'border-ethio-blue bg-blue-50 text-ethio-blue' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Briefcase size={28} className="mb-2" />
                  <span className="text-sm font-bold">Agent</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ethio-blue focus:border-ethio-blue sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ethio-blue focus:border-ethio-blue sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLogin(selectedRole)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-ethio-blue hover:bg-[#1e425e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethio-blue"
            >
              {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} className="ml-2 mt-0.5" />
            </motion.button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to AddisHome?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {isLogin ? 'Create an Account' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;