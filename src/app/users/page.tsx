"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    position: string | null;
    industry: string | null;
    bio: string | null;
    avatar: string | null;
    isBot: boolean;
    website: string | null;
    friendStatus: { type: "sent" | "received"; status: string } | null;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (selectedIndustry) params.set("industry", selectedIndustry);

            const res = await fetch(`/api/users?${params}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (userId: string) => {
        try {
            const res = await fetch("/api/friends/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId })
            });

            if (res.ok) {
                fetchUsers(); // Refresh
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };

    const handleSearch = () => {
        setLoading(true);
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Descubrir Personas</h1>
                            <p className="text-gray-600">Conecta con profesionales B2B</p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            ← Volver
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, industria, posición..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las industrias</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Logística">Logística</option>
                            <option value="Consultoría">Consultoría</option>
                            <option value="Finanzas">Finanzas</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {users.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>

                                {/* Avatar & Info */}
                                <div className="px-6 pb-6">
                                    <div className="flex items-start -mt-12 mb-4">
                                        <div className="bg-white rounded-full p-1 shadow-lg">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                                {user.avatar || user.name.charAt(0)}
                                            </div>
                                        </div>
                                        {user.isBot && (
                                            <span className="ml-auto mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                                🤖 Bot IA
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                                    {user.position && (
                                        <p className="text-sm text-gray-600 mb-1">{user.position}</p>
                                    )}
                                    {user.industry && (
                                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded mb-3">
                                            {user.industry}
                                        </span>
                                    )}

                                    {user.bio && (
                                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{user.bio}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/profile/${user.id}`)}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                        >
                                            Ver Perfil
                                        </button>

                                        {!user.friendStatus && (
                                            <button
                                                onClick={() => sendFriendRequest(user.id)}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                            >
                                                Conectar
                                            </button>
                                        )}

                                        {user.friendStatus?.status === "PENDING" && user.friendStatus?.type === "sent" && (
                                            <button
                                                disabled
                                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                                            >
                                                Solicitud Enviada
                                            </button>
                                        )}

                                        {user.friendStatus?.status === "ACCEPTED" && (
                                            <button
                                                onClick={() => router.push(`/chat?userId=${user.id}`)}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                            >
                                                💬 Chatear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
