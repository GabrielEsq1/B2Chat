"use client";

import { useState } from "react";
import { Search, X, Building2, MessageSquare } from "lucide-react";

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
                            <h3 className="text-xl font-bold text-white">Buscar Empresas</h3>
                            <p className="text-sm text-blue-100">Encuentra empresas de todo el mundo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        title="Cerrar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de empresa..."
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
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Buscando empresas...</p>
                        </div>
                    ) : !searched ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Busca empresas globalmente
                            </h4>
                            <p className="text-gray-600">
                                Ingresa el nombre de una empresa para comenzar
                            </p>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No se encontraron empresas
                            </h4>
                            <p className="text-gray-600">
                                Intenta con otro término de búsqueda
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 mb-4">
                                {companies.length} empresa{companies.length !== 1 ? "s" : ""} encontrada{companies.length !== 1 ? "s" : ""}
                            </p>
                            {companies.map((company) => {
                                const contact = company.users[0];
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
                                                        {contact && (
                                                            <p className="text-sm text-gray-600">
                                                                {contact.industry || "Industria no especificada"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
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
                                                        <p className="text-sm text-gray-600">
                                                            {contact.phone}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {contact && (
                                                <button
                                                    onClick={() => {
                                                        onStartChat(contact.id, company.name);
                                                        onClose();
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 flex-shrink-0"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Chatear
                                                </button>
                                            )}
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
