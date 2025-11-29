"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Zap } from "lucide-react";

const plans = [
    {
        id: "free",
        name: "FREE",
        price: 0,
        currency: "COP",
        features: [
            "1 catálogo de productos",
            "Chat limitado (10 mensajes/día)",
            "Perfil básico",
            "Sin anuncios",
        ],
        limitations: [
            "Sin estadísticas",
            "Sin Social Hub",
            "Sin publicidad",
        ],
    },
    {
        id: "pro",
        name: "PRO",
        price: 79000,
        currency: "COP",
        popular: true,
        features: [
            "Catálogos ilimitados",
            "Chat ilimitado",
            "Búsquedas ilimitadas",
            "Estadísticas básicas",
            "Botón WhatsApp",
            "Social Hub básico",
            "Anuncios internos incluidos",
        ],
    },
    {
        id: "business",
        name: "BUSINESS",
        price: 399000,
        currency: "COP",
        features: [
            "Todo de PRO +",
            "Anuncios destacados",
            "Dashboard avanzado",
            "API ERP/CRM",
            "Soporte prioritario",
            "Analytics avanzados",
            "Perfil destacado",
        ],
    },
    {
        id: "enterprise",
        name: "ENTERPRISE",
        price: null,
        currency: "COP",
        features: [
            "Todo de BUSINESS +",
            "Servidores dedicados",
            "Integraciones especiales",
            "Soporte 24/7",
            "SLA garantizado",
            "Consultoría incluida",
            "Personalización completa",
        ],
    },
];

export default function BillingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") return;

        setLoading(planId);
        try {
            const response = await fetch("/api/billing/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            }
        } catch (error) {
            console.error("Error creating checkout:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Planes y Precios
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Elige el plan perfecto para tu negocio
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid gap-8 lg:grid-cols-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative overflow-hidden rounded-2xl border-2 bg-white p-8 ${plan.popular
                                ? "border-blue-500 shadow-xl"
                                : "border-gray-200"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute right-0 top-0 bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
                                    POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {plan.name}
                                </h3>
                                <div className="mt-4 flex items-baseline">
                                    {plan.price !== null ? (
                                        <>
                                            <span className="text-5xl font-bold text-gray-900">
                                                ${plan.price}
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                /{plan.currency === "USD" ? "mes" : ""}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-900">
                                            Contactar
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="mb-8 space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                                {plan.limitations?.map((limitation, index) => (
                                    <li key={index} className="flex items-start gap-3 opacity-50">
                                        <span className="text-sm text-gray-500 line-through">
                                            {limitation}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading === plan.id || plan.id === "free"}
                                className={`w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${plan.popular
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : plan.id === "free"
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                    }`}
                            >
                                {loading === plan.id ? (
                                    "Procesando..."
                                ) : plan.id === "free" ? (
                                    "Plan Actual"
                                ) : plan.price === null ? (
                                    "Contactar Ventas"
                                ) : (
                                    "Suscribirse"
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600">
                        ¿Necesitas ayuda para elegir? {" "}
                        <a href="mailto:soporte@b2bchat.com" className="font-medium text-blue-600 hover:text-blue-700">
                            Contáctanos
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
