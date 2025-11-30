import React, { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Coins, Plus } from 'lucide-react';
import PricingModal from './PricingModal';

export default function CreditBalance() {
  const { balance, loading, error } = useCredits();
  const [showPricing, setShowPricing] = useState(false);

  if (loading) return <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-full"></div>;
  if (error) return null;

  const isLowBalance = balance < 10;

  return (
    <>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${isLowBalance ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`} onClick={() => setShowPricing(true)}>
        <Coins className="w-4 h-4" />
        <span className="font-medium text-sm">{balance.toFixed(2)} USD</span>
        <button className="ml-1 p-0.5 hover:bg-black/5 rounded-full transition-colors">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
}
