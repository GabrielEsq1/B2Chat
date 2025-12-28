"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare, Users, Zap, TrendingUp, Clock, Shield,
    Check, ArrowRight, Play, Star, Building2
} from "lucide-react";

export default function LandingPage() {
    const router = useRouter();
    const [videoPlaying, setVideoPlaying] = useState(false);

    const benefits = [
        {
            icon: <TrendingUp className="h-6 w-6" />,
            title: "Chat Empresarial Inteligente",
            description: "Reduce tiempos de respuesta y aumenta cierres con conversaciones enfocadas en negocios, no chats informales.",
            metric: "+40% más cierres"
        },
        {
            icon: <Building2 className="h-6 w-6" />,
            title: "Conexiones Entre Empresas",
            description: "Conecta solo con empresas reales y activas, no contactos irrelevantes. Cada lead cuenta.",
            metric: "100% verificadas"
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Automatización con IA",
            description: "Responde clientes, filtra oportunidades y prioriza leads sin aumentar tu equipo.",
            metric: "75% tiempo ahorrado"
        },
        {
            icon: <Clock className="h-6 w-6" />,
            title: "Comunicación en Tiempo Real",
            description: "Cierra negocios mientras conversan. Sin esperas, sin correos perdidos, solo resultados.",
            metric: "Respuestas instantáneas"
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Seguridad Empresarial",
            description: "Protección de datos nivel empresarial. Tus conversaciones comerciales están encriptadas y seguras.",
            metric: "Certificado ISO"
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Red B2B Exclusiva",
            description: "Accede a una comunidad cerrada de empresas activas buscando proveedores, socios y clientes.",
            metric: "1,000+ empresas"
        },
    ];

    const steps = [
        { number: "1", title: "Regístrate gratis", desc: "Sin tarjeta, sin costos ocultos" },
        { number: "2", title: "Crea tu perfil empresarial", desc: "Verificación en menos de 3 minutos" },
        { number: "3", title: "Empieza a chatear", desc: "Conecta con empresas verificadas hoy" },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">B2BChat</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Probar Gratis
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - ABOVE THE FOLD */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Value Prop */}
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-6">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Más de 1,000 empresas activas
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Cierra más negocios B2B desde un solo{" "}
                                <span className="text-blue-600">chat empresarial</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                                Conecta con empresas reales, automatiza conversaciones comerciales y centraliza tu comunicación profesional en una sola plataforma.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                                >
                                    Probar Gratis (sin tarjeta)
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setVideoPlaying(true)}
                                    className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Play className="h-5 w-5" />
                                    Ver cómo funciona en 60s
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Sin tarjeta</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Setup en 3 minutos</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Sin spam</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Product Mockup */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-60"></div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-60"></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 overflow-hidden">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 min-h-[400px] flex flex-col">
                                    {/* Chat Header */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                            TC
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">TechCorp Solutions</h3>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                    ✓ Verificada
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">Software Development</p>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 py-4 space-y-4">
                                        <div className="flex gap-2">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm max-w-[80%]">
                                                <p className="text-sm text-gray-700">Hola, vimos tu perfil. ¿Tienes disponibilidad para un proyecto de desarrollo?</p>
                                                <span className="text-xs text-gray-400 mt-1 block">10:23 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm max-w-[80%]">
                                                <p className="text-sm">¡Claro! Nos especializamos en soluciones B2B. ¿Qué necesitas?</p>
                                                <span className="text-xs text-blue-100 mt-1 block">10:24 AM</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm max-w-[80%] relative">
                                                <div className="absolute -top-2 -right-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                                    🤖 IA
                                                </div>
                                                <p className="text-sm text-gray-700">Necesitamos integrar un CRM...</p>
                                                <span className="text-xs text-gray-400 mt-1 block">Escribiendo...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-center text-xs text-gray-500 font-medium pt-2 border-t border-gray-200">
                                        ✨ Así se ve cerrar un negocio desde B2BChat
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
                            <div className="text-gray-600">Empresas Activas</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
                            <div className="text-gray-600">Más Cierres Mensuales</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">75%</div>
                            <div className="text-gray-600">Tiempo Ahorrado</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            ¿Cómo te hace ganar más dinero?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Cada funcionalidad está diseñada para aumentar ingresos y reducir costos operativos
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        {benefit.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                            <TrendingUp className="h-3 w-3" />
                                            {benefit.metric}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Start Section */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Cómo Empezar
                        </h2>
                        <p className="text-lg text-gray-600">
                            Comienza a cerrar negocios en menos de 5 minutos
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.desc}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-sm text-gray-500 mb-6">
                            Sin tarjeta · Configuración en menos de 3 minutos
                        </p>
                        <button
                            onClick={() => router.push('/register')}
                            className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg"
                        >
                            Empezar Ahora Gratis
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <blockquote className="text-lg text-gray-700 mb-4">
                            "Desde que usamos B2BChat, nuestras conversaciones con proveedores se cerraron 40% más rápido. La IA filtra los leads reales y podemos enfocarnos solo en oportunidades que generan ingresos."
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                MR
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">María Rodríguez</div>
                                <div className="text-sm text-gray-500">CEO, InnovateTech Colombia</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Simplified */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Diseñado para empresas que venden, negocian y crecen en LATAM
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6 mt-8">
                        <div className="flex flex-col items-center">
                            <Shield className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Seguridad Empresarial</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">100% B2B</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Red LATAM</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Zap className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Integración Creatiendas</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Empieza gratis hoy y convierte más conversaciones en negocios
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Miles de empresas B2B ya están cerrando más deals. ¿A qué esperas?
                    </p>
                    <button
                        onClick={() => router.push('/register')}
                        className="px-10 py-5 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition-all hover:scale-105 inline-flex items-center gap-2 shadow-2xl text-lg"
                    >
                        Probar B2BChat Gratis
                        <ArrowRight className="h-6 w-6" />
                    </button>
                    <p className="text-blue-100 text-sm mt-6">
                        Sin costos ocultos · Sin spam · Sin tarjeta de crédito
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">B2BChat</span>
                        </div>
                        <p className="text-sm">© 2025 B2BChat. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
