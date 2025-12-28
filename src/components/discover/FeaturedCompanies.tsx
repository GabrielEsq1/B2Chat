"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Globe, ArrowRight, Loader2 } from "lucide-react";

interface Company {
    id: string;
    name: string;
    industry: string;
    city: string;
    website: string;
    description: string;
    isActivated: boolean;
}

export default function FeaturedCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await fetch("/api/companies/featured");
            const data = await res.json();
            if (data.success) {
                setCompanies(data.companies);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async () => {
        if (!selectedCompany || !message.trim()) return;

        setSending(true);
        try {
            const res = await fetch("/api/companies/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: selectedCompany.id,
                    message: message
                })
            });

            const data = await res.json();

            if (data.success) {
                // Show success landing page instead of alert
                setShowSuccess(true);
                fetchActiveUsers(); // Load active users for suggestions
            } else {
                alert("❌ " + data.error);
                setSelectedCompany(null);
                setMessage("");
            }
        } catch (error) {
            alert("Error al enviar invitación");
            setSelectedCompany(null);
            setMessage("");
        } finally {
            setSending(false);
        }
    };

    const fetchActiveUsers = async () => {
        try {
            const res = await fetch("/api/users/active?limit=10");
            const data = await res.json();
            if (data.users) {
                setActiveUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching active users:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Fixed Top Header */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 py-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Empresas relevantes en tu mercado
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Conecta directamente con empresas líderes en Colombia
                    </p>
                </div>
            </div>

            {/* Scrollable Content - Company Cards */}
            <div className="flex-1 overflow-y-auto pt-32 pb-20 md:pb-4">
                <div className="px-4 py-4">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                        Perfil disponible
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {company.name}
                                </h3>

                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        <span>{company.industry}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{company.city}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {company.description}
                                </p>

                                <p className="text-xs text-gray-400 mb-3">
                                    Esta empresa aún no gestiona conversaciones desde B2BChat
                                </p>

                                <button
                                    onClick={() => setSelectedCompany(company)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    Contactar por B2BChat
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Success Landing Page */}
            {showSuccess && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-4 py-6 md:p-6">
                        {/* Header */}
                        <div className="text-center mb-6 pt-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">¡Invitación Enviada!</h2>
                            <p className="text-sm md:text-base text-gray-600 px-4">Le notificaremos a <strong>{selectedCompany?.name}</strong> sobre tu interés</p>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6">
                            <h3 className="font-bold text-blue-900 mb-2 text-sm md:text-base">📬 ¿Qué pasa ahora?</h3>
                            <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                                <li>• La empresa recibirá tu mensaje por email</li>
                                <li>• Si se registran en B2BChat, podrán responderte</li>
                                <li>• Te notificaremos cuando acepten tu invitación</li>
                            </ul>
                        </div>

                        {/* Active Users Section */}
                        <div className="mb-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">💬 Mientras tanto, chatea con usuarios activos</h3>
                            <p className="text-xs md:text-sm text-gray-600 mb-3">Estas personas ya están en B2BChat y pueden responder ahora mismo</p>

                            {/* Horizontal Scroll */}
                            <div className="overflow-x-auto pb-3 -mx-4 px-4">
                                <div className="flex gap-3 min-w-max">
                                    {activeUsers.map((user) => (
                                        <div key={user.id} className="flex-shrink-0 w-32 md:w-40 bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-lg transition-shadow">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-base md:text-lg font-bold text-blue-600">{user.name?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <h4 className="text-xs md:text-sm font-semibold text-gray-900 text-center mb-1 truncate">{user.name}</h4>
                                            <p className="text-xs text-gray-500 text-center mb-2 truncate">{user.position || 'Usuario'}</p>
                                            <button
                                                onClick={() => {
                                                    window.location.href = `/chat?userId=${user.id}`;
                                                }}
                                                className="w-full bg-blue-600 text-white text-xs py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Chatear
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                onClick={() => window.location.href = '/chat'}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-sm md:text-base"
                            >
                                Ir al Chat
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    setSelectedCompany(null);
                                    setMessage("");
                                }}
                                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium text-sm md:text-base"
                            >
                                Seguir Explorando
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            {selectedCompany && !showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Contactar a {selectedCompany.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Este mensaje será entregado a la empresa como una invitación empresarial.
                        </p>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ejemplo: Hola, vimos tu perfil. ¿Tienes disponibilidad para discutir una oportunidad de negocio?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4 min-h-[120px]"
                        />

                        <p className="text-xs text-gray-500 mb-6">
                            Si la empresa aún no usa B2BChat, le enviaremos una invitación directa para continuar la conversación.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCompany(null);
                                    setMessage("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleContact}
                                disabled={!message.trim() || sending}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Invitación"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
