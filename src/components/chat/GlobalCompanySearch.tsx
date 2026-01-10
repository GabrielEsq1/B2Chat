"use client";

import { useState } from "react";
import { Search, X, Building2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Company {
    id: string;
    name: string;
    users: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
        position: string | null;
        industry: string | null;
    }[];
}

interface GlobalCompanySearchProps {
    onClose: () => void;
    onStartChat: (userId: string, companyName: string) => void;
}

export default function GlobalCompanySearch({ onClose, onStartChat }: GlobalCompanySearchProps) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/companies/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (res.ok) {
                setCompanies(data.companies || []);
            } else {
                console.error("Error searching companies:", data.error);
            }
        } catch (error) {
            console.error("Error searching companies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{t('chat.sidebar.global_network')}</h3>
                            <p className="text-sm text-blue-100">{t('chat.sidebar.global_search_description', { defaultValue: 'Encuentra empresas de todo el mundo' })}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        title={t('common.close', { defaultValue: 'Cerrar' })}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('chat.sidebar.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium w-full md:w-auto"
                        >
                            {loading ? t('common.loading') : t('chat.sidebar.search_placeholder').split('...')[0]}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">{t('chat.sidebar.scanning', { defaultValue: 'Buscando empresas...' })}</p>
                        </div>
                    ) : !searched ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {t('chat.sidebar.global_search_description')}
                            </h4>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {t('chat.sidebar.no_global_results')}
                            </h4>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 mb-4">
                                {companies.length} empresa{companies.length !== 1 ? "s" : ""} encontrada{companies.length !== 1 ? "s" : ""}
                            </p>
                            {companies.map((company) => {
                                // For local users, we have a direct contact in users[0]
                                // For external companies, we don't have users array populated yet in the same way, 
                                // or we might have structured it differently in search/route.ts.
                                // Let's normalize it.

                                const isExternal = !company.users || company.users.length === 0 || (company as any).isLocal === false;
                                // In search/route.ts we map external results to have an 'id' that is external (e.g. gmb-...)
                                // and isLocal: false.

                                // Local results have users populated.
                                const contact = !isExternal ? company.users[0] : null;

                                return (
                                    <div
                                        key={company.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">
                                                            {company.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {contact ? (contact.industry || t('common.optional', { defaultValue: 'Industria no especificada' })) : ((company as any).industry || (company as any).source)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Details for Local */}
                                                {contact && (
                                                    <div className="ml-15 space-y-1">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Contacto:</span> {contact.name}
                                                        </p>
                                                        {contact.position && (
                                                            <p className="text-sm text-gray-600">
                                                                {contact.position}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Details for External */}
                                                {isExternal && (
                                                    <div className="ml-15 space-y-1">
                                                        <p className="text-sm text-gray-700 italic">
                                                            Empresa externa ({(company as any).source})
                                                        </p>
                                                        {(company as any).address && (
                                                            <p className="text-sm text-gray-500">
                                                                {(company as any).address}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                            </div>

                                            <button
                                                onClick={async () => {
                                                    if (isExternal) {
                                                        // Create provisional company first
                                                        try {
                                                            const res = await fetch('/api/companies/provisional', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    externalId: company.id, // e.g. gmb-ChIJ...
                                                                    source: (company as any).source,
                                                                    name: company.name,
                                                                    address: (company as any).address,
                                                                    phone: (company as any).phone, // Sometimes undefined for GMB search results unless details fetched
                                                                    email: (company as any).email,
                                                                    industry: (company as any).industry,
                                                                    enrichmentData: company
                                                                })
                                                            });
                                                            const data = await res.json();
                                                            if (data.success && data.userId) {
                                                                onStartChat(data.userId, company.name);
                                                                onClose();
                                                            } else {
                                                                alert("Error al conectar con empresa externa");
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert("Error de conexión");
                                                        }
                                                    } else if (contact) {
                                                        onStartChat(contact.id, company.name);
                                                        onClose();
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 flex-shrink-0"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                {t('chat.sidebar.new_chat')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
