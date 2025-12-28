"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Play, Pause, Eye, TrendingUp, DollarSign, MousePointer } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    dailyBudget: number;
    totalBudget: number;
    spent: number;
    impressions: number;
    clicks: number;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function CampaignsManagerPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (data.campaigns) {
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
        setToggling(campaignId);
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
            const res = await fetch(`/api/campaigns/${campaignId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Update local state
                setCampaigns(campaigns.map(c =>
                    c.id === campaignId ? { ...c, status: newStatus } : c
                ));
                alert(`✅ Campaña ${newStatus === 'ACTIVE' ? 'activada' : 'pausada'}`);
            } else {
                alert('❌ Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error toggling campaign:', error);
            alert('❌ Error al actualizar estado');
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando campañas...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/ads-manager')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Ads Manager
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Campañas</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Gestiona tus campañas publicitarias</p>
                </div>

                {/* Campaigns List */}
                {campaigns.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 mb-4">No tienes campañas aún</p>
                        <button
                            onClick={() => router.push('/ads-manager/create')}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                        >
                            + Nueva Campaña
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {campaign.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${campaign.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : campaign.status === 'PAUSED'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {campaign.status}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Impresiones</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {campaign.impressions.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <MousePointer className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Clicks</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{campaign.clicks}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Gastado</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            ${campaign.spent.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Budget Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Presupuesto</span>
                                        <span>
                                            ${campaign.spent.toFixed(2)} / ${campaign.totalBudget.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min((campaign.spent / campaign.totalBudget) * 100, 100)}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col md:flex-row gap-2">
                                    <button
                                        onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                                        disabled={toggling === campaign.id || campaign.status === 'DRAFT'}
                                        className={`w-full md:flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${campaign.status === 'ACTIVE'
                                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            } disabled:opacity-50`}
                                    >
                                        {toggling === campaign.id ? (
                                            <>Actualizando...</>
                                        ) : campaign.status === 'ACTIVE' ? (
                                            <>
                                                <Pause className="h-4 w-4" /> Pausar
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" /> Activar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/ads-manager/campaigns/${campaign.id}`)}
                                        className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Create New Campaign Button - BOTTOM */}
                        <button
                            onClick={() => router.push('/ads-manager/create')}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium text-center flex items-center justify-center gap-2"
                        >
                            + Nueva Campaña
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
