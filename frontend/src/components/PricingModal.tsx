import React from 'react';
import { X } from 'lucide-react';
import { PricingSection } from './PricingSection';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: 'free' | 'pro' | 'enterprise';
  onUpgrade?: (plan: 'free' | 'pro' | 'enterprise') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Geist',system-ui,-apple-system,sans-serif]">
      <div className="bg-black border border-zinc-800 rounded-none w-full max-w-7xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-none hover:bg-zinc-800/60 transition-colors z-20"
          aria-label="Close pricing modal"
        >
          <X className="w-5 h-5" />
        </button>

        <PricingSection
          currentPlan={currentPlan}
          onSelectPlan={(plan) => {
            if (plan === 'pro' || plan === 'studio') {
              onUpgrade?.('pro');
            } else if (plan === 'enterprise' || plan === 'business') {
              onUpgrade?.('enterprise');
            } else {
              onUpgrade?.('free');
            }
            onClose();
          }}
          className="py-2"
        />
      </div>
    </div>
  );
};

export default PricingModal;
