'use client';

import { Check, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingCardProps {
    plan: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        priceMonthly: number;
        maxUsers: number;
        canUseAI: boolean;
        canUseWhatsApp: boolean;
        whatsappLimit: number;
    };
}

export default function PricingCard({ plan }: PricingCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = async () => {
        if (plan.code === 'FREE') {
            router.push('/register');
            return;
        }

        if (plan.code === 'ENTERPRISE') {
            window.location.href = 'mailto:ventas@b2bchat.co';
            return;
        }

        // Call Checkout API
        setLoading(true);
        try {
            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planCode: plan.code })
            });

            const data = await res.json();

            if (data.approvalUrl) {
                window.location.href = data.approvalUrl; // Redirect to PayPal
            } else {
                alert('Error creating checkout. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to payment gateway');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${plan.code === 'PRO' ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl scale-105 z-10' : 'border-gray-200'}`}>
            {plan.code === 'PRO' && (
                <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-md">
                    Recomendado
                </div>
            )}

            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{plan.name}</h3>

                <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">${plan.priceMonthly}</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">/mes</span>
                </div>
                <p className="mt-6 text-gray-500 text-sm leading-6">{plan.description}</p>

                {/* Features List */}
                <ul role="list" className="mt-6 space-y-4">
                    <li className="flex items-start">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="ml-3 text-sm text-gray-700 font-medium">
                            {plan.maxUsers === 9999 ? 'Usuarios Ilimitados' : `${plan.maxUsers} Usuario${plan.maxUsers > 1 ? 's' : ''}`}
                        </span>
                    </li>
                    <li className="flex items-start">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="ml-3 text-sm text-gray-700">Chat B2B + Email Bridge</span>
                    </li>

                    {/* AI Feature */}
                    <li className="flex items-start">
                        {plan.canUseAI ? (
                            <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                            <X className="flex-shrink-0 h-5 w-5 text-gray-300" />
                        )}
                        <span className={`ml-3 text-sm ${plan.canUseAI ? 'text-gray-700' : 'text-gray-400'}`}>
                            Inteligencia Artificial
                        </span>
                    </li>

                    {/* WhatsApp Feature */}
                    <li className="flex items-start">
                        {plan.canUseWhatsApp ? (
                            <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                            <X className="flex-shrink-0 h-5 w-5 text-gray-300" />
                        )}
                        <span className={`ml-3 text-sm flex flex-col ${plan.canUseWhatsApp ? 'text-gray-700' : 'text-gray-400'}`}>
                            <span>WhatsApp Integrado</span>
                            {plan.canUseWhatsApp && (
                                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-1 py-0.5 rounded w-fit mt-1">
                                    {plan.whatsappLimit} convs/mes
                                </span>
                            )}
                        </span>
                    </li>

                    {plan.code === 'ENTERPRISE' && (
                        <li className="flex items-start">
                            <Shield className="flex-shrink-0 h-5 w-5 text-indigo-500" />
                            <span className="ml-3 text-sm text-gray-700 font-bold">API & SLA Dedicado</span>
                        </li>
                    )}
                </ul>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleSelectPlan}
                    disabled={loading}
                    className={`block w-full text-center rounded-xl border border-transparent px-6 py-3 text-base font-bold shadow-sm transition-all disabled:opacity-50 ${plan.code === 'PRO'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-200'
                        : plan.code === 'ENTERPRISE'
                            ? 'bg-gray-900 text-white hover:bg-black'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                >
                    {loading ? 'Procesando...' : plan.code === 'FREE' ? 'Comenzar Gratis' : plan.code === 'ENTERPRISE' ? 'Hablar con Ventas' : `Elegir ${plan.name}`}
                </button>
            </div>
        </div>
    );
}
