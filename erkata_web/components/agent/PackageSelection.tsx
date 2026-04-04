// Import React and the useState hook for managing local state
import React, { useState } from 'react';

// Import animation primitives from framer-motion for transitions and staggered entry effects
import { motion, AnimatePresence } from 'framer-motion';

// Import icons from lucide-react used to visually represent each tier and UI elements
import { Shield, Sparkles, CheckCircle, MapPin, Users, Heart, Star, ArrowRight, Loader2, Zap } from 'lucide-react';

// Import the pre-configured axios API client for making authenticated HTTP requests
import api from '../../utils/api';

// Import the global modal helper to trigger confirmation and alert dialogs
import { useModal } from '../../contexts/ModalContext';

// Define the props interface for the PackageSelection component
export interface PackageSelectionProps {
  currentTier?: string;     // The backend tier enum value for the agent's current package
  onComplete: () => void;   // Callback fired after a successful package purchase
  onSkip?: () => void;      // Optional callback fired when the user dismisses without purchasing
  skipText?: string;        // Optional custom label for the skip/dismiss button
}

// Static array describing all purchasable packages (tiers) with their display metadata
const packages = [
  {
    id: 'PEACE',                                                    // The backend tier enum value sent on purchase
    name: 'Peace',                                                  // Display name shown in the UI
    price: '2,500',                                                 // Price in ETB shown to the user
    limit: '2 Zones',                                              // Geographic zone limit for this tier
    slots: '7 Direct Referrals',                                   // Maximum direct referral slots for this tier
    description: 'For agents building their first local footprint.',// Short marketing description
    icon: Shield,                                                   // Lucide icon component for this tier
    gradient: 'from-sky-400 to-blue-600',                          // Tailwind gradient used in the icon header
    shadow: 'shadow-blue-400/25',                                  // Colored shadow class applied to the card
    ring: 'ring-blue-200',                                         // Ring class applied when the card is "popular"
    textAccent: 'text-blue-600',                                   // Accent text color for feature icons
    bgAccent: 'bg-blue-50',                                        // Accent background for feature icon containers
    popular: false,                                                 // Whether to show the "Popular" badge
  },
  {
    id: 'LOVE',
    name: 'Love',
    price: '5,000',
    limit: '3 Zones',
    slots: '16 Direct Referrals',
    description: 'Grow your network and reach more lucrative territories.',
    icon: Heart,
    gradient: 'from-rose-400 to-pink-600',
    shadow: 'shadow-rose-400/30',
    ring: 'ring-rose-200',
    textAccent: 'text-rose-600',
    bgAccent: 'bg-rose-50',
    popular: true,                                                  // This tier has the "Most Popular" highlight
  },
  {
    id: 'UNITY',
    name: 'Unity',
    price: '10,000',
    limit: '5 Zones',
    slots: '23 Direct Referrals',
    description: 'For professionals managing active regional pipelines.',
    icon: Users,
    gradient: 'from-amber-400 to-orange-600',
    shadow: 'shadow-amber-400/25',
    ring: 'ring-amber-200',
    textAccent: 'text-amber-600',
    bgAccent: 'bg-amber-50',
    popular: false,
  },
  {
    id: 'ABUNDANT_LIFE',
    name: 'Abundant Life',
    price: '25,000',
    limit: 'Unlimited Zones',                                       // This tier has no geographic restriction
    slots: '31 Direct Referrals',
    description: 'Unrestricted reach and maximum team growth potential.',
    icon: Sparkles,
    gradient: 'from-violet-500 to-fuchsia-600',
    shadow: 'shadow-violet-400/25',
    ring: 'ring-violet-200',
    textAccent: 'text-violet-600',
    bgAccent: 'bg-violet-50',
    popular: false,
  },
];

