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
            <div className="hidden w-80 flex-col border-l border-gray-200 bg-white lg:flex">
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
            <div className="hidden w-80 flex-col border-l border-gray-200 bg-white lg:flex">
                <div className="border-b border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900">Novedades y Ofertas</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                                creativeType="IMAGE"
                                ctaLabel={ad.cta}
                                destinationUrl={ad.link}
                                sponsoredBy={ad.companyName}
                                aspectRatio="square"
                                onAdClick={() => handleAdClick(ad.id)}
                            />
                        ))
                    )}

                    <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
                        <h4 className="mb-2 font-bold">¿Quieres anunciarte aquí?</h4>
                        <p className="mb-3 text-sm opacity-90">
                            Llega a miles de empresas B2B directamente en su chat.
                        </p>
                        <a
                            href="/ads-manager"
                            className="block w-full rounded-md bg-white px-4 py-2 text-center text-sm font-bold text-indigo-600 hover:bg-gray-50"
                        >
                            Crear Campaña
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
