"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MessageSquare, Building, Globe, ArrowLeft, UserPlus, Check, X, Clock } from "lucide-react";

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

export default function ContactsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'contacts' | 'requests'>('contacts');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
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
                // Remove from requests and reload contacts
                setRequests(prev => prev.filter(r => r.id !== requestId));
                loadData(); // Reload to get the new contact
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

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Volver"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de Contactos</h1>
                                <p className="text-sm text-gray-600">Conecta y gestiona tu red B2B</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/discover')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Buscar Empresas</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contacts'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Mis Contactos ({contacts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requests'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Solicitudes ({requests.length})
                        </button>
                    </div>

                    {/* Search (Only for contacts) */}
                    {activeTab === 'contacts' && (
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'contacts' ? (
                    filteredContacts.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'No se encontraron contactos' : 'No tienes contactos aún'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => router.push('/discover')}
                                    className="text-blue-600 hover:underline"
                                >
                                    Descubrir empresas para conectar
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                                >
                                    {/* Avatar */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {contact.profilePicture ? (
                                                <img src={contact.profilePicture} alt={contact.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-600">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{contact.position || 'Sin cargo'}</p>
                                            {contact.company && (
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                                                    <Building className="h-3 w-3" />
                                                    {contact.company.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600 truncate">📱 {contact.phone}</p>
                                        {contact.email && (
                                            <p className="text-sm text-gray-600 truncate">✉️ {contact.email}</p>
                                        )}
                                        {contact.industry && (
                                            <p className="text-sm text-gray-600 truncate">🏢 {contact.industry}</p>
                                        )}
                                        {contact.website && (
                                            <a
                                                href={contact.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-700 truncate flex items-center gap-1"
                                            >
                                                <Globe className="h-3 w-3" />
                                                {contact.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStartChat(contact.id)}
                                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Chatear
                                        </button>
                                        <button
                                            onClick={() => router.push(`/profile/${contact.id}`)}
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Ver Perfil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // Requests Tab
                    requests.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No tienes solicitudes pendientes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {request.requester.avatar ? (
                                                <img src={request.requester.avatar} alt={request.requester.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-bold text-gray-500">
                                                    {request.requester.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{request.requester.name}</h3>
                                            <p className="text-sm text-gray-600">{request.requester.position || 'Sin cargo'}</p>
                                            {request.requester.industry && (
                                                <p className="text-xs text-gray-500 mt-1">{request.requester.industry}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                        >
                                            <Check className="h-4 w-4" />
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                        >
                                            <X className="h-4 w-4" />
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
