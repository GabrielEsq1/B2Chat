"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface WalkthroughStep {
    title: string;
    description: string;
    image?: string;
    features: string[];
}

const walkthroughSteps: WalkthroughStep[] = [
    {
        title: "¡Bienvenido a B2BChat! 🎯",
        description: "Tu plataforma todo-en-uno para networking y crecimiento empresarial B2B",
        features: [
            "Chat en tiempo real con otros empresarios",
            "Asistentes virtuales con IA de Google Gemini",
            "Marketplace para conectar con empresas",
            "Sistema de campañas publicitarias B2B"
        ]
    },
    {
        title: "1️⃣ Dashboard - Tu Centro de Control",
        description: "Accede a todas las herramientas desde un solo lugar",
        features: [
            "Estadísticas de tu actividad",
            "Acceso rápido al Chat y Contactos",
            "Link directo a tu tienda externa",
            "Crear y gestionar campañas publicitarias"
        ]
    },
    {
        title: "2️⃣ Chat Inteligente con IA 💬",
        description: "Comunícate con empresas y asistentes virtuales impulsados por IA",
        features: [
            "Conversaciones en tiempo real",
            "5 Asistentes IA especializados (Negocios, Noticias, Tareas, Networking, Industria)",
            "Panel de anuncios integrado",
            "Emojis y archivos adjuntos"
        ]
    },
    {
        title: "3️⃣ Contactos y Networking 🤝",
        description: "Construye tu red profesional B2B",
        features: [
            "Explora perfiles de empresarios",
            "Envía solicitudes de conexión",
            "Filtra por industria y posición",
            "Inicia conversaciones directas"
        ]
    },
    {
        title: "4️⃣ Grupos de Trabajo 👥",
        description: "Colabora con múltiples empresas",
        features: [
            "Crea grupos personalizados",
            "Chats grupales en tiempo real",
            "Comparte información con múltiples contactos",
            "Administra miembros fácilmente"
        ]
    },
    {
        title: "5️⃣ Ads Manager - Campañas B2B 📊",
        description: "Crea campañas publicitarias segmentadas en 5 pasos",
        features: [
            "Segmentación por industria, sector y roles",
            "Presupuesto flexible (diario y total)",
            "Creativos de imagen o video",
            "Pago fácil por WhatsApp"
        ]
    },
    {
        title: "¡Listo para Comenzar! 🚀",
        description: "Todo configurado y listo para usar",
        features: [
            "Regístrate gratis en segundos",
            "Conecta con asistentes IA inmediatamente",
            "Explora el marketplace de empresas",
            "Crea tu primera campaña sin costo inicial"
        ]
    }
];

export default function TutorialWalkthrough({ onClose }: { onClose?: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const handleNext = () => {
        if (currentStep < walkthroughSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    const step = walkthroughSteps[currentStep];
    const isLastStep = currentStep === walkthroughSteps.length - 1;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-between pr-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
                            <p className="text-blue-100">{step.description}</p>
                        </div>
                    </div>
                    {/* Progress Dots */}
                    <div className="flex gap-2 mt-4">
                        {walkthroughSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${index === currentStep
                                    ? "bg-white"
                                    : index < currentStep
                                        ? "bg-blue-300"
                                        : "bg-blue-500/30"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Features List */}
                    <div className="space-y-3">
                        {step.features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                            >
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    ✓
                                </div>
                                <p className="text-gray-700 flex-1">{feature}</p>
                            </div>
                        ))}
                    </div>

                    {/* Illustration Placeholder */}
                    {currentStep === 0 && (
                        <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🚀</div>
                                <p className="text-gray-600 font-medium">
                                    Comienza tu experiencia B2BChat
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${currentStep === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    <div className="text-sm text-gray-500 font-medium">
                        Paso {currentStep + 1} de {walkthroughSteps.length}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        {isLastStep ? "¡Empezar!" : "Siguiente"}
                        {!isLastStep && <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
