import React, { useState } from 'react';
import { ViewState, RequestType } from '../types';
import { KIFLE_KETEMAS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Sofa, Check, ChevronRight, Upload, Calendar, Clock, Plus, Minus, MapPin, Building, Bed, Briefcase, Lamp } from 'lucide-react';

interface RequestIntakeProps {
  setView: (view: ViewState) => void;
}

const RequestIntake: React.FC<RequestIntakeProps> = ({ setView }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '' as RequestType | '',
    // Furniture Specifics
    furnitureContext: 'Home', // Main Category: Home vs Office
    furnitureCategories: [] as string[], // Sub Categories (Multiple)
    quantity: 1,
    condition: 'New',
    // Property Specifics
    propertyType: 'Apartment',
    bedrooms: 1,
    // Location
    kifleKetema: '',
    wereda: '',
    address: '',
    // Details
    budgetMin: 5000,
    budgetMax: 50000,
    urgency: 'Standard',
    deliveryDate: '',
    notes: '',
    attachments: 0
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else setView(ViewState.TRACKING);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else setView(ViewState.HOME);
  };

  const getWeredas = () => {
    return KIFLE_KETEMAS.find(k => k.value === formData.kifleKetema)?.weredas || [];
  };

  // Configuration for Furniture Categories
  const furnitureContexts = ['Home', 'Office'];
  
  const furnitureSubCategories: Record<string, string[]> = {
    'Home': ['Sofa', 'Bed', 'Dining Table', 'Coffee Table', 'Chair', 'Wardrobe', 'TV Stand'],
    'Office': ['Office Desk', 'Office Chair', 'Conference Table', 'Filing Cabinet', 'Bookshelf', 'Reception Desk', 'Workstation']
  };

  const conditions = ['New', 'Used', 'Refurbished', 'Custom'];
  const propertyTypes = ['Apartment', 'Condominium', 'House', 'Villa', 'Office', 'Land'];
  const urgencyOptions = ['Standard', 'Urgent'];

  const getTitle = () => {
    if (step === 1) return 'New Request';
    if (step === 2) return `${formData.type} Details`;
    if (step === 3) return 'Location';
    if (step === 4) return 'Budget & Extras';
    return 'Review';
  };

  const handleContextChange = (context: string) => {
    setFormData({
      ...formData,
      furnitureContext: context,
      furnitureCategories: []
    });
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => {
      const cats = prev.furnitureCategories;
      if (cats.includes(category)) {
        return { ...prev, furnitureCategories: cats.filter(c => c !== category) };
      } else {
        return { ...prev, furnitureCategories: [...cats, category] };
      }
    });
  };

  const isNextDisabled = () => {
    if (step === 1 && !formData.type) return true;
    if (step === 2 && formData.type === RequestType.FURNITURE && formData.furnitureCategories.length === 0) return true;
    if (step === 3 && (!formData.kifleKetema || !formData.wereda)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-ethio-light pb-24">
      {/* Header */}
      <div className="bg-white pt-6 pb-4 px-5 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {getTitle()}
          </h2>
          <div className="w-8" />
        </div>
        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-ethio-accent"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">Step {step} of {totalSteps}</p>
      </div>

      <div className="p-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: TYPE SELECTION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800">What are you looking for?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, type: RequestType.PROPERTY})}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all ${formData.type === RequestType.PROPERTY ? 'border-ethio-blue bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className={`p-4 rounded-full ${formData.type === RequestType.PROPERTY ? 'bg-ethio-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Home size={32} />
                  </div>
                  <span className={`font-semibold ${formData.type === RequestType.PROPERTY ? 'text-ethio-blue' : 'text-gray-600'}`}>Property</span>
                </button>

                <button 
                  onClick={() => setFormData({...formData, type: RequestType.FURNITURE})}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all ${formData.type === RequestType.FURNITURE ? 'border-ethio-blue bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className={`p-4 rounded-full ${formData.type === RequestType.FURNITURE ? 'bg-ethio-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Sofa size={32} />
                  </div>
                  <span className={`font-semibold ${formData.type === RequestType.FURNITURE ? 'text-ethio-blue' : 'text-gray-600'}`}>Furniture</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SPECIFICATIONS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800">
                {formData.type === RequestType.FURNITURE ? 'Furniture Details' : 'Property Details'}
              </h3>

              {formData.type === RequestType.FURNITURE ? (
                <div className="space-y-6">
                  {/* Main Category (Environment) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Environment</label>
                    <div className="grid grid-cols-2 gap-3">
                      {furnitureContexts.map(ctx => (
                        <button
                          key={ctx}
                          onClick={() => handleContextChange(ctx)}
                          className={`py-4 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                            formData.furnitureContext === ctx 
                              ? 'border-ethio-blue bg-blue-50 text-ethio-blue' 
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {ctx === 'Home' ? <Lamp size={20} /> : <Briefcase size={20} />}
                          <span className="font-bold">{ctx}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub Category (Items) - Multi Select */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={formData.furnitureContext} // Re-animate on context change
                  >
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Item Types <span className="text-gray-400 font-normal lowercase">(Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                       {furnitureSubCategories[formData.furnitureContext].map(sub => {
                         const isSelected = formData.furnitureCategories.includes(sub);
                         return (
                           <button 
                             key={sub}
                             onClick={() => toggleCategory(sub)}
                             className={`py-3 px-3 text-sm rounded-xl border text-left transition-all flex justify-between items-center ${isSelected ? 'bg-ethio-blue text-white border-ethio-blue shadow-md shadow-ethio-blue/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                           >
                             {sub}
                             {isSelected && <Check size={16} />}
                           </button>
                         );
                       })}
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Total Quantity</label>
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                           <button onClick={() => setFormData(p => ({...p, quantity: Math.max(1, p.quantity - 1)}))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Minus size={20} />
                           </button>
                           <span className="font-bold text-xl text-gray-800">{formData.quantity}</span>
                           <button onClick={() => setFormData(p => ({...p, quantity: p.quantity + 1}))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Plus size={20} />
                           </button>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Condition</label>
                        <select 
                          value={formData.condition}
                          onChange={(e) => setFormData({...formData, condition: e.target.value})}
                          className="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-ethio-blue text-gray-700"
                        >
                           {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Property Type</label>
                    <div className="grid grid-cols-2 gap-3">
                       {propertyTypes.map(pt => (
                         <button 
                           key={pt}
                           onClick={() => setFormData({...formData, propertyType: pt})}
                           className={`py-3 px-4 text-sm rounded-xl border flex items-center gap-2 transition-all ${formData.propertyType === pt ? 'bg-ethio-blue text-white border-ethio-blue shadow-md shadow-ethio-blue/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         >
                           <Building size={16} /> {pt}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bedrooms</label>
                     <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 w-fit">
                        <button onClick={() => setFormData(p => ({...p, bedrooms: Math.max(0, p.bedrooms - 1)}))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                           <Minus size={20} />
                        </button>
                        <div className="flex items-center gap-2 w-16 justify-center">
                           <Bed size={20} className="text-gray-400" />
                           <span className="font-bold text-2xl text-gray-800">{formData.bedrooms}</span>
                        </div>
                        <button onClick={() => setFormData(p => ({...p, bedrooms: p.bedrooms + 1}))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                           <Plus size={20} />
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: LOCATION & TIMEFRAME */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800">Location & Time</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Kifle Ketema</label>
                    <select 
                      value={formData.kifleKetema}
                      onChange={(e) => setFormData({...formData, kifleKetema: e.target.value, wereda: ''})}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-ethio-blue"
                    >
                      <option value="">Sub-city</option>
                      {KIFLE_KETEMAS.map(k => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Wereda</label>
                    <select 
                      value={formData.wereda}
                      onChange={(e) => setFormData({...formData, wereda: e.target.value})}
                      disabled={!formData.kifleKetema}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-ethio-blue disabled:bg-gray-100"
                    >
                      <option value="">Wereda</option>
                      {getWeredas().map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Specific Delivery Address</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="e.g., Near Friendship Park, House #123"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-ethio-blue"
                      />
                      <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivery By</label>
                      <div className="relative">
                        <input 
                           type="date" 
                           value={formData.deliveryDate}
                           onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-ethio-blue text-sm" 
                        />
                        <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Urgency</label>
                      <div className="relative">
                        <select 
                           value={formData.urgency}
                           onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl appearance-none focus:outline-none focus:border-ethio-blue text-sm"
                        >
                           {urgencyOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BUDGET & DETAILS */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800">Budget & Details</h3>
              
              <div>
                <label className="flex justify-between text-sm font-semibold text-gray-700 mb-4">
                  <span>Budget Range (ETB)</span>
                  <span className="text-ethio-blue">{formData.budgetMin.toLocaleString()} - {formData.budgetMax.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="1000" 
                  max="200000" 
                  step="1000"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({...formData, budgetMax: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ethio-accent"
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Detailed Notes</label>
                 <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Describe specific requirements, style preferences, dimensions, etc..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:border-ethio-blue focus:ring-1 focus:ring-ethio-blue min-h-[120px]"
                 />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Attachments (Optional)</label>
                <button 
                   onClick={() => setFormData(p => ({...p, attachments: p.attachments + 1}))}
                   className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-ethio-blue hover:text-ethio-blue hover:bg-blue-50 transition-colors"
                >
                   <Upload size={24} className="mb-2" />
                   <span className="text-sm">Tap to upload photos or design files</span>
                   {formData.attachments > 0 && (
                      <span className="mt-2 text-xs font-bold text-ethio-green flex items-center gap-1">
                        <Check size={12} /> {formData.attachments} files selected
                      </span>
                   )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800">Review Request</h3>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <span className="text-gray-500">Type</span>
                  <div className="text-right">
                     <div className="font-semibold text-gray-800">{formData.type}</div>
                     {formData.type === RequestType.FURNITURE && (
                       <div className="text-xs text-ethio-blue font-medium">
                         <span className="font-bold">{formData.furnitureContext}</span> • {formData.furnitureCategories.join(', ')} (Total: {formData.quantity})
                         <br/><span className="text-gray-500 font-normal">{formData.condition}</span>
                       </div>
                     )}
                     {formData.type === RequestType.PROPERTY && (
                       <div className="text-xs text-ethio-blue font-medium">{formData.propertyType} • {formData.bedrooms} Bed</div>
                     )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <span className="text-gray-500">Location</span>
                  <div className="text-right">
                     <div className="font-semibold text-gray-800">{KIFLE_KETEMAS.find(k => k.value === formData.kifleKetema)?.label}, {formData.wereda}</div>
                     {formData.address && <div className="text-xs text-gray-400 truncate max-w-[150px]">{formData.address}</div>}
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                   <span className="text-gray-500">Timeline</span>
                   <div className="text-right">
                      <div className="font-semibold text-gray-800">{formData.deliveryDate || 'Flexible'}</div>
                      {formData.urgency === 'Urgent' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">URGENT</span>}
                   </div>
                </div>

                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <span className="text-gray-500">Max Budget</span>
                  <span className="font-semibold text-ethio-blue">{formData.budgetMax.toLocaleString()} ETB</span>
                </div>

                <div className="pt-2">
                  <span className="text-gray-500 block mb-2">Notes</span>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg min-h-[60px]">{formData.notes || "No additional notes."}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-40">
           <button 
             onClick={handleNext}
             disabled={isNextDisabled()}
             className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
               isNextDisabled()
                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                 : 'bg-ethio-blue text-white shadow-lg shadow-ethio-blue/30 hover:bg-[#1e425e]'
             }`}
           >
             {step === totalSteps ? (
                <>
                  Submit Request <Check size={20} />
                </>
             ) : (
                <>
                  Continue <ChevronRight size={20} />
                </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default RequestIntake;