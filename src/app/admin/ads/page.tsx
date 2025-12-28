"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Loader2 } from "lucide-react";

interface AdCreative {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    destinationUrl?: string;
    approvalStatus: string;
    campaign: {
        name: string;
        company: {
            name: string;
        };
    };
}

export default function AdminAdsPage() {
    const router = useRouter();
    const [ads, setAds] = useState<AdCreative[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [editingAd, setEditingAd] = useState<AdCreative | null>(null);

    const handleSaveEdit = async () => {
        if (!editingAd) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ads/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingAd.id,
                    title: editingAd.title,
                    description: editingAd.description,
                    destinationUrl: editingAd.destinationUrl
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setAds(prev => prev.map(ad => ad.id === updated.ad.id ? { ...ad, ...updated.ad } : ad));
                setEditingAd(null);
                alert('Anuncio actualizado. Ahora puedes aprobarlo.');
            } else {
                alert('Error al actualizar');
            }
        } catch (err) {
            console.error(err);
            alert('Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAds();
    }, []);

    const fetchPendingAds = async () => {
        try {
            const res = await fetch('/api/admin/ads/pending');
            const data = await res.json();
            setAds(data.ads || []);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (adId: string) => {
        setProcessing(adId);
        try {
            const res = await fetch('/api/admin/ads/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, action: 'APPROVE' })
            });

            if (res.ok) {
                setAds(prev => prev.filter(ad => ad.id !== adId));
            } else {
                alert('Error al aprobar');
            }
        } catch (error) {
            alert('Error al aprobar');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (adId: string) => {
        setProcessing(adId);
        try {
            const res = await fetch('/api/admin/ads/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId, action: 'REJECT' })
            });

            if (res.ok) {
                setAds(prev => prev.filter(ad => ad.id !== adId));
            } else {
                alert('Error al rechazar');
            }
        } catch (error) {
            alert('Error al rechazar');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Anuncios</h1>
                        <p className="text-gray-600 mt-1">Revisa y aprueba los anuncios pendientes</p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        ← Volver
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : ads.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No hay anuncios pendientes de aprobación</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {ads.map((ad) => (
                            <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {ad.imageUrl && (
                                    <div className="aspect-video bg-gray-100 relative group">
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{ad.title}</h3>
                                        <p className="text-sm text-gray-600">{ad.campaign.company.name}</p>
                                        <p className="text-xs text-gray-500">Campaña: {ad.campaign.name}</p>
                                    </div>

                                    {ad.description && (
                                        <p className="text-gray-700 mb-4">{ad.description}</p>
                                    )}

                                    {ad.destinationUrl && (
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 mb-1">URL Destino:</p>
                                            <a
                                                href={ad.destinationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm break-all"
                                            >
                                                {ad.destinationUrl}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => setEditingAd(ad)}
                                            className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 font-medium mb-2"
                                        >
                                            ✏️ Modificar / Corregir
                                        </button>

                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => handleApprove(ad.id)}
                                                disabled={processing === ad.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                                            >
                                                {processing === ad.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="h-5 w-5" />
                                                        Aprobar
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleReject(ad.id)}
                                                disabled={processing === ad.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                                            >
                                                {processing === ad.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="h-5 w-5" />
                                                        Rechazar
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                {editingAd && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Modificar Anuncio</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Título</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2 mt-1"
                                        value={editingAd.title}
                                        onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 mt-1"
                                        rows={3}
                                        value={editingAd.description}
                                        onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Destino</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2 mt-1"
                                        value={editingAd.destinationUrl || ''}
                                        onChange={(e) => setEditingAd({ ...editingAd, destinationUrl: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setEditingAd(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
