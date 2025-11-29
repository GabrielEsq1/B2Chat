"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MessageSquare, Mail, Phone, Building, Globe, Briefcase } from "lucide-react";

export default function ContactProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params) return;
        const fetchContact = async () => {
            try {
                const res = await fetch(`/api/contacts/${params.id}`);
                const data = await res.json();
                setContact(data);
            } catch (error) {
                console.error('Error fetching contact:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchContact();
        }
    }, [params]);

    const handleStartChat = async () => {
        if (!params) return;
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: params.id }),
            });

            const data = await res.json();
            if (data.conversation) {
                router.push('/chat');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando perfil...</div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Contacto no encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <button
                    onClick={() => router.push('/contacts')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Volver a Contactos
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Name */}
                        <div className="flex items-end -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                {contact.profilePicture ? (
                                    <img src={contact.profilePicture} alt={contact.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-600">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="ml-6 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
                                <p className="text-gray-600">{contact.position || 'Sin cargo'}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Teléfono</p>
                                    <p className="font-medium">{contact.phone}</p>
                                </div>
                            </div>

                            {contact.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{contact.email}</p>
                                    </div>
                                </div>
                            )}

                            {contact.industry && (
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Industria</p>
                                        <p className="font-medium">{contact.industry}</p>
                                    </div>
                                </div>
                            )}

                            {contact.company && (
                                <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Empresa</p>
                                        <p className="font-medium">{contact.company.name}</p>
                                    </div>
                                </div>
                            )}

                            {contact.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Sitio Web</p>
                                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-700">
                                            {contact.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        {contact.bio && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Biografía</h3>
                                <p className="text-gray-600">{contact.bio}</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleStartChat}
                            className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Iniciar Conversación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
