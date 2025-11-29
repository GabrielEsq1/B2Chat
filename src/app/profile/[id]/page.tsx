"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
    isBot: boolean;
    botPersonality: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetchUser();
        }
    }, [params?.id]);

    const fetchUser = async () => {
        if (!params?.id) return;
        try {
            const res = await fetch(`/api/users/${params.id}`);
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async () => {
        if (!params?.id) return;
        // Navigate to chat with this user
        router.push(`/chat?userId=${params.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-gray-600 mb-4">Usuario no encontrado</p>
                <button
                    onClick={() => router.push("/users")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Volver a Usuarios
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Cover */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48"></div>

            <div className="max-w-4xl mx-auto px-4 -mt-24">
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="bg-white rounded-full p-2 shadow-lg -mt-16">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                                {user.avatar || user.name.charAt(0)}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 mt-8">
                            <div className="flex items-start justify-between">
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
                                    {user.isBot && (
                                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mt-2 ml-2 border border-purple-200">
                                            🤖 Asistente IA
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {session?.user?.email === user.email && (
                                        <button
                                            onClick={() => router.push(`/profile/${user.id}/edit`)}
                                            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                                        >
                                            ✏️ Editar
                                        </button>
                                    )}
                                    <button
                                        onClick={startChat}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                                    >
                                        💬 Enviar Mensaje
                                    </button>
                                </div>
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 mt-4 leading-relaxed">{user.bio}</p>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {user.email && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-xl">📧</span>
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-xl">📱</span>
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-xl">🌐</span>
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {user.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bot Info (if applicable) */}
                {user.isBot && user.botPersonality && (
                    <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 mb-6">
                        <h2 className="text-xl font-bold text-purple-900 mb-3">🤖 Asistente Virtual con IA</h2>
                        <p className="text-purple-800">
                            Este es un asistente virtual impulsado por inteligencia artificial de Google Gemini.
                            Puede ayudarte con consultas de negoc ios, análisis de mercado, y más.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                Respuestas instantáneas
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                Disponible 24/7
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                100% Gratis
                            </span>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                    ← Volver
                </button>
            </div>
        </div>
    );
}
