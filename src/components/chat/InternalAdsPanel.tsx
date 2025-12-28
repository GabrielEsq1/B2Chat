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
                if (!res.ok) throw new Error('Fetch failed');
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
        <div className="flex h-full w-full flex-col bg-gray-100 relative overflow-hidden">
            {/* Sticky Top Header */}
            <div className="bg-white border-b border-gray-200 p-6 z-10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-gray-900 text-lg tracking-tight">Marketplace B2B</h3>
                    <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-sm font-black uppercase">
                        PRO
                    </span>
                </div>

                <a
                    href="/ads-manager"
                    className="flex items-center justify-center gap-3 w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg active:scale-95 border-b-4 border-blue-800"
                >
                    <span className="text-2xl">⚡</span>
                    CREAR CAMPAÑA
                </a>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-md"></div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sincronizando Marketplace...</p>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-inner">
                        <div className="text-5xl mb-5 mx-auto">🏙️</div>
                        <p className="font-black text-gray-900 text-sm uppercase">Sin Ofertas Activas</p>
                        <p className="text-[11px] text-gray-500 mt-2 font-medium">¡Lidera el mercado siendo el primero en aparecer aquí!</p>
                    </div>
                ) : (
                    ads.map((ad) => (
                        <div key={ad.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-1">
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

            {/* Bottom Branding */}
            <div className="p-5 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-center gap-3 grayscale opacity-30">
                    <div className="h-6 w-10 rounded bg-black flex items-center justify-center text-[10px] text-white font-black">B2B</div>
                    <span className="text-[10px] font-black text-black tracking-tighter">POWERED BY B2BCHAT</span>
                </div>
            </div>
        </div>
    );
}
