"use client";

import FeaturedCompanies from "@/components/discover/FeaturedCompanies";

export default function DiscoverPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <FeaturedCompanies />
            </div>
        </div>
    );
}
