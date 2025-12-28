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
                console.error('Error fetching ads:', error);
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
            console.error("Error tracking click:", error);
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Marketplace B2B</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        Patrocinado
                    </span>
                </div>

                <a
                    href="/ads-manager"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                    <span className="text-xl">📢</span>
                    Crear Mi Campaña
                </a>
                <p className="text-[10px] text-gray-500 text-center mt-3 font-semibold">
                    Lanza tu oferta hoy mismo
                </p>
            </div>

            {/* Ads List Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <p className="text-xs text-gray-500 font-medium">Buscando ofertas...</p>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-3">🏙️</div>
                        <p className="font-bold text-gray-900 text-sm">No hay ofertas todavía</p>
                        <p className="text-[11px] mt-1">¡Sé el primero en anunciarte!</p>
                    </div>
                ) : (
                    ads.map((ad) => (
                        <div key={ad.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-1">
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
                    ))
                )}
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 opacity-60">
                    <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-black shadow-inner">B2B</div>
                    <span className="text-xs font-bold text-gray-800">B2BChat Ads Platform</span>
                </div>
            </div>
        </div>
    );
}
