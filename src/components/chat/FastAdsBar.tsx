"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Ad {
    id: string;
    title: string;
    description: string;
    image?: string;
    mobileImage?: string;
    link: string;
    cta: string;
    companyName: string;
}

export default function FastAdsBar() {
    const router = useRouter();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads/marketplace');
                const data = await res.json();
                if (data.ads) {
                    setAds(data.ads);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    if (loading || ads.length === 0) return null;

    return (
        <>
            {/* Instagram-Style Stories Bar - Mobile Optimized */}
            <div className="w-full overflow-x-auto bg-white border-b border-gray-100 py-3 px-2 sm:py-4 sm:px-3 block"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}>
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                <div className="flex gap-3 sm:gap-4 min-w-max">
                    {/* "Your Story" Placeholder */}
                    <div
                        onClick={() => router.push('/ads-manager')}
                        className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px] cursor-pointer group flex-shrink-0"
                    >
                        <div className="relative">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-[3px] group-hover:scale-105 transition-transform duration-200">
                                <Link href="/ads-manager" className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                    <div className="h-[60px] w-[60px] sm:h-[74px] sm:w-[74px] rounded-full bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
                                        <Plus className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" strokeWidth={2.5} />
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <span className="text-[11px] sm:text-xs font-medium text-gray-800 truncate w-full text-center">
                            Anunciarme
                        </span>
                    </div>

                    {/* Ad Stories */}
                    {ads.map((ad, index) => (
                        <div
                            key={ad.id}
                            onClick={() => setSelectedAd(ad)}
                            className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[80px] cursor-pointer group flex-shrink-0"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative">
                                {/* Gradient Border */}
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-[3px] group-hover:scale-110 transition-all duration-300 shadow-md">
                                    {/* White Ring */}
                                    <div className="h-full w-full rounded-full bg-white p-[2px] sm:p-[3px]">
                                        {/* Image Container */}
                                        <div className="h-full w-full rounded-full overflow-hidden">
                                            <img
                                                src={ad.mobileImage || ad.image || "/placeholder.png"}
                                                alt={ad.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[11px] sm:text-xs font-medium text-gray-800 truncate max-w-[70px] sm:max-w-[80px] text-center">
                                {ad.companyName}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Story Overlay */}
            {selectedAd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4" onClick={() => setSelectedAd(null)}>
                    <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl aspect-[9/16] max-h-[90vh]" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-start">
                            <div className="flex items-center gap-2 text-white">
                                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold border border-white/30">
                                    {selectedAd.companyName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold shadow-sm">{selectedAd.companyName}</p>
                                    <p className="text-[10px] opacity-80">Publicidad</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAd(null)} className="text-white/80 hover:text-white" aria-label="Cerrar">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="h-full w-full flex items-center justify-center bg-gray-900">
                            <img
                                src={selectedAd.mobileImage || selectedAd.image || "/placeholder.png"}
                                alt={selectedAd.title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Footer / CTA */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col gap-3">
                            <h3 className="text-white font-bold text-lg leading-tight">{selectedAd.title}</h3>
                            <p className="text-white/80 text-sm line-clamp-2">{selectedAd.description}</p>

                            <a
                                href={selectedAd.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                            >
                                {selectedAd.cta} <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
