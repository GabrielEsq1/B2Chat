"use client";

import { useState, useEffect } from "react";
import { AdPreviewCard } from "../campaigns/AdPreviewCard";

export default function InternalAdsPanel() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMobileAds, setShowMobileAds] = useState(false);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads/marketplace');
                const data = await res.json();
                if (data.ads) {
                    setAds(data.ads);
                    // Track impressions
                    data.ads.forEach((ad: any) => trackImpression(ad.id));
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    const trackImpression = async (adId: string) => {
        try {
            await fetch("/api/ads/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adId, type: "IMPRESSION" }),
            });
        } catch (error) {
            console.error("Error tracking impression:", error);
        }
    };

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

    if (loading) {
        return (
            <div className="hidden w-80 flex-col border-l border-gray-200 bg-white md:flex">
                <div className="border-b border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900">Novedades y Ofertas</h3>
                </div>
                <div className="p-4 text-center text-gray-500">Cargando ofertas...</div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setShowMobileAds(!showMobileAds)}
                className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg lg:hidden hover:bg-blue-700 transition-all"
                title="Ver ofertas"
            >
                <span className="text-xl">🎁</span>
            </button>

            {/* Mobile Overlay */}
            {showMobileAds && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 lg:hidden" onClick={() => setShowMobileAds(false)}>
                    <div className="h-[80vh] w-full rounded-t-2xl bg-white p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Novedades y Ofertas</h3>
                            <button onClick={() => setShowMobileAds(false)} className="text-gray-500">✕</button>
                        </div>
                        <div className="space-y-6">
                            {ads.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    <p>No hay ofertas disponibles por el momento.</p>
                                </div>
                            ) : (
                                ads.map((ad) => (
                                    <AdPreviewCard
                                        key={ad.id}
                                        title={ad.title}
                                        description={ad.description}
                                        creativeUrl={ad.image}
                                        creativeType="IMAGE" // Assuming marketplace ads are images for now
                                        ctaLabel={ad.cta}
                                        destinationUrl={ad.link}
                                        sponsoredBy={ad.companyName}
                                        aspectRatio="video" // Use video aspect for feed-like feel
                                        onAdClick={() => handleAdClick(ad.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="flex h-full w-full flex-col border-l border-gray-200 bg-gray-50 shadow-inner overflow-hidden">
                {/* Fixed Header with Create Button */}
                <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                        <span>Marketplace B2B</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Patrocinado</span>
                    </h3>

                    <a
                        href="/ads-manager"
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <span className="text-lg">📢</span>
                        Crear Mi Campaña
                    </a>
                    <p className="text-[10px] text-gray-500 text-center mt-3 font-medium">
                        Lanza tu oferta hoy y llega a cientos de empresas
                    </p>
                </div>

                {/* Scrollable Ads List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {ads.length === 0 ? (
                        <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                                🏙️
                            </div>
                            <div>
                                <p className="font-medium">No hay ofertas todavía</p>
                                <p className="text-xs">¡Sé el primero en anunciarte aquí!</p>
                            </div>
                        </div>
                    ) : (
                        ads.map((ad) => (
                            <div key={ad.id} className="transform transition-all hover:scale-[1.02]">
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
                                    className="!shadow-md hover:!shadow-xl border-none ring-1 ring-black/5"
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Small Footer Branding */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-center gap-1.5 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
                        <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">B2B</div>
                        <span className="text-xs font-bold text-gray-900">B2BChat Ads</span>
                    </div>
                </div>
            </div>
        </>
    );
}
