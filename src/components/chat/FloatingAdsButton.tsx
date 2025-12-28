"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import InternalAdsPanel from "./InternalAdsPanel";

export default function FloatingAdsButton() {
    const [showAds, setShowAds] = useState(false);

    return (
        <>
            {/* Floating Button - Only visible on mobile - POSITIONED HIGH TO AVOID SEND BUTTON */}
            <button
                onClick={() => setShowAds(true)}
                className="md:hidden fixed bottom-32 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 animate-bounce"
                aria-label="Ver ofertas"
            >
                <Sparkles className="h-6 w-6" />
            </button>

            {/* Mobile Ads Panel Overlay - SAME PANEL, just repositioned for mobile */}
            {showAds && (
                <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                        <h2 className="text-lg font-bold text-gray-900">Marketplace B2B</h2>
                        <button
                            onClick={() => setShowAds(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>

                    {/* THE SAME ADS PANEL COMPONENT */}
                    <div className="flex-1 overflow-hidden">
                        <InternalAdsPanel />
                    </div>
                </div>
            )}
        </>
    );
}

