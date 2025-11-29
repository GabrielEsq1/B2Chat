"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Check, Clock, Building, Globe } from "lucide-react";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    name: string;
    position?: string;
    industry?: string;
    bio?: string;
    avatar?: string;
    profilePicture?: string;
    friendStatus?: {
        type: "sent" | "received";
        status: "PENDING" | "ACCEPTED" | "REJECTED";
    } | null;
}

export default function DiscoverPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sendingId, setSendingId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (userId: string) => {
        try {
            setSendingId(userId);
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: userId }),
            });

            if (res.ok) {
                // Update local state
                setUsers(prev => prev.map(u => {
                    if (u.id === userId) {
                        return {
                            ...u,
                            friendStatus: { type: 'sent', status: 'PENDING' }
                        };
                    }
                    return u;
                }));
            } else {
                alert("Error al enviar solicitud");
            }
        } catch (error) {
            console.error('Error sending request:', error);
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Descubrir Empresas</h1>
                    <p className="text-gray-600 mb-8">Encuentra y conecta con otras empresas y profesionales B2B.</p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cargo, industria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No se encontraron resultados para "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-500">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium truncate">{user.position || 'Sin cargo'}</p>
                                        {user.industry && (
                                            <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                                                <Building className="h-3 w-3" />
                                                <span className="truncate">{user.industry}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {user.bio && (
                                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                                )}

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    {user.friendStatus?.status === 'ACCEPTED' ? (
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium cursor-default"
                                            disabled
                                        >
                                            <Check className="h-4 w-4" />
                                            Conectado
                                        </button>
                                    ) : user.friendStatus?.status === 'PENDING' ? (
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium cursor-default"
                                            disabled
                                        >
                                            <Clock className="h-4 w-4" />
                                            Pendiente
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(user.id)}
                                            disabled={sendingId === user.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {sendingId === user.id ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-4 w-4" />
                                                    Conectar
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
