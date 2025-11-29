import React from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';

interface AdPreviewCardProps {
    creativeUrl?: string;
    videoUrl?: string;
    creativeType: 'IMAGE' | 'VIDEO';
    title?: string; // Often the campaign name or specific headline
    description: string;
    ctaLabel?: string;
    destinationUrl?: string;
    sponsoredBy?: string; // e.g., "Sponsored" or Company Name
    className?: string;
    aspectRatio?: 'square' | 'video' | 'story'; // Control visual aspect
}

export function AdPreviewCard({
    creativeUrl,
    videoUrl,
    creativeType,
    title,
    description,
    ctaLabel = "Ver Más",
    destinationUrl,
    sponsoredBy = "Publicidad",
    className = "",
    aspectRatio = 'square',
    onAdClick
}: AdPreviewCardProps & { onAdClick?: () => void }) {
    const mediaUrl = creativeType === 'VIDEO' ? videoUrl : creativeUrl;

    return (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        Ad
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">{title || 'Título del Anuncio'}</h4>
                        <p className="text-xs text-gray-500">{sponsoredBy}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Media Content */}
            <div className={`relative bg-gray-50 ${aspectRatio === 'story' ? 'aspect-[9/16]' : aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'}`}>
                {mediaUrl ? (
                    creativeType === 'VIDEO' ? (
                        <video
                            src={mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={mediaUrl}
                            alt={title || "Ad Creative"}
                            className="w-full h-full object-cover"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">Vista previa del medio</span>
                    </div>
                )}
            </div>

            {/* Footer / CTA */}
            <div className="p-3">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {description || "Descripción del anuncio..."}
                </p>

                {destinationUrl ? (
                    <a
                        href={destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (onAdClick) {
                                onAdClick();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {ctaLabel}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                ) : (
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        {ctaLabel}
                        <ExternalLink className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
