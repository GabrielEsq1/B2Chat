"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Users, UserCircle, LayoutDashboard, Home } from "lucide-react";
import Image from "next/image";

const appScreens = [
    {
        id: 1,
        title: "Dashboard Inteligente",
        description: "Gestiona tus conversaciones, campañas y conexiones empresariales desde un solo lugar. Ve tu balance, accede rápidamente a todas las funciones.",
        icon: LayoutDashboard,
        color: "from-blue-500 to-blue-600",
        image: "/screenshots/dashboard.png"
    },
    {
        id: 2,
        title: "Chat Empresarial",
        description: "Mensajería instantánea con empresas verificadas. Busca contactos, explora el marketplace y gestiona todas tus conversaciones.",
        icon: MessageSquare,
        color: "from-green-500 to-emerald-600",
        image: "/screenshots/chat.png"
    },
    {
        id: 3,
        title: "Red de Contactos",
        description: "Descubre empresas, conecta con profesionales B2B y gestiona tu red de negocios. Filtra por industria, envía solicitudes de conexión.",
        icon: Users,
        color: "from-purple-500 to-indigo-600",
        image: "/screenshots/contacts.png"
    },
    {
        id: 4,
        title: "Perfil Profesional",
        description: "Crea tu perfil empresarial con foto, portada y datos de tu empresa. Muestra tu marca y conecta con clientes potenciales.",
        icon: UserCircle,
        color: "from-orange-500 to-red-500",
        image: "/screenshots/profile.png"
    },
    {
        id: 5,
        title: "Página de Inicio",
        description: "Una interfaz moderna y profesional que te guía a todas las funciones. Diseño limpio enfocado en productividad empresarial.",
        icon: Home,
        color: "from-cyan-500 to-blue-600",
        image: "/screenshots/landing.png"
    }
];

export default function AppShowcaseCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % appScreens.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev + 1) % appScreens.length);
    };

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev - 1 + appScreens.length) % appScreens.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentSlide(index);
    };

    const screen = appScreens[currentSlide];
    const Icon = screen.icon;

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                        ✨ Descubre B2BChat
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Conoce todas las funciones<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            en acción
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Explora las principales pantallas de la aplicación con capturas reales.
                    </p>
                </div>

                {/* Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
                        {/* Left: Screenshot Image - Full Size without Frame */}
                        <div className="relative flex-shrink-0 order-2 lg:order-1 w-full max-w-[450px] mx-auto lg:mx-0">
                            {/* Image Container with Shadow and Rounded Corners */}
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                                <Image
                                    src={screen.image}
                                    alt={screen.title}
                                    fill
                                    className="object-cover object-top transition-all duration-500"
                                    priority
                                />
                            </div>

                            {/* Floating Badge */}
                            <div className={`absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r ${screen.color} rounded-xl shadow-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 max-w-lg text-center lg:text-left order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${screen.color} flex items-center justify-center`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Pantalla {currentSlide + 1} de {appScreens.length}</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 transition-all duration-300">
                                {screen.title}
                            </h3>

                            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                                {screen.description}
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                                {currentSlide === 0 && (
                                    <>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Balance en USD</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Onboarding Gratis</span>
                                    </>
                                )}
                                {currentSlide === 1 && (
                                    <>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Mensajes en Tiempo Real</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Búsqueda Inteligente</span>
                                    </>
                                )}
                                {currentSlide === 2 && (
                                    <>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Descubrir Empresas</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Solicitudes de Conexión</span>
                                    </>
                                )}
                                {currentSlide === 3 && (
                                    <>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Foto de Perfil</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Socio B2BChat</span>
                                    </>
                                )}
                                {currentSlide === 4 && (
                                    <>
                                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">Diseño Moderno</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Interfaz Intuitiva</span>
                                    </>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 border border-gray-100"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 border border-gray-100"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Dots */}
                            <div className="flex items-center justify-center lg:justify-start gap-2">
                                {appScreens.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`transition-all duration-300 rounded-full ${index === currentSlide
                                            ? 'w-10 h-3 bg-blue-600'
                                            : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Auto-play indicator */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span>{isAutoPlaying ? 'Reproducción automática' : 'Pausado'}</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <a
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95"
                    >
                        Probar Gratis Ahora
                        <ChevronRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
