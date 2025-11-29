"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import CampaignForm from "@/components/campaigns/CampaignForm";

interface Campaign {
    id: string;
    name: string;
    objective: string;
    status: string;
    dailyBudget: number;
    totalBudget: number;
    spent: number;
    impressions: number;
    clicks: number;
    creativeType: string;
    createdAt: string;
}

export default function UserCampaignsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/campaigns');
            const data = await res.json();

            if (res.ok) {
                setCampaigns(data.campaigns || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
            REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Eye },
        };

        const style = styles[status] || styles.DRAFT;
        const Icon = style.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                <Icon className="h-3 w-3" />
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-gray-600 text-lg">Cargando campañas...</div>
            </div>
        );
    }

    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <CampaignForm
                        onSuccess={() => {
                            setShowCreateForm(false);
                            loadCampaigns();
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Mis Campañas</h1>
                                <p className="text-gray-600">Gestiona tus campañas publicitarias</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-md"
                            >
                                ← Volver
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Nueva Campaña
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Campañas</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Activas</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Gastado</p>
                                    <p className="text-2xl font-bold text-purple-600">${stats.totalSpent.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <span className="text-2xl">💰</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Impresiones</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.totalImpressions.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Eye className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Todas las Campañas</h2>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="p-12 text-center">
                            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes campañas</h3>
                            <p className="text-gray-600 mb-6">Crea tu primera campaña para comenzar</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Crear Primera Campaña
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Campaña</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Presupuesto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Métricas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{campaign.name}</p>
                                                    <p className="text-sm text-gray-500">{campaign.objective}</p>
                                                    <p className="text-xs text-gray-400">{campaign.creativeType}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(campaign.status)}
                                                {campaign.status === 'PENDING' && (
                                                    <p className="text-xs text-gray-500 mt-1">En revisión</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${campaign.totalBudget.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ${campaign.dailyBudget}/día
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        Gastado: ${campaign.spent.toLocaleString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs space-y-1">
                                                    <p className="text-gray-600">👁️ {campaign.impressions.toLocaleString()}</p>
                                                    <p className="text-gray-600">🖱️ {campaign.clicks.toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(campaign.createdAt).toLocaleDateString('es-ES')}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
