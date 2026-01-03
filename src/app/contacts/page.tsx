"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    User,
    MessageSquare,
    Building,
    Globe,
    ArrowLeft,
    UserPlus,
    Check,
    X,
    Clock,
    Search,
    Building2,
    MapPin,
    ArrowRight,
    Loader2,
    Users
} from "lucide-react";
import FeaturedCompanies from "@/components/discover/FeaturedCompanies";

interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    position?: string;
    industry?: string;
    website?: string;
    profilePicture?: string;
    company?: {
        name: string;
    };
}

interface FriendRequest {
    id: string;
    requester: {
        id: string;
        name: string;
        position?: string;
        industry?: string;
        avatar?: string;
        isBot: boolean;
    };
    status: string;
}

interface DiscoveryUser {
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
    isLocal?: boolean;
    source?: string;
    phone?: string;
    address?: string;
    domain?: string;
    company?: string;
}

function NetworkingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = (searchParams?.get('tab') as any) || 'contacts';

    const [activeTab, setActiveTab] = useState<'contacts' | 'discover' | 'companies' | 'requests'>(initialTab);

    // Contacts & Requests State
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Discovery State
    const [discoveryUsers, setDiscoveryUsers] = useState<DiscoveryUser[]>([]);
    const [discoverySearch, setDiscoverySearch] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contactsRes, requestsRes] = await Promise.all([
                fetch('/api/contacts'),
                fetch('/api/friends/request')
            ]);

            const contactsData = await contactsRes.json();
            const requestsData = await requestsRes.json();

            if (contactsData.contacts) setContacts(contactsData.contacts);
            if (requestsData.requests) setRequests(requestsData.requests);

            // If starting on discover tab, fetch users
            if (activeTab === 'discover') {
                await fetchDiscoveryUsers();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscoveryUsers = async (query = discoverySearch, industry = selectedIndustry) => {
        try {
            const params = new URLSearchParams();
            if (query) params.set("query", query);
            if (industry) params.set("industry", industry);

            const res = await fetch(`/api/companies/search?${params}`);
            const data = await res.json();

            const combinedUsers = [
                ...(data.localResults || []),
                ...(data.externalResults || [])
            ];

            setDiscoveryUsers(combinedUsers);
        } catch (error) {
            console.error("Error fetching discovery users:", error);
        }
    };

    const handleTabChange = (tab: 'contacts' | 'discover' | 'companies' | 'requests') => {
        setActiveTab(tab);
        if (tab === 'discover' && discoveryUsers.length === 0) {
            fetchDiscoveryUsers();
        }
    };

    const handleStartChat = (contactId: string) => {
        router.push(`/chat?userId=${contactId}`);
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/friends/request/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACCEPTED' })
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== requestId));
                loadData();
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/friends/request/${requestId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== requestId));
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
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
                fetchDiscoveryUsers();
            }
        } catch (error) {
            console.error("Error sending request:", error);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && activeTab !== 'companies') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Cargando Gestión de Contactos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Gestión de Contactos</h1>
                                <p className="text-sm text-gray-500">Gestiona contactos, descubre personas y empresas</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto scrollbar-hide gap-1 md:gap-4 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {[
                            { id: 'contacts', label: 'Mis Contactos', count: contacts.length },
                            { id: 'discover', label: 'Descubrir Personas', count: null },
                            { id: 'companies', label: 'Empresas', count: null },
                            { id: 'requests', label: 'Solicitudes', count: requests.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)}
                                className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== null && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contextual Search/Filter Bar */}
                    <div className="mt-4">
                        {activeTab === 'contacts' && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en mis contactos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        )}
                        {activeTab === 'discover' && (
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, cargo o industria..."
                                        value={discoverySearch}
                                        onChange={(e) => setDiscoverySearch(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && fetchDiscoveryUsers()}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <select
                                    value={selectedIndustry}
                                    onChange={(e) => {
                                        setSelectedIndustry(e.target.value);
                                        fetchDiscoveryUsers(discoverySearch, e.target.value);
                                    }}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                                >
                                    <option value="">Todas las industrias</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Logística">Logística</option>
                                    <option value="Consultoría">Consultoría</option>
                                    <option value="Finanzas">Finanzas</option>
                                </select>
                                <button
                                    onClick={() => fetchDiscoveryUsers()}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                >
                                    Buscar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'contacts' && (
                    filteredContacts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {searchTerm ? 'No se encontraron resultados' : 'Aún no tienes contactos'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                                Empieza a construir tu red profesional conectando con otros usuarios del ecosistema.
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => handleTabChange('discover')}
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                                >
                                    Descubrir personas <ArrowRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredContacts.map((contact) => (
                                <ContactCard key={contact.id} contact={contact} onChat={handleStartChat} />
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'discover' && (
                    discoveryUsers.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Explora la red</h3>
                            <p className="text-gray-500">Busca profesionales y empresas para expandir tu red.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {discoveryUsers.map((user) => (
                                <DiscoveryCard
                                    key={user.id}
                                    user={user}
                                    onConnect={sendFriendRequest}
                                    onChat={(id) => router.push(`/chat?userId=${id}`)}
                                />
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'companies' && (
                    <div className="-mt-32"> {/* Pull up to overlap with Networking header if needed, but FeaturedCompanies has its own header */}
                        <FeaturedCompanies />
                    </div>
                )}

                {activeTab === 'requests' && (
                    requests.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Todo al día</h3>
                            <p className="text-gray-500">No tienes solicitudes de conexión pendientes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onAccept={handleAcceptRequest}
                                    onReject={handleRejectRequest}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default function NetworkingPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Cargando...</p>
            </div>
        }>
            <NetworkingContent />
        </Suspense>
    );
}

// Sub-components for better organization

function ContactCard({ contact, onChat }: { contact: Contact, onChat: (id: string) => void }) {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                    {contact.profilePicture ? (
                        <img src={contact.profilePicture} alt={contact.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-blue-600">
                            {contact.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{contact.name}</h3>
                    <p className="text-sm text-gray-500 font-medium truncate">{contact.position || 'Profesional B2B'}</p>
                    {contact.company && (
                        <p className="text-xs text-blue-600 font-bold truncate flex items-center gap-1 mt-1 uppercase tracking-wider">
                            <Building className="h-3 w-3" />
                            {contact.company.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="w-5 text-center">📱</span>
                    <span className="font-medium">{contact.phone}</span>
                </div>
                {contact.email && (
                    <div className="flex items-center gap-2">
                        <span className="w-5 text-center">✉️</span>
                        <span className="truncate font-medium">{contact.email}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onChat(contact.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
                >
                    <MessageSquare className="h-4 w-4" />
                    Chatear
                </button>
                <button
                    onClick={() => window.location.href = `/profile/${contact.id}`}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                    Perfil
                </button>
            </div>
        </div>
    );
}

function DiscoveryCard({ user, onConnect, onChat }: { user: DiscoveryUser, onConnect: (id: string) => void, onChat: (id: string) => void }) {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-6 pb-6 -mt-10">
                <div className="flex items-end justify-between mb-4">
                    <div className="bg-white rounded-2xl p-1 shadow-md group-hover:scale-105 transition-transform">
                        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-black">
                            {user.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                    </div>
                    {user.isBot && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full border border-purple-200 uppercase tracking-widest">
                            🤖 AI Bot
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-3">{user.position || 'Profesional B2B'}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {user.industry && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase tracking-wider">
                            {user.industry}
                        </span>
                    )}
                    {!user.isLocal && user.source && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-black rounded uppercase tracking-wider">
                            🌐 {user.source}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = `/profile/${user.id}`}
                        className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 font-bold text-sm transition-all active:scale-95 border border-gray-100"
                    >
                        Ver Perfil
                    </button>

                    {!user.friendStatus && (
                        <button
                            onClick={() => onConnect(user.id)}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm transition-all shadow-lg shadow-blue-100 active:scale-95"
                        >
                            Conectar
                        </button>
                    )}

                    {user.friendStatus?.status === "PENDING" && user.friendStatus?.type === "sent" && (
                        <button
                            disabled
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
                        >
                            Enviada
                        </button>
                    )}

                    {user.friendStatus?.status === "ACCEPTED" && (
                        <button
                            onClick={() => onChat(user.id)}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            Mensaje
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RequestCard({ request, onAccept, onReject }: { request: FriendRequest, onAccept: (id: string) => void, onReject: (id: string) => void }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
                    {request.requester.avatar ? (
                        <img src={request.requester.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xl font-black text-blue-600">
                            {request.requester.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{request.requester.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{request.requester.position || 'Profesional B2B'}</p>
                    {request.requester.industry && (
                        <p className="text-[10px] font-black text-blue-600 uppercase mt-1 tracking-wider">{request.requester.industry}</p>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <Check className="h-4 w-4 stroke-[3]" />
                    Aceptar
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all border border-gray-100"
                >
                    <X className="h-4 w-4 stroke-[3]" />
                    Rechazar
                </button>
            </div>
        </div>
    );
}
