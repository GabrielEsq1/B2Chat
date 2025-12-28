"use client";

import { useState, useEffect } from "react";
import { AdPreviewCard } from "../campaigns/AdPreviewCard";

export default function InternalAdsPanel() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads/marketplace');
                const data = await res.json();
                if (data.ads) setAds(data.ads);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    const handleAdClick = async (adId: string) => {
        try {
            await fetch("/api/ads/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId, type: "CLICK" }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-white border-l border-gray-100 shadow-sm overflow-hidden z-20">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-50 bg-white flex items-center justify-between flex-shrink-0">
                <div>
                    <h3 className="font-extrabold text-gray-900 text-lg tracking-tight leading-none">Marketplace</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Ofertas Exclusivas</p>
                </div>
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                    B2B
                </div>
            </div>

            {/* Ads Feed */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-6 bg-slate-50/50">

                {/* Promo Banner / CTA to Create Ad */}
                <a href="/ads-manager" className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 shadow-lg shadow-blue-200 transform hover:scale-[1.02] transition-all group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Tu Negocio Aquí</p>
                        <h4 className="text-white font-bold text-lg leading-tight mb-3">¿Quieres más ventas B2B?</h4>
                        <span className="inline-block bg-white text-blue-700 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm">
                            CREAR ANUNCIO
                        </span>
                    </div>
                </a>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-40 bg-gray-100 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-sm font-medium text-gray-500">No hay ofertas disponibles por ahora.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ads.map((ad) => (
                            <div key={ad.id} className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                                <AdPreviewCard
                                    title={ad.title}
                                    description={ad.description}
                                    creativeUrl={ad.image}
                                    creativeType="IMAGE"
                                    ctaLabel={ad.cta}
                                    destinationUrl={ad.link}
                                    sponsoredBy={ad.companyName}
                                    aspectRatio="square"
                                    onAdClick={() => handleAdClick(ad.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white text-center">
                <p className="text-[10px] text-gray-400 font-medium">Publicidad verificada por B2Chat</p>
            </div>
        </div>
    );
}
