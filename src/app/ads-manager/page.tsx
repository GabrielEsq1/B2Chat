"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    TrendingUp,
    Eye,
    MousePointerClick,
    DollarSign,
    Play,
    Pause,
    Trash2,
} from "lucide-react";

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
    conversions: number;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
}

interface CampaignStats {
    total: number;
    active: number;
    draft: number;
    paused: number;
    completed: number;
    totalSpent: number;
    totalBudget: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
}

export default function AdsManagerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchCampaigns();
        }
    }, [status, router]);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            const data = await res.json();
            setCampaigns(data.campaigns);
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCampaign = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;

        try {
            await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
            fetchCampaigns();
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestor de Campañas
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Gestiona tus campañas publicitarias internas
                        </p>
                    </div>
                    <Link
                        href="/ads-manager/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Campaña
                    </Link>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={DollarSign}
                            label="Presupuesto Total"
                            value={`$${stats.totalBudget.toLocaleString()} COP`}
                            color="bg-blue-500"
                        />
                        <StatCard
                            icon={Eye}
                            label="Impresiones"
                            value={stats.totalImpressions.toLocaleString()}
                            color="bg-purple-500"
                        />
                        <StatCard
                            icon={MousePointerClick}
                            label="Clicks"
                            value={stats.totalClicks.toLocaleString()}
                            color="bg-green-500"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Conversiones"
                            value={stats.totalConversions.toLocaleString()}
                            color="bg-orange-500"
                        />
                    </div>
                )}

                {/* Campaigns List */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Mis Campañas ({campaigns.length})
                        </h2>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-gray-500">
                                No tienes campañas creadas
                            </p>
                            <Link
                                href="/ads-manager/create"
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                <Plus className="h-5 w-5" />
                                Crear Primera Campaña
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                                <CampaignRow
                                    key={campaign.id}
                                    campaign={campaign}
                                    onDelete={deleteCampaign}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <div className={`${color} flex h-12 w-12 items-center justify-center rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}

function CampaignRow({ campaign, onDelete }: { campaign: Campaign; onDelete: (id: string) => void }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-800";
            case "DRAFT":
                return "bg-gray-100 text-gray-800";
            case "PAUSED":
                return "bg-yellow-100 text-yellow-800";
            case "COMPLETED":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                        Objetivo: {campaign.objective} • Presupuesto: ${campaign.totalBudget.toLocaleString()} COP
                    </p>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>{campaign.impressions} impresiones</span>
                        <span>{campaign.clicks} clicks</span>
                        <span>{campaign.conversions} conversiones</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onDelete(campaign.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Eliminar"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
