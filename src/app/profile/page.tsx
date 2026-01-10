"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Store, Edit, ExternalLink } from "lucide-react";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string | null;
    industry: string | null;
    bio: string | null;
    website: string | null;
    avatar: string | null;
}

export default function MyProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login"); // Use /login instead of /auth/login as per system logs
        } else if (status === "authenticated" && session?.user?.id) {
            router.replace(`/profile/${session.user.id}`);
        }
    }, [status, session, router]);

    const fetchUser = async (userId: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`);
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Should have redirected
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Cover */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-48"></div>

            <div className="max-w-4xl mx-auto px-4 -mt-24">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="bg-white rounded-full p-2 shadow-lg -mt-16 mx-auto md:mx-0">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                                {user.avatar || user.name.charAt(0)}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 mt-4 md:mt-8 w-full text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                    {user.position && (
                                        <p className="text-lg text-gray-600 mt-1">{user.position}</p>
                                    )}
                                    {user.industry && (
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mt-2">
                                            {user.industry}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => router.push(`/profile/${user.id}/edit`)}
                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Perfil
                                    </button>

                                    {/* BUILD STORE BUTTON - Requested Feature */}
                                    <a
                                        href="https://creatiendas.co"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2 shadow-md transition-all transform hover:scale-105"
                                    >
                                        <Store className="w-4 h-4" />
                                        Crear Tienda
                                        <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                </div>
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 mt-6 leading-relaxed border-t pt-4 border-gray-100">
                                    {user.bio}
                                </p>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-gray-50 p-4 rounded-lg">
                                {user.email && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <span className="text-xl">📧</span>
                                        <span className="text-sm font-medium">{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <span className="text-xl">📱</span>
                                        <span className="text-sm font-medium">{user.phone}</span>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center gap-3 text-gray-600 sm:col-span-2">
                                        <span className="text-xl">🌐</span>
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:underline truncate"
                                        >
                                            {user.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Sections Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Estadísticas</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Visualizaciones de perfil</span>
                                <span className="font-bold text-gray-900">124</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Conexiones</span>
                                <span className="font-bold text-gray-900">45</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm p-6 border border-indigo-100">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-2">¿Quieres vender más?</h3>
                        <p className="text-indigo-700 text-sm mb-4">
                            Crea tu propia tienda online en minutos y conecta con miles de compradores B2B.
                        </p>
                        <a
                            href="https://creatiendas.co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                        >
                            Ir al Constructor de Tiendas
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
