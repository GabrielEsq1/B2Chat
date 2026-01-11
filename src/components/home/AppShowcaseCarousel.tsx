"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Users, UserCircle, LayoutDashboard, Sparkles } from "lucide-react";

const appFeatures = [
    {
        id: 1,
        title: "Dashboard Inteligente",
        description: "Gestiona tus conversaciones, campañas y conexiones empresariales desde un solo lugar.",
        icon: LayoutDashboard,
        color: "from-blue-500 to-blue-600",
        mockup: (
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[280px] mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 mb-4">
                    <p className="text-white/80 text-xs">Bienvenido</p>
                    <h3 className="text-white font-bold text-lg">¡Hola, Usuario! 👋</h3>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-200 mb-3">
                    <div className="flex items-center justify-between">
                        <span className="text-green-700 font-bold text-sm">Balance</span>
                        <span className="text-green-600 font-black text-xl">$10.00</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "Chat Empresarial",
        description: "Mensajería instantánea con notificaciones en tiempo real y copias automáticas por email.",
        icon: MessageSquare,
        color: "from-green-500 to-emerald-600",
        mockup: (
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[280px] mx-auto">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">G</div>
                    <div>
                        <p className="font-bold text-gray-900">GABO</p>
                        <p className="text-xs text-green-500">En línea</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                        <p className="text-sm text-gray-700">¡Hola! ¿Cómo va el proyecto?</p>
                    </div>
                    <div className="bg-blue-500 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
                        <p className="text-sm text-white">¡Excelente! Avanzando bien 🚀</p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                        <p className="text-sm text-gray-700">¡Perfecto! Agendamos llamada</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Red de Contactos",
        description: "Descubre empresas, conecta con profesionales y gestiona tu red de negocios B2B.",
        icon: Users,
        color: "from-purple-500 to-indigo-600",
        mockup: (
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[280px] mx-auto">
                <h4 className="font-bold text-gray-900 mb-3">Gestión de Contactos</h4>
                <div className="flex gap-1 mb-4 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">Mis Contactos</span>
                    <span className="px-2 py-1 text-gray-500">Descubrir</span>
                    <span className="px-2 py-1 text-gray-500">Empresas</span>
                </div>
                <div className="space-y-3">
                    {["GABO", "María López", "Carlos Tech"].map((name, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-pink-500' : 'bg-green-500'}`}>
                                {name[0]}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-900">{name}</p>
                                <p className="text-[10px] text-gray-500">Profesional B2B</p>
                            </div>
                            <button className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded-lg font-bold">Chat</button>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: 4,
        title: "Perfil Profesional",
        description: "Crea tu perfil empresarial, muestra tu marca y conecta con clientes potenciales.",
        icon: UserCircle,
        color: "from-orange-500 to-red-500",
        mockup: (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[280px] mx-auto">
                <div className="h-16 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <div className="px-4 pb-4 -mt-8">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl mb-2">
                        👤
                    </div>
                    <h4 className="font-black text-gray-900 text-lg">Tu Nombre</h4>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full mb-3">SOCIO B2BCHAT</span>
                    <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                        <div className="h-2 bg-gray-100 rounded-full w-2/3"></div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
                        Editar Perfil
                    </button>
                </div>
            </div>
        )
    },
    {
        id: 5,
        title: "IA Integrada",
        description: "Asistente inteligente que te ayuda a responder, analizar conversaciones y cerrar negocios.",
        icon: Sparkles,
        color: "from-pink-500 to-rose-600",
        mockup: (
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[280px] mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900">Asistente IA</p>
                        <p className="text-[10px] text-green-500">Siempre disponible</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3">
                        <p className="text-sm text-gray-700">¿Cómo puedo mejorar mis ventas?</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-sm p-3">
                        <p className="text-sm text-white">Te sugiero optimizar tu perfil, conectar con 5 empresas del sector...</p>
                    </div>
                </div>
            </div>
        )
    }
];

export default function AppShowcaseCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % appFeatures.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev + 1) % appFeatures.length);
    };

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev - 1 + appFeatures.length) % appFeatures.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentSlide(index);
    };

    const feature = appFeatures[currentSlide];
    const Icon = feature.icon;

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                        ✨ Descubre B2BChat
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Todo lo que necesitas para<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            escalar tu negocio B2B
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Una plataforma completa para gestionar conversaciones, contactos y campañas empresariales.
                    </p>
                </div>

                {/* Carousel */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                        {/* Left: Phone Mockup */}
                        <div className="relative flex-shrink-0 order-2 lg:order-1">
                            {/* Phone Frame */}
                            <div className="relative w-[320px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10"></div>

                                {/* Screen */}
                                <div className={`w-full h-full rounded-[2.5rem] bg-gradient-to-br ${feature.color} overflow-hidden flex items-center justify-center p-6 transition-all duration-500`}>
                                    <div className="transform transition-all duration-500 hover:scale-105">
                                        {feature.mockup}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                                <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center">
                                <span className="text-white font-black text-xl">B2B</span>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 text-center lg:text-left order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Función {currentSlide + 1} de {appFeatures.length}</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 transition-all duration-300">
                                {feature.title}
                            </h3>

                            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                                {feature.description}
                            </p>

                            {/* Navigation Arrows */}
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Dots */}
                            <div className="flex items-center justify-center lg:justify-start gap-2">
                                {appFeatures.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`transition-all duration-300 rounded-full ${index === currentSlide
                                                ? 'w-8 h-3 bg-blue-600'
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
