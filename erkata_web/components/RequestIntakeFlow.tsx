import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  Tag, 
  DollarSign, 
  MapPin, 
  FileText, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

type RequestIntent = 'buy' | 'sell' | null;

interface RequestIntakeFlowProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

const RequestIntakeFlow: React.FC<RequestIntakeFlowProps> = ({ onSuccess, onCancel, embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const { showAlert } = useModal();
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<RequestIntent>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Property',
    budgetMin: '',
    budgetMax: '',
    kifleKetema: 'Bole',
    woreda: '',
    details: ''
  });

  const kifleKetemas = [
    'Bole', 'Yeka', 'Arada', 'Kirkos', 'Nifas Silk', 'Akaki Kality', 'Gullele', 'Addis Ketema', 'Kolfe Keranio', 'Lideta'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIntentSelection = (selectedIntent: RequestIntent) => {
    setIntent(selectedIntent);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        showAlert({
            title: 'Authentication Required',
            message: 'You need to be logged in to submit a request. Redirecting to registration...',
            type: 'info'
        });
        window.location.href = '/#/register?fromRequest=true';
        return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/requests', {
        category: formData.category,
        details: {
          title: formData.title,
          description: formData.details,
          budgetMin: parseFloat(formData.budgetMin) || undefined,
          budgetMax: parseFloat(formData.budgetMax) || undefined,
          intent: intent
        },
        locationZone: {
          kifleKetema: formData.kifleKetema,
          woreda: formData.woreda
        }
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      showAlert({
        title: 'Submission Failed',
        message: error.response?.data?.message || 'There was an error submitting your request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className={`${embedded ? '' : 'max-w-4xl mx-auto'}`}>
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${embedded ? 'p-2' : ''}`}
          >
            {/* Buying Card */}
            <button
              onClick={() => handleIntentSelection('buy')}
              className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:border-erkata-primary/20 transition-all text-left flex flex-col items-start"
            >
              <div className="w-16 h-16 bg-erkata-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-erkata-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">I want to Buy / Find</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Looking for a property, furniture, or specific services in Ethiopia? Let our agents find it for you.
              </p>
              <div className="mt-auto flex items-center text-erkata-primary font-bold group-hover:translate-x-2 transition-transform">
                Proceed <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </button>

            {/* Selling Card */}
            <button
              onClick={() => handleIntentSelection('sell')}
              className="group bg-slate-900 p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all text-left flex flex-col items-start"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">I want to Sell / List</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                Want to list your property or offer premium services through our mediated network? Start here.
              </p>
              <div className="mt-auto flex items-center text-erkata-accent font-bold group-hover:translate-x-2 transition-transform">
                Proceed <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`grid grid-cols-1 ${embedded ? '' : 'lg:grid-cols-3'} gap-12`}
          >
            {/* Form Column */}
            <div className={`${embedded ? 'w-full' : 'lg:col-span-2'}`}>
              <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col gap-6">
                
                {/* Badge showing selection */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full w-fit">
                    {intent === 'buy' ? <ShoppingBag className="w-4 h-4 text-erkata-primary" /> : <TrendingUp className="w-4 h-4 text-erkata-secondary" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {intent === 'buy' ? 'Buying / Finding' : 'Selling / Listing'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-bold text-erkata-primary hover:underline"
                  >
                    Change Goal
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">
                    {intent === 'buy' ? 'What are you looking for?' : 'What are you selling?'}
                  </label>
                  <div className="relative">
                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      type="text"
                      placeholder={intent === 'buy' ? "e.g. 3-bedroom apartment in Bole" : "e.g. Modern Villa in Old Airport"}
                      className="w-full px-8 py-4 bg-gray-50 rounded-full border-none outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-gray-800"
                    />
                    <Tag className="w-5 h-5 text-gray-300 absolute right-6 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <CustomSelect
                    label="Category"
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    options={[
                      { value: 'Property', label: 'Property' },
                      { value: 'Furniture', label: 'Furniture' },
                      { value: 'Service', label: 'Service' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />

                  {/* Budget / Price */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">
                      {intent === 'buy' ? 'Budget Max (ETB)' : 'Target Price (ETB)'}
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleChange}
                        type="number"
                        placeholder="e.g. 20000"
                        className="w-full px-8 py-4 bg-gray-50 rounded-full border-none outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-gray-800"
                      />
                      <DollarSign className="w-5 h-5 text-gray-300 absolute right-6 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Zone Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect
                        label="Kifle Ketema"
                        value={formData.kifleKetema}
                        onChange={(value) => setFormData(prev => ({ ...prev, kifleKetema: value }))}
                        options={kifleKetemas.map(k => ({ value: k, label: k }))}
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Woreda (Optional)</label>
                        <div className="relative">
                            <input
                            name="woreda"
                            value={formData.woreda}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g. 03"
                            className="w-full px-8 py-4 bg-gray-50 rounded-full border-none outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-gray-800"
                            />
                            <MapPin className="w-5 h-5 text-gray-300 absolute right-6 top-1/2 transform -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Detailed Description</label>
                  <div className="relative">
                    <textarea
                      required
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the details (e.g. specific features, conditions, timing...)"
                      className="w-full px-8 py-6 bg-gray-50 rounded-[2rem] border-none outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-gray-800 resize-none"
                    />
                    <FileText className="w-5 h-5 text-gray-300 absolute right-6 top-8" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {onCancel && (
                        <button 
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-5 rounded-full text-slate-500 text-lg font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`flex-[2] py-5 rounded-full text-white text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-3 ${
                            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-erkata-primary hover:bg-erkata-secondary shadow-erkata-primary/20'
                        }`}
                    >
                        {isSubmitting ? 'Processing...' : (isAuthenticated ? 'Submit Request' : 'Proceed to Submit')}
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                </div>
              </form>
            </div>

            {/* Sidebar Column */}
            {!embedded && (
                <div className="space-y-8">
                <motion.div 
                    {...fadeInUp}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl"
                >
                    <div className="w-12 h-12 bg-erkata-accent rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Privacy Guaranteed</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                    Your {intent === 'buy' ? 'search' : 'listing'} is private. Operators verify agents before they see your details.
                    </p>
                </motion.div>

                <motion.div 
                    {...fadeInUp}
                    transition={{ delay: 0.3 }}
                    className="bg-erkata-accent/10 border border-erkata-accent/20 p-8 rounded-[2rem]"
                >
                    <div className="w-12 h-12 bg-erkata-accent rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Rapid Matching</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                    Our zone-based structure ensures you connect with qualified agents in your specific area.
                    </p>
                </motion.div>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestIntakeFlow;
