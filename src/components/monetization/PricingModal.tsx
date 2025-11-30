import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    credits: number;
    features: string[];
}

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { plan: currentPlan, refreshCredits } = useCredits();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/subscriptions/plans')
                .then(res => res.json())
                .then(data => {
                    setPlans(data.plans);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleUpgrade = async (planId: string) => {
        setUpgrading(planId);
        try {
            const res = await fetch('/api/subscriptions/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });

            if (res.ok) {
                await refreshCredits();
                onClose();
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
        } finally {
            setUpgrading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Mejora tu Plan</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan === plan.id;
                            return (
                                <div key={plan.id} className={`border rounded-xl p-6 relative ${isCurrent ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-blue-300'}`}>
                                    {isCurrent && (
                                        <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                            Actual
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold">
                                            {plan.price === 0 ? 'Gratis' : `$${plan.price.toLocaleString()}`}
                                        </span>
                                        <span className="text-gray-500 text-sm">/{plan.currency}</span>
                                    </div>

                                    <div className="mb-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded">
                                            <Coins className="w-4 h-4" />
                                            {plan.credits} Créditos USD
                                        </div>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <Check className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={isCurrent || upgrading !== null}
                                        className={`w-full py-2 rounded-lg font-medium transition-colors ${isCurrent
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {upgrading === plan.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : isCurrent ? (
                                            'Plan Actual'
                                        ) : (
                                            'Actualizar'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

import { Coins } from 'lucide-react';
