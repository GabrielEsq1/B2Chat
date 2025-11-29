"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, Zap, Search, Globe, ArrowRight, Play, Check, BookOpen } from "lucide-react";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";

export default function HomePage() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: <MessageSquare className="h-8 w-8" />,
            title: "💬 Chat Empresarial Inteligente",
            description: "Comunicación en tiempo real diseñada específicamente para negocios B2B"
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "🤝 Conexiones Entre Empresas",
            description: "Networking profesional que impulsa tu crecimiento empresarial"
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "⚡ Automatización con IA",
            description: "Optimiza tus procesos de comunicación con inteligencia artificial"
        },
        {
            icon: <Search className="h-8 w-8" />,
            title: "🔍 Búsqueda Avanzada",
            description: "Encuentra exactamente lo que necesitas en segundos"
        },
        {
            icon: <Globe className="h-8 w-8" />,
            title: "🛜 Disponible en Web & App",
            description: "Accede desde cualquier dispositivo, en cualquier momento"
        },
        {
            icon: <Check className="h-8 w-8" />,
            title: "✅ Publicidad Dirigida",
            description: "Llega a tu audiencia B2B con anuncios inteligentes"
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">B2BChat</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                            B2BChat
                        </h1>
                        <p className="text-2xl sm:text-3xl text-gray-600 mb-4">
                            Conexiones Empresariales 🚀
                        </p>
                        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                            La plataforma de mensajería profesional que conecta empresas,
                            impulsa negocios y transforma la comunicación B2B
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => router.push('/register')}
                                className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-600/30"
                            >
                                ✨ Registrarse Gratis
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowTutorial(true)}
                                className="px-8 py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <BookOpen className="h-5 w-5" />
                                Ver Tutorial
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                🔐 Iniciar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className={`mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-8">
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <Play className="h-20 w-20 text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">Vista Previa del Producto</p>
                                    <p className="text-sm text-gray-500 mt-2">Chat empresarial en tiempo real</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Características Principales
                        </h2>
                        <p className="text-lg text-gray-600">
                            Todo lo que necesitas para impulsar tu negocio B2B
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                🏢 Quiénes Somos
                            </h2>
                            <div className="space-y-4 text-lg text-gray-600">
                                <p>
                                    <strong className="text-gray-900">B2BChat</strong> es la plataforma líder en comunicación empresarial B2B,
                                    diseñada específicamente para conectar empresas y profesionales.
                                </p>
                                <p>
                                    Nuestra misión es transformar la manera en que las empresas se comunican,
                                    facilitando conexiones significativas que impulsan el crecimiento y la innovación.
                                </p>
                                <p>
                                    Con integración directa a <strong className="text-gray-900">Creatiendas</strong>,
                                    ofrecemos una solución completa para tu ecosistema empresarial.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
                            <h3 className="text-2xl font-bold mb-6">Enfoque B2B</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <Check className="h-6 w-6 flex-shrink-0 mt-1" />
                                    <span>Networking profesional de alto nivel</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-6 w-6 flex-shrink-0 mt-1" />
                                    <span>Herramientas diseñadas para empresas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-6 w-6 flex-shrink-0 mt-1" />
                                    <span>Seguridad y privacidad empresarial</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-6 w-6 flex-shrink-0 mt-1" />
                                    <span>Soporte dedicado 24/7</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Comienza tu experiencia B2BChat hoy 🚀
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Únete a miles de empresas que ya están transformando su comunicación empresarial
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/register')}
                            className="px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all hover:scale-105 flex items-center gap-2 shadow-xl"
                        >
                            Registrarse Gratis
                            <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all hover:scale-105"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">B2BChat</span>
                    </div>
                    <p className="text-sm">
                        © 2025 B2BChat. Todos los derechos reservados.
                    </p>
                    <p className="text-sm mt-2">
                        Conexiones Empresariales que Transforman Negocios
                    </p>
                </div>
            </footer>

            {/* Tutorial Walkthrough */}
            {showTutorial && (
                <TutorialWalkthrough onClose={() => setShowTutorial(false)} />
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
