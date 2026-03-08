import React, { useState } from 'react';
import { Star, MessageSquare, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackFormProps {
  requestId: string;
  recipientName: string;
  role: 'agent' | 'customer';
  onClose: () => void;
  onSubmit: (data: FeedbackData) => void;
}

export interface FeedbackData {
  requestId: string;
  rating: number;
  comment: string;
  categories: string[];
  role: 'agent' | 'customer';
}

const CATEGORIES = {
  agent: ['Timeliness', 'Document Quality', 'Communication', 'Zone Accuracy', 'Professionalism'],
  customer: ['Clear Requirements', 'Prompt Payment', 'Responsiveness', 'Fair Specification', 'Politeness']
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({ requestId, recipientName, role, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    onSubmit({
      requestId,
      rating,
      comment,
      categories: selectedCategories,
      role
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl text-center shadow-xl border border-slate-100 max-w-md w-full mx-auto"
      >
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Feedback Received!</h3>
        <p className="text-slate-500 text-sm mb-6">
          Thank you for providing your feedback. It has been securely sent to our regional operator for verification.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-xl w-full mx-auto relative"
    >
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Submit Feedback</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Request: {requestId}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="text-center mb-8">
          <p className="text-slate-500 text-sm mb-4">How would you rate your experience with <span className="font-bold text-slate-800">{recipientName}</span>?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-erkata-accent text-erkata-accent' 
                      : 'text-slate-200'
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What went well?</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[role].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedCategories.includes(category)
                    ? 'bg-erkata-primary text-white border-erkata-primary'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Additional Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 transition-all min-h-[120px]"
            placeholder="Share details about your experience..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={rating === 0}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all ${
              rating === 0 
                ? 'bg-slate-200 cursor-not-allowed' 
                : 'bg-erkata-primary hover:bg-erkata-secondary shadow-lg shadow-erkata-primary/20 hover:shadow-xl'
            }`}
          >
            Submit to Operator
          </button>
        </div>

        <div className="mt-6 flex items-start gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
            Note: Your feedback is part of the 5-step escalation chain. It will be bundled with the agent's feedback by the operator before being reviewed by management.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;
