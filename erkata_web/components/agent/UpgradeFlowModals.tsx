import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Upload, CheckCircle2, X, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface UpgradeFlowModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: string;
  price: string;
  onSuccess: () => void;
}

export const UpgradeFlowModals: React.FC<UpgradeFlowModalsProps> = ({
  isOpen,
  onClose,
  targetTier,
  price,
  onSuccess
}) => {
  const [step, setStep] = useState<'details' | 'upload' | 'success'>('details');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && step === 'details') {
      fetchBankDetails();
    }
  }, [isOpen, step]);

  const fetchBankDetails = async () => {
    try {
      const response = await api.get('/upgrades/bank-details');
      setBankDetails(response.data);
    } catch (err) {
      setError('Failed to load bank details. Please try again.');
    }
  };

  const handleSentClick = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/upgrades/request', { targetTier });
      setRequestId(response.data.id);
      setStep('upload');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validation: 10MB Limit
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('The file is too large. Maximum size is 10MB.');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file || !requestId) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      // Read file as Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      
      await api.patch(`/upgrades/${requestId}/proof`, { proofUrl: base64Data });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalClose = () => {
    onSuccess();
    onClose();
    // Reset state after a delay to avoid flicker during exit animation
    setTimeout(() => {
      setStep('details');
      setRequestId(null);
      setFile(null);
      setPreview(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        >
          {/* Progress Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                step === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {step === 'details' && <Landmark className="w-5 h-5" />}
                {step === 'upload' && <Upload className="w-5 h-5" />}
                {step === 'success' && <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">
                  {step === 'details' && 'Payment Details'}
                  {step === 'upload' && 'Upload Proof'}
                  {step === 'success' && 'Request Submitted'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {step === 'details' && 'Step 1 of 2'}
                  {step === 'upload' && 'Step 2 of 2'}
                  {step === 'success' && 'Final Step'}
                </p>
              </div>
            </div>
            
            {step !== 'success' && (
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-8">
            {step === 'details' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-8">
                    To upgrade to <span className="font-bold text-slate-800">{targetTier}</span>, please transfer <span className="font-bold text-indigo-600">{price} AGLP</span> value to the following bank account:
                  
                  {bankDetails ? (
                    <div className="bg-indigo-50/50 rounded-3xl p-6 border-2 border-indigo-100/50 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Bank Name</p>
                        <p className="text-lg font-black text-indigo-900">{bankDetails.bankName}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Account Number</p>
                          <p className="text-2xl font-black text-indigo-900 tracking-tighter">{bankDetails.accountNumber}</p>
                        </div>
                        <button className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">COPY</button>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Account Holder</p>
                        <p className="font-bold text-indigo-800">{bankDetails.accountHolder}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSentClick}
                  disabled={isSubmitting || !bankDetails}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Initializing...' : "I've Sent the Money"}
                </button>
              </motion.div>
            )}

            {step === 'upload' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Great! Now please upload a screenshot of your transaction receipt as proof of payment.
                </p>

                <div className="mb-8">
                  <input
                    type="file"
                    id="proof-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="proof-upload"
                    className={`block w-full border-2 border-dashed rounded-[2rem] p-8 transition-all cursor-pointer text-center ${
                      preview ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {preview ? (
                      <div className="relative group">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-2xl shadow-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                          <p className="text-white text-xs font-bold">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Click to upload screenshot</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black tracking-tight hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={isSubmitting || !file}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Uploading...' : 'Confirm Upgrade'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Request Submitted!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                  Our Financial Operator is reviewing your payment. You'll be notified once your <span className="font-bold text-slate-800">{targetTier}</span> tier is active.
                </p>
                
                <button
                  onClick={handleFinalClose}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                >
                  Got it, thanks!
                </button>
              </motion.div>
            )}
          </div>
          
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 -mr-16 -mt-16 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10 -ml-16 -mb-16 opacity-50" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
