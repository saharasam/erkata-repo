import React, { useState } from 'react';
import { ViewState } from '../types';
import { ArrowLeft, Lock, CreditCard, ShieldCheck, QrCode, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentViewProps {
  setView: (view: ViewState) => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({ setView }) => {
  const [method, setMethod] = useState<'telebirr' | 'chapa' | 'card'>('telebirr');
  
  return (
    <div className="min-h-screen bg-ethio-light">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => setView(ViewState.HOME)} className="text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center pr-8">
            <h1 className="text-lg font-bold text-gray-800">Secure Payment</h1>
        </div>
      </div>

      <div className="p-5 max-w-lg mx-auto pb-24">
        
        {/* Amount Card */}
        <div className="bg-ethio-charcoal text-white rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <p className="text-gray-300 text-sm mb-1">Total Amount Due</p>
          <h2 className="text-3xl font-bold tracking-tight">1,500.00 <span className="text-lg font-normal text-ethio-blue">ETB</span></h2>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
             <span className="text-gray-400">Service Fee (10%)</span>
             <span>150.00 ETB</span>
          </div>
        </div>

        {/* Payment Methods */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Select Method</h3>
        
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => setMethod('telebirr')}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${method === 'telebirr' ? 'border-ethio-blue bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-ethio-blue flex items-center justify-center mr-4">
                <Smartphone size={20} />
            </div>
            <div className="flex-1 text-left">
                <span className="block font-bold text-gray-800">Telebirr</span>
                <span className="text-xs text-gray-500">Mobile Wallet</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'telebirr' ? 'border-ethio-blue' : 'border-gray-300'}`}>
                {method === 'telebirr' && <div className="w-2.5 h-2.5 rounded-full bg-ethio-blue" />}
            </div>
          </button>

          <button 
            onClick={() => setMethod('chapa')}
            className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${method === 'chapa' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                <ShieldCheck size={20} />
            </div>
            <div className="flex-1 text-left">
                <span className="block font-bold text-gray-800">Chapa</span>
                <span className="text-xs text-gray-500">Local Cards / Bank Transfer</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'chapa' ? 'border-green-500' : 'border-gray-300'}`}>
                {method === 'chapa' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
            </div>
          </button>
        </div>

        {/* Dynamic Content based on method */}
        <motion.div 
            key={method}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
            {method === 'telebirr' && (
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <QrCode size={120} className="text-gray-800" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Scan to Pay</p>
                        <p className="text-xs text-gray-500 mt-1">Use your Telebirr SuperApp</p>
                    </div>
                </div>
            )}

            {method === 'chapa' && (
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                        <div className="relative">
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500" />
                            <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                            <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                            <input type="text" placeholder="123" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500" />
                        </div>
                     </div>
                </div>
            )}
        </motion.div>

        {/* Pay Button */}
        <button className="w-full mt-6 bg-ethio-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-ethio-blue/30 flex items-center justify-center gap-2 hover:bg-[#1e425e] transition-colors">
            <Lock size={18} />
            Pay 1,500.00 ETB
        </button>
        
        <div className="flex justify-center mt-4 items-center gap-2 text-gray-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Encrypted & Secure</span>
        </div>

      </div>
    </div>
  );
};

export default PaymentView;