"use client";

import FeaturedCompanies from "@/components/discover/FeaturedCompanies";

export default function DiscoverPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Fixed Top Navbar with Search */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar empresas, sectores..."
                            className="w-full rounded-full border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="overflow-x-auto bg-white px-4 pb-2 scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCategory
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area - Companies Grid */}
            <div className="flex-1 overflow-y-auto pt-36 pb-20 md:pb-4 bg-gray-50">
                <div className="px-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No se encontraron empresas</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
                            {filteredCompanies.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