// Main component: renders the full-page package selection/upgrade screen
export const PackageSelection: React.FC<PackageSelectionProps> = ({ currentTier, onComplete, onSkip, skipText }) => {
  const { showConfirm, showAlert } = useModal(); // Destructure modal helpers from context

  const [selectedId, setSelectedId] = useState<string | null>(null); // Tracks which tier the user clicked (for loading state)
  const [isSubmitting, setIsSubmitting] = useState(false);           // True while the API purchase request is in-flight

  // Handles the user clicking "Get Started" on a specific package card
  const handleSelect = async (pkgId: string, paymentMethod: 'ETB' | 'AGLP' = 'ETB') => {
    setSelectedId(pkgId); // Mark this card as the active/selected card
    const pkg = packages.find(p => p.id === pkgId); // Look up the full package metadata by ID

    const message = paymentMethod === 'ETB'
      ? `You are about to subscribe to the ${pkg?.name} package for ${pkg?.price} ETB. You will receive an equivalent amount of AGLP as a reward. This will unlock ${pkg?.limit} and ${pkg?.slots}. Proceed?`
      : `You are about to subscribe to the ${pkg?.name} package using your AGLP balance. This will unlock ${pkg?.limit} and ${pkg?.slots}. Proceed?`;

    // Show a confirmation modal before charging the agent
    const confirmed = await showConfirm({
      title: `Subscribe to ${pkg?.name}`,                                                                                 // Modal title showing chosen tier
      message, // Warning with price and perks
      confirmText: 'Confirm & Pay',                                                                                       // Label for the confirm button
      type: 'success',                                                                                                    // Visual style for the modal
    });

    if (confirmed) {
      setIsSubmitting(true); // Show loading spinner on the selected card's button
      try {
        await api.post('/users/me/package', { tier: pkgId, paymentMethod }); // Submit the selected tier to the backend
        showAlert({
          title: 'Package Activated!',                                                 // Success message title
          message: `Welcome to the ${pkg?.name} tier. Your account has been upgraded successfully.`, // Confirmation to the user
          type: 'success',                                                             // Render as a green success alert
        });
        onComplete(); // Trigger the parent's callback (e.g., refresh dashboard data)
      } catch (error: any) {
        console.error('Package purchase failed:', error); // Log the full error for debugging
        showAlert({
          title: 'Transaction Failed',                                                                         // Error message title
          message: error.response?.data?.message || 'Failed to activate package. Please try again.',          // Use API error message or fallback
          type: 'error',                                                                                       // Render as a red error alert
        });
      } finally {
        setIsSubmitting(false); // Re-enable the button regardless of success or failure
      }
    } else {
      setSelectedId(null); // If the user cancelled the modal, deselect the card
    }
  };

  return (
    // Outer wrapper: fades in on mount, provides relative positioning for the decorative blobs
    <motion.div
      initial={{ opacity: 0 }}   // Start fully transparent
      animate={{ opacity: 1 }}   // Animate to fully visible
      className="relative w-full pb-12" // Full width, with bottom padding for breathing room
    >
      {/* Decorative ambient blobs — purely visual, non-interactive, clipped inside the rounded container */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl pointer-events-none">
        {/* Top-left blue/indigo blob */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full opacity-50 blur-3xl" />
        {/* Bottom-right rose/pink blob */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full opacity-40 blur-3xl" />
      </div>

      {/* Header section: centered title and subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-12 pt-8">
        {/* Animated icon badge that springs in with a slight rotation */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}                           // Start small and rotated
          animate={{ scale: 1, rotate: 0 }}                             // Spring into position
          transition={{ type: 'spring', stiffness: 200, damping: 18 }} // Physics-based spring transition
          className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center mx-auto mb-6" // Gradient background, centered
        >
          <Zap className="w-8 h-8 text-white" /> {/* Lightning bolt icon symbolizing activation */}
        </motion.div>

        {/* Main heading with gradient text highlight on "Operational Tier" */}
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4 leading-tight">
          Choose Your <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Operational Tier</span>
        </h1>

        {/* Subheading explaining what the tier controls */}
        <p className="text-lg text-slate-500 leading-relaxed">
          Your tier determines your geographic reach and the agents you can refer. Upgrade anytime.
        </p>
      </div>

      {/* Card grid: 1 col on mobile, 2 on tablet, 4 on wide desktop. Added max-w-7xl to prevent excessive width. */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
        {/* AnimatePresence allows cards to animate in/out correctly */}
        <AnimatePresence>
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;            // Resolve the icon component for this specific package
            const isSelected = selectedId === pkg.id; // True if this card triggered the last purchase attempt

            return (
              // Each card animates in from below with a staggered delay based on its index
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}            // Start below and invisible
                animate={{ opacity: 1, y: 0 }}             // Animate to natural position
                transition={{ delay: index * 0.08, duration: 0.4 }} // Small stagger delay between cards
                whileHover={{ y: -6, transition: { duration: 0.2 } }} // Lift card slightly on hover
                className={`relative bg-white rounded-3xl flex flex-col overflow-hidden transition-all duration-300 cursor-pointer border-2 ${
                  pkg.popular
                    ? `border-rose-400 shadow-2xl ${pkg.shadow} ring-4 ${pkg.ring} ring-opacity-30` // Popular: vibrant border + glow ring
                    : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-300'            // Others: subtle border, hover lift
                }`}
                onClick={() => !isSubmitting && handleSelect(pkg.id, 'ETB')} // Clicking anywhere on the card triggers ETB purchase
              >
                {/* Top color bar: only shown on the popular card to draw attention */}
                {pkg.popular && (
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${pkg.gradient}`} />
                )}

                {/* "Popular" star badge: top-right corner of the popular card */}
                {pkg.popular && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-white" /> {/* Star icon with filled style */}
                    Popular
                  </div>
                )}

                {/* Gradient icon header: added px-8 so the icon isn't touching the edge. */}
                <div className={`bg-gradient-to-br ${pkg.gradient} pt-10 pb-16 px-5 relative overflow-hidden`}>
                  {/* Ghost icon: large, low-opacity version positioned at the bottom-right corner. */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Icon className="w-32 h-40 absolute -bottom-2 -right-2" />
                  </div>
                  
                  {/* Blurry Blend: A soft gradient that fades the header color into the card's white content area. */}
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white via-white/10 to-transparent pointer-events-none" />

                  {/* Frosted glass icon container: positioned relatively to stay above the gradients. */}
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center relative z-10">
                    <Icon className="w-7 h-7 text-white" /> {/* The tier's main icon. */}
                  </div>
                </div>

                {/* Card content body */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-slate-800 mb-1">{pkg.name}</h3> {/* Tier name */}
                  <p className="text-xs text-slate-400 font-medium mb-5 leading-relaxed min-h-[32px]">
                    {pkg.description} {/* Short description; min-h ensures cards align even with short text */}
                  </p>

                  {/* Price display with ETB currency label */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-slate-900">{pkg.price}</span> {/* Numeric price */}
                    <span className="text-sm font-bold text-slate-400">ETB</span>           {/* Currency label */}
                  </div>

                  {/* Features list: zone limit, referral slots, and support */}
                  <div className="space-y-3 mb-7 flex-grow"> {/* flex-grow forces CTA button to the bottom */}
                    {/* Zone limit feature row */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl ${pkg.bgAccent} flex items-center justify-center flex-shrink-0`}>
                        <MapPin className={`w-3.5 h-3.5 ${pkg.textAccent}`} /> {/* Map pin icon in tier accent color */}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{pkg.limit}</span> {/* Zone limit label */}
                    </div>
                    {/* Referral slot feature row */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl ${pkg.bgAccent} flex items-center justify-center flex-shrink-0`}>
                        <Users className={`w-3.5 h-3.5 ${pkg.textAccent}`} /> {/* Users icon in tier accent color */}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{pkg.slots}</span> {/* Referral slots label */}
                    </div>
                    {/* Support feature row — consistent across all tiers */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {/* Green checkmark indicating inclusion */}
                      </div>
                      <span className="text-sm font-bold text-slate-700">Priority Support</span>
                    </div>
                  </div>

                  {/* Call-to-action button section container */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {/* Call-to-action button — ETB */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect(pkg.id, 'ETB'); }}
                      disabled={isSubmitting}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                        pkg.popular
                          ? `bg-gradient-to-r ${pkg.gradient} text-white shadow-lg ${pkg.shadow} hover:opacity-90` // Gradient CTA for popular
                          : 'bg-slate-900 text-white hover:bg-slate-700'                                           // Dark CTA for others
                      } ${isSubmitting && isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting && isSelected ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Buy with {pkg.price} ETB
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Additional Call-to-action button — AGLP (Only if upgrading) */}
                    {currentTier && currentTier !== 'FREE' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(pkg.id, 'AGLP'); }}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 ${isSubmitting && isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        Upgrade with AGLP
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Skip/dismiss link — only rendered if the parent provided an onSkip callback */}
      {onSkip && (
        <div className="mt-10 text-center">
          <button
            onClick={onSkip} // Invoke the parent's skip handler (e.g., return to dashboard)
            className="text-slate-400 hover:text-slate-700 font-semibold text-sm underline underline-offset-4 transition-colors p-2" // Subtle text link style
          >
            {skipText || 'Continue with Free Tier for now'} {/* Use custom label or a sensible default */}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Default export for backward-compatible imports (e.g., `import PackageSelection from ...`)
export default PackageSelection;
