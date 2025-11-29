"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Ad {
    id: string;
    title: string;
    description: string | null;
    type: string;
    imageUrl: string | null;
    videoUrl: string | null;
    approvalStatus: string;
    createdAt: string;
    campaign: {
        name: string;
        company: {
            name: string;
        };
        user: {
            name: string;
            email: string;
        };
    };
}

export default function AdminAdsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [ads, setAds] = useState<Ad[]>([]);
    const [filter, setFilter] = useState("PENDING");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        fetchAds();
    }, [filter]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/ads?status=${filter}`);
            const data = await response.json();
            if (data.success) {
                setAds(data.ads);
            }
        } catch (error) {
            console.error("Error fetching ads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/ads/${id}/approve`, {
                method: "POST",
            });
            if (response.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error("Error approving ad:", error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/ads/${id}/reject`, {
                method: "POST",
            });
            if (response.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error("Error rejecting ad:", error);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Anuncios</h1>
                        <p className="text-blue-100">Aprobar o rechazar anuncios pendientes</p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        ← Volver al Panel
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === status
                                    ? "bg-white text-blue-600 shadow-lg"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                        >
                            {status === "PENDING" && "Pendientes"}
                            {status === "APPROVED" && "Aprobados"}
                            {status === "REJECTED" && "Rechazados"}
                            <span className="ml-2 bg-white/30 px-2 py-1 rounded-full text-sm">
                                {ads.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Ads Grid */}
            <div className="max-w-7xl mx-auto">
                {ads.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center">
                        <p className="text-white text-lg">No hay anuncios {filter.toLowerCase()}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map((ad) => (
                            <div
                                key={ad.id}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
                            >
                                {/* Media Preview */}
                                <div className="relative h-48 bg-gray-100">
                                    {ad.type === "VIDEO" && ad.videoUrl ? (
                                        <video
                                            src={ad.videoUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    ) : ad.imageUrl ? (
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            Sin imagen
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ad.type === "VIDEO"
                                                ? "bg-purple-500 text-white"
                                                : "bg-blue-500 text-white"
                                            }`}>
                                            {ad.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{ad.title}</h3>
                                    {ad.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {ad.description}
                                        </p>
                                    )}

                                    {/* Campaign Info */}
                                    <div className="mb-4 space-y-1">
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Campaña:</span> {ad.campaign.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Empresa:</span> {ad.campaign.company.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold">Usuario:</span> {ad.campaign.user.name}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {filter === "PENDING" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(ad.id)}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02]"
                                            >
                                                ✓ Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleReject(ad.id)}
                                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02]"
                                            >
                                                ✗ Rechazar
                                            </button>
                                        </div>
                                    )}
                                    {filter === "APPROVED" && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                            <span className="text-green-700 font-semibold">✓ Aprobado</span>
                                        </div>
                                    )}
                                    {filter === "REJECTED" && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                            <span className="text-red-700 font-semibold">✗ Rechazado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
