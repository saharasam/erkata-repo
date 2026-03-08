import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type ModalType = 'alert' | 'confirm';

interface ModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

interface ModalContextType {
  showAlert: (options: ModalOptions) => Promise<void>;
  showConfirm: (options: ModalOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('alert');
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [resolver, setResolver] = useState<((value: any) => void) | null>(null);

  const showAlert = (opts: ModalOptions): Promise<void> => {
    setModalType('alert');
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const showConfirm = (opts: ModalOptions): Promise<boolean> => {
    setModalType('confirm');
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver(result);
    }
  };

  const getIcon = () => {
    switch (options?.type) {
      case 'warning': return <AlertCircle className="w-8 h-8 text-orange-500" />;
      case 'error': return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
      default: return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (options?.type) {
      case 'warning': return 'bg-orange-50';
      case 'error': return 'bg-red-50';
      case 'success': return 'bg-emerald-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => handleClose(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 text-center">
                <div className={`w-16 h-16 ${getBgColor()} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  {getIcon()}
                </div>
                
                {options.title && <h3 className="text-xl font-bold text-slate-800 mb-2">{options.title}</h3>}
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  {options.message}
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleClose(true)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-colors shadow-lg active:scale-[0.98] ${
                      options.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                      options.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' :
                      'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20'
                    }`}
                  >
                    {options.confirmText || (modalType === 'confirm' ? 'Confirm' : 'OK')}
                  </button>
                  {modalType === 'confirm' && (
                    <button
                      onClick={() => handleClose(false)}
                      className="w-full py-4 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors active:scale-[0.98]"
                    >
                      {options.cancelText || 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
