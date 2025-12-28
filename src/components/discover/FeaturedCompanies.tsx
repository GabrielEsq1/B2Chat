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
                alert("✅ Invitación enviada exitosamente");
                setSelectedCompany(null);
                setMessage("");
            } else {
                alert("❌ " + data.error);
            }
        } catch (error) {
            alert("Error al enviar invitación");
        } finally {
            setSending(false);
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
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Empresas relevantes en tu mercado
                </h2>
                <p className="text-gray-600">
                    Conecta directamente con empresas líderes en Colombia
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Contact Modal */}
            {selectedCompany && (
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
