import React, { useState, useEffect } from 'react';
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
  Home as HomeIcon,
  LayoutGrid,
  Hammer,
  CheckCircle,
  Bed,
  CreditCard,
  ChevronLeft,
  Globe
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../contexts/ModalContext';

type RequestIntent = 'buy' | 'sell' | null;
type RequestCategory = 'Home' | 'Furniture' | null;

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
  const [category, setCategory] = useState<RequestCategory>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const submissionLock = React.useRef(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('erkata_pending_request');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        const { intent: savedIntent, category: savedCategory, metadata: savedMetadata, area: savedArea, woreda: savedWoreda, budget: savedBudget, description: savedDetails, autoSubmit } = parsed;
        
        if (savedIntent) setIntent(savedIntent);
        if (savedCategory) setCategory(savedCategory);
        if (savedMetadata) setMetadata(savedMetadata);
        if (savedArea) setArea(savedArea);
        if (savedWoreda) setWoreda(savedWoreda);
        if (savedBudget) setBudget(savedBudget);
        if (savedDetails) setAdditionalDetails(savedDetails);

        // Advance to a reasonable step based on data
        if (savedCategory) {
           setStep(2); // Start at questions
        } else if (savedIntent) {
           setStep(1); // Start at category selection
        }
        
        console.log('[RequestIntake] Loaded draft from localStorage');

        // Automatic submission logic if redirected from login
        if (autoSubmit && isAuthenticated && !submissionLock.current) {
            console.log('[RequestIntake] Auto-submitting draft...');
            setIsAutoSubmitting(true);
            submissionLock.current = true;
            
            // Clear autoSubmit flag
            localStorage.setItem('erkata_pending_request', JSON.stringify({
                ...parsed,
                autoSubmit: false
            }));

            performSubmission(parsed);
        }
      } catch (e) {
        console.error('[RequestIntake] Failed to parse saved draft:', e);
      }
    }
  }, [isAuthenticated]);


  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [area, setArea] = useState('Bole');
  const [woreda, setWoreda] = useState('');
  const [budget, setBudget] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const kifleKetemas = [
    'Bole', 'Yeka', 'Arada', 'Kirkos', 'Nifas Silk', 'Akaki Kality', 'Gullele', 'Addis Ketema', 'Kolfe Keranio', 'Lideta'
  ];

  // Steps definition for Home
  const homeSteps = [
    { id: 'intent', title: 'Intent' }, // step 0
    { id: 'category', title: 'Category' }, // step 1
    { id: 'construction', title: 'Status' }, // step 2
    { id: 'bedrooms', title: 'Bedrooms' }, // step 3
    { id: 'loan', title: 'Financial' }, // step 4
    { id: 'area', title: 'Location' }, // step 5
    { id: 'budget', title: 'Budget' }, // step 6
    { id: 'additional', title: 'Details' } // step 7
  ];

  // Steps definition for Furniture
  const furnitureSteps = [
    { id: 'intent', title: 'Intent' }, // step 0
    { id: 'category', title: 'Category' }, // step 1
    { id: 'customization', title: 'Custom' }, // step 2
    { id: 'room', title: 'Room' }, // step 3
    { id: 'payment', title: 'Payment' }, // step 4
    { id: 'delivery', title: 'Delivery' }, // step 5
    { id: 'budget', title: 'Budget' }, // step 6
    { id: 'additional', title: 'Details' } // step 7
  ];

  const currentSteps = category === 'Furniture' ? furnitureSteps : homeSteps;
  const isLastStep = step === currentSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const updateMetadata = (key: string, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
    handleNext();
  };

  const performSubmission = async (finalData: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/requests', {
        category: finalData.category,
        type: finalData.category === 'Home' ? 'real_estate' : 'furniture',
        details: {
          title: finalData.title,
          description: finalData.description,
          budgetMax: parseFloat(finalData.budget) || undefined,
        },
        metadata: finalData.metadata,
        locationZone: {
          kifleKetema: finalData.area,
          woreda: finalData.woreda
        }
      });

      localStorage.removeItem('erkata_pending_request');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setIsAutoSubmitting(false);
      submissionLock.current = false;
      showAlert({
        title: 'Submission Failed',
        message: error.response?.data?.message || 'There was an error. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const finalData = {
      category,
      intent,
      area,
      woreda,
      budget,
      metadata,
      description: additionalDetails,
      title: category === 'Home' 
        ? `${metadata.bedrooms || ''} Bedroom ${category} in ${area}`
        : `Furniture for ${metadata.targetRoom || 'Room'}`
    };

    if (!isAuthenticated) {
      localStorage.setItem('erkata_pending_request', JSON.stringify({
        ...finalData,
        autoSubmit: true,
        timestamp: new Date().getTime()
      }));
      showAlert({
        title: 'Save your progress',
        message: 'You need to be logged in to submit. Redirecting to register...',
        type: 'info'
      });
      setTimeout(() => { window.location.href = '/#/register?fromRequest=true'; }, 500);
      return;
    }

    if (submissionLock.current) return;
    submissionLock.current = true;
    await performSubmission(finalData);
  };

  // UI Selection Button
  const SelectionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    onClick, 
    selected = false,
    dark = false 
  }: any) => (
    <button
      onClick={onClick}
      className={`group w-full p-8 rounded-[2.5rem] transition-all text-left flex flex-col items-start border-2 ${
        selected 
          ? 'border-erkata-primary bg-erkata-primary/5 shadow-xl' 
          : dark 
            ? 'bg-slate-900 border-transparent hover:border-white/10 shadow-lg' 
            : 'bg-white border-gray-100 hover:border-erkata-primary/20 shadow-xl'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
        dark ? 'bg-white/10' : 'bg-erkata-primary/10'
      }`}>
        <Icon className={`w-7 h-7 ${dark ? 'text-white' : 'text-erkata-primary'}`} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed mb-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      <div className={`mt-auto flex items-center font-bold text-sm transition-transform group-hover:translate-x-1 ${
        dark ? 'text-erkata-accent' : 'text-erkata-primary'
      }`}>
        Select <ChevronRight className="ml-1 w-4 h-4" />
      </div>
    </button>
  );

  return (
    <div className={`${embedded ? '' : 'max-w-4xl mx-auto'} relative min-h-[500px]`}>
      <AnimatePresence>
        {isAutoSubmitting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-x-[-20px] inset-y-[-20px] z-[100] bg-white/95 backdrop-blur-2xl rounded-[3rem] flex flex-col items-center justify-center text-center p-12 shadow-2xl"
          >
            <div className="w-24 h-24 border-[6px] border-erkata-primary/10 border-t-erkata-primary rounded-full animate-spin mb-10"></div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Finalizing</h2>
            <p className="text-gray-600 text-xl max-w-lg leading-relaxed font-medium">
              We're automatically submitting your details. One moment while we connect you to our agent network...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      {step > 0 && (
        <div className="mb-12 flex items-center gap-4">
          <button onClick={handleBack} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / (currentSteps.length - 1)) * 100}%` }}
              className="h-full bg-erkata-primary"
            />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step {step} of {currentSteps.length - 1}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 0: INTENT */}
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <SelectionCard 
              title="I want to Buy / Find"
              description="Looking for property or items? We'll find them for you."
              icon={ShoppingBag}
              onClick={() => { setIntent('buy'); setStep(1); }}
            />
            <SelectionCard 
              title="I want to Sell / List"
              description="Want to list your assets? Start here."
              icon={TrendingUp}
              dark
              onClick={() => { setIntent('sell'); setStep(1); }}
            />
          </motion.div>
        )}

        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <SelectionCard 
              title="Home / Real Estate"
              description="Houses, apartments, lands, or villas."
              icon={HomeIcon}
              onClick={() => { setCategory('Home'); setStep(2); }}
            />
            <SelectionCard 
              title="Furniture"
              description="Sofa sets, beds, office furniture, etc."
              icon={LayoutGrid}
              onClick={() => { setCategory('Furniture'); setStep(2); }}
            />
          </motion.div>
        )}

        {/* --- HOME PATH QUESTIONS --- */}
        {category === 'Home' && (
          <>
            {step === 2 && (
              <motion.div key="h2" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">Current status of the house?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                   <SelectionCard title="Under Construction" icon={Hammer} onClick={() => updateMetadata('constructionStatus', 'Under Construction')} />
                   <SelectionCard title="Completed" icon={CheckCircle} onClick={() => updateMetadata('constructionStatus', 'Completed')} />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="h3" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">Number of bedrooms?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                   {['Studio', '1', '2', '3', '4+', 'Penthouse'].map(num => (
                     <button key={num} onClick={() => updateMetadata('bedrooms', num)} className="py-6 rounded-3xl border-2 border-gray-100 hover:border-erkata-primary hover:bg-erkata-primary/5 font-bold transition-all flex flex-col items-center gap-2">
                       <Bed className="w-6 h-6 text-gray-400" />
                       {num === 'Penthouse' ? 'Penthouse' : `${num} Bedroom`}
                     </button>
                   ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="h4" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">Do you require a bank loan?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                   <SelectionCard title="Yes, Required" icon={CreditCard} onClick={() => updateMetadata('bankLoan', 'Yes')} />
                   <SelectionCard title="No, Cash / Other" icon={DollarSign} onClick={() => updateMetadata('bankLoan', 'No')} />
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* --- FURNITURE PATH QUESTIONS --- */}
        {category === 'Furniture' && (
          <>
            {step === 2 && (
              <motion.div key="f2" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">Preference for manufacturing?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                   <SelectionCard title="Custom-made" icon={Hammer} onClick={() => updateMetadata('customization', 'Custom-made')} />
                   <SelectionCard title="Ready-made" icon={ShoppingBag} onClick={() => updateMetadata('customization', 'Ready-made')} />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="f3" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">For which room?</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                   {['Living room', 'Bedroom', 'Office', 'Kitchen'].map(room => (
                     <button key={room} onClick={() => updateMetadata('targetRoom', room)} className="py-8 rounded-3xl border-2 border-gray-100 hover:border-erkata-primary hover:bg-erkata-primary/5 font-bold transition-all">
                       {room}
                     </button>
                   ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="f4" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">Do you require a payment plan?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <SelectionCard title="Yes, Installments" icon={CreditCard} onClick={() => updateMetadata('paymentPlan', 'Yes')} />
                  <SelectionCard title="No, Upfront" icon={DollarSign} onClick={() => updateMetadata('paymentPlan', 'No')} />
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* COMMON FINAL STEPS: LOCATION, BUDGET, ADDITIONAL */}
        {( (category === 'Home' && step >= 5) || (category === 'Furniture' && step >= 5) ) && (
          <>
            {/* AREA STEP */}
            {((category === 'Home' && step === 5) || (category === 'Furniture' && step === 5)) && (
              <motion.div key="loc" className="flex flex-col items-center text-center max-w-2xl mx-auto gap-8">
                <h2 className="text-3xl font-bold text-slate-900">{category === 'Home' ? 'Preferred Location?' : 'Where should we deliver?'}</h2>
                <div className="w-full space-y-6">
                  <CustomSelect 
                    label="Kifle Ketema"
                    value={area}
                    onChange={(val) => setArea(val)}
                    options={kifleKetemas.map(k => ({ value: k, label: k }))}
                  />
                  <CustomSelect 
                    label="Woreda / Specific Spot"
                    value={woreda === 'Others' || !['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04', 'Woreda 05'].includes(woreda) && woreda !== '' ? 'Others' : woreda}
                    onChange={(val) => {
                      if (val === 'Others') {
                        setWoreda('Others');
                      } else {
                        setWoreda(val);
                      }
                    }}
                    options={[
                      { value: 'Woreda 01', label: 'Woreda 01' },
                      { value: 'Woreda 02', label: 'Woreda 02' },
                      { value: 'Woreda 03', label: 'Woreda 03' },
                      { value: 'Woreda 04', label: 'Woreda 04' },
                      { value: 'Woreda 05', label: 'Woreda 05' },
                      { value: 'Others', label: 'Others' }
                    ]}
                    placeholder="Select Woreda"
                  />
                  
                  <AnimatePresence>
                    {(woreda === 'Others' || (!['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04', 'Woreda 05'].includes(woreda) && woreda !== '')) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 text-left"
                      >
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Specify Other Location</label>
                        <input 
                          autoFocus
                          value={woreda === 'Others' ? '' : woreda}
                          onChange={(e) => setWoreda(e.target.value)}
                          placeholder="e.g. Old Airport, Near Bole bulbula"
                          className="w-full px-8 py-4 bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-black/5"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button onClick={handleNext} className="w-full py-5 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-black transition-all">
                    Continue to Budget
                  </button>
                </div>
              </motion.div>
            )}

            {/* BUDGET STEP */}
            {((category === 'Home' && step === 6) || (category === 'Furniture' && step === 6)) && (
              <motion.div key="bud" className="flex flex-col items-center text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-slate-900">What is your planned budget? (ETB)</h2>
                <div className="w-full">
                  <div className="relative mb-10">
                    <input 
                      autoFocus
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 5,000,000"
                      className="w-full text-4xl font-bold px-4 py-6 border-b-4 border-gray-100 outline-none focus:border-erkata-primary transition-colors text-center"
                    />
                    <DollarSign className="w-8 h-8 text-gray-200 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                  <button onClick={handleNext} className="w-full py-5 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-black transition-all">
                    Last Step: Additional Info
                  </button>
                </div>
              </motion.div>
            )}

            {/* ADDITIONAL INFO STEP */}
            {((category === 'Home' && step === 7) || (category === 'Furniture' && step === 7)) && (
              <motion.div key="fin" className="flex flex-col items-center text-center max-w-2xl mx-auto w-full">
                <h2 className="text-3xl font-bold mb-8 text-slate-900">Any additional requirements?</h2>
                <div className="w-full space-y-8">
                  <textarea 
                    autoFocus
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={5}
                    placeholder={category === 'Home' ? "e.g. Specific garden size, Parking needs, etc." : "e.g. Material preferences, color codes, style reference..."}
                    className="w-full px-8 py-8 bg-gray-50 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-black/5 text-lg"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    onClick={handleNext}
                    className={`w-full py-6 rounded-full text-white text-xl font-bold shadow-2xl transition-all flex items-center justify-center gap-3 ${
                      isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-erkata-primary hover:bg-erkata-secondary'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Finish & Submit Request'}
                    <Tag className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Floating Verification Indicator */}
      {!embedded && (
        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-erkata-primary" />
             <span className="text-sm font-medium text-gray-600">Verified Agents Only</span>
          </div>
          <div className="flex items-center gap-3">
             <Zap className="w-6 h-6 text-erkata-accent" />
             <span className="text-sm font-medium text-gray-600">Average Match Time: 2 Hours</span>
          </div>
          <div className="flex items-center gap-3">
             <Globe className="w-6 h-6 text-blue-500" />
             <span className="text-sm font-medium text-gray-600">Nationwide Coverage</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestIntakeFlow;

