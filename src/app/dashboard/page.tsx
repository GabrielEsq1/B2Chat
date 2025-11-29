"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    MessageSquare,
    TrendingUp,
    Users,
    Megaphone,
    ArrowRight,
    Store,
} from "lucide-react";

interface Store {
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
    const [stats, setStats] = useState({
        conversations: 0,
        campaigns: 0,
        socialConnections: 0,
        messages: 0,
    });
    const [stores, setStores] = useState<Store[]>([]);
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
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        ¡Hola, {session?.user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-blue-100">
                        Gestiona tus conversaciones, campañas y conexiones empresariales
                    </p>
                </div>

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
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Contactos</h3>
                        <p className="text-gray-600 text-sm">
                            Gestiona tu red de contactos empresariales
                        </p>
                    </Link>

                    <Link
                        href="/users"
                        className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Descubrir Personas</h3>
                        <p className="text-gray-600 text-sm">
                            Explora usuarios, bots IA y expande tu red B2B
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
                            href={`https://creatiendas.com/stores/${stores[0].slug}`}
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
                            href="https://creatiendasgit1.vercel.app/"
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Crear Mi Tienda</h3>
                            <p className="text-gray-600 text-sm">
                                Crea tu tienda online en Creatiendas
                            </p>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
