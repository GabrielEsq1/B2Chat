"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    MessageSquare,
    TrendingUp,
    Users,
    Megaphone,
    ArrowRight,
    Store,
} from "lucide-react";
import StoriesRail from "@/components/ads/StoriesRail";
import BookingBanner from "@/components/dashboard/BookingBanner";
import { useLanguage } from "@/context/LanguageContext";

interface UserStore {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: Date;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        conversations: 0,
        campaigns: 0,
        socialConnections: 0,
        messages: 0,
    });
    const [stores, setStores] = useState<UserStore[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchStats();
            fetchStores();
        }
    }, [status, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/user/stats');
            if (res.ok) {
                const data = await res.json();
                setStats({
                    conversations: data.conversations || 0,
                    campaigns: data.campaigns || 0,
                    socialConnections: data.socialConnections || 0,
                    messages: data.messages || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchStores = async () => {
        try {
            setLoadingStores(true);
            const res = await fetch('/api/stores');
            if (res.ok) {
                const data = await res.json();
                setStores(data.stores || []);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoadingStores(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 pt-16">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {t('dashboard.welcome', { name: session?.user?.name?.split(' ')[0] || '' })}
                        </h2>
                        <p className="text-blue-100">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                    <BookingBanner />
                </div>

                {/* Stories Rail */}
                <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-8">
                    <StoriesRail />
                </div>

                {/* GNOSIS Hub Banner */}
                <div className="mb-8 p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
                            <Image
                                src="/gnosis_logo.png"
                                alt="GNOSIS Logo"
                                width={120}
                                height={120}
                                className="relative rounded-3xl shadow-2xl transition-transform duration-500 bg-white p-2"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-black uppercase tracking-[0.2em] mb-4 border border-blue-400/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Ecosistema GNOSIS Hub
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                                Potencia tu negocio con el <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Hub Empresarial</span>
                            </h2>
                            <p className="text-blue-100/90 text-lg md:text-xl font-medium mb-8 max-w-2xl leading-relaxed">
                                Aprovecha la integración total con <span className="text-white font-bold">WhatsApp</span> y usa todas las aplicaciones del ecosistema GNOSIS para vender, cobrar y conectar como nunca antes.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <a
                                    href="https://creatiendasgit1.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl active:scale-95 group"
                                >
                                    <Store className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    Visitar Creatiendas
                                    <ArrowRight className="h-5 w-5" />
                                </a>
                                <p className="text-blue-300 text-sm font-bold flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    +5,000 empresas conectadas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <MessageSquare className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.conversations}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Conversaciones</h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Megaphone className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.campaigns}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Campañas</h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.socialConnections}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Conexiones</h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{stats.messages}</span>
                        </div>
                        <h3 className="text-gray-600 font-medium">Mensajes</h3>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href="/chat"
                        className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chat B2B</h3>
                        <p className="text-gray-600 text-sm">
                            Inicia conversaciones con empresas y profesionales
                        </p>
                    </Link>

                    <Link
                        href="/contacts"
                        className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Red de Negocios</h3>
                        <p className="text-gray-600 text-sm">
                            Gestiona tus contactos, descubre profesionales y expande tu red de influencia B2B.
                        </p>
                    </Link>

                    <Link
                        href="/ads-manager"
                        className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                <Megaphone className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Gestor de Anuncios</h3>
                        <p className="text-gray-600 text-sm">
                            Crea y gestiona tus campañas publicitarias
                        </p>
                    </Link>

                    {loadingStores ? (
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                            </div>
                        </div>
                    ) : stores.length > 0 ? (
                        <a
                            href={`https://creatiendasgit1.vercel.app/stores/${stores[0].slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Mi Tienda</h3>
                            <p className="text-gray-600 text-sm">
                                {stores[0].name} - Ver en Creatiendas
                            </p>
                        </a>
                    ) : (
                        <a
                            href="https://creatiendasgit1.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.cta_cross_title')}</h3>
                            <p className="text-gray-600 text-sm z-10 relative">
                                {t('dashboard.cta_cross_text')}
                            </p>
                        </a>
                    )}
                </div>
            </div>
        </div >
    );
}
