"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X, Calendar, DollarSign, Target, User, Building, Info } from "lucide-react";

export default function CampaignReviewPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCampaign();
    }, [params.id]);

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/campaigns/${params.id}`);
            const data = await response.json();
            if (data.campaign) {
                setCampaign(data.campaign);
            } else {
                setError(data.error || "Error al cargar la campaña");
            }
        } catch (err) {
            setError("Error de red al cargar la campaña");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;

        setActionLoading(true);
        try {
            const response = await fetch(`/api/campaigns/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                alert(`Campaña ${newStatus === 'ACTIVE' ? 'aprobada' : 'rechazada'} con éxito`);
                fetchCampaign();
            } else {
                alert(data.error || "Error al actualizar la campaña");
            }
        } catch (err) {
            alert("Error de red al actualizar la campaña");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <X className="mb-4 h-16 w-16 text-red-500" />
                <h1 className="text-xl font-bold text-gray-900">Error</h1>
                <p className="mt-2 text-gray-600">{error || "No se pudo encontrar la campaña"}</p>
                <button onClick={() => router.back()} className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white">
                    Volver
                </button>
            </div>
        );
    }

    const creative = campaign.creatives?.[0] || {};
    const formattedDate = (date: string) => new Date(date).toLocaleDateString();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-16">
            <div className="mx-auto max-w-4xl px-4">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full bg-white p-2 shadow-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Revisión de Campaña</h1>
                            <p className="text-sm text-gray-500">ID: {campaign.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className={`rounded-full px-4 py-1 text-sm font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'PENDING_PAYMENT' ? 'bg-blue-100 text-blue-700' :
                                campaign.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                        }`}>
                        {campaign.status}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Info Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Info className="h-5 w-5 text-blue-600" />
                                Detalles Generales
                            </h2>
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Nombre</p>
                                    <p className="font-medium text-gray-900">{campaign.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Objetivo</p>
                                    <div className="flex items-center gap-1 font-medium text-blue-600">
                                        <Target className="h-4 w-4" />
                                        {campaign.objective}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Usuario</p>
                                    <div className="flex items-center gap-1 font-medium text-gray-900">
                                        <User className="h-4 w-4" />
                                        {campaign.user?.name}
                                    </div>
                                    <p className="text-xs text-gray-500">{campaign.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Empresa</p>
                                    <div className="flex items-center gap-1 font-medium text-gray-900">
                                        <Building className="h-4 w-4" />
                                        {campaign.company?.name || "Sin empresa"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Creative Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Check className="h-5 w-5 text-green-600" />
                                Contenido Publicitario
                            </h2>
                            <div className="space-y-4">
                                {creative.type === "IMAGE" ? (
                                    <img src={creative.imageUrl} alt="Ad Creative" className="w-full rounded-lg shadow-sm border" />
                                ) : (
                                    <video src={creative.videoUrl} controls className="w-full rounded-lg shadow-sm border" />
                                )}
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Texto del Anuncio</p>
                                    <p className="mt-1 text-gray-900 font-medium">{creative.description || campaign.creativeText}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">URL de Destino</p>
                                    <a href={creative.destinationUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-blue-600 hover:underline">
                                        {creative.destinationUrl}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Segmentation Card */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Target className="h-5 w-5 text-purple-600" />
                                Segmentación B2B
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Industria</p>
                                    <p className="font-bold text-gray-900">{campaign.industry}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Sector</p>
                                    <p className="font-bold text-gray-900">{campaign.sector}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Edad</p>
                                    <p className="font-bold text-gray-900">{creative.ageRange || "Cualquiera"}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Género</p>
                                    <p className="font-bold text-gray-900">{creative.gender || "Todos"}</p>
                                </div>
                                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Ubicación</p>
                                    <p className="font-bold text-gray-900">{creative.location || "Nacional"}</p>
                                </div>
                                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500">Cargos/Roles</p>
                                    <p className="font-bold text-gray-900">{campaign.targetRoles || "No especificado"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Budget */}
                    <div className="space-y-6">
                        {/* Budget Card */}
                        <div className="rounded-xl bg-blue-600 p-6 text-white shadow-lg">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <DollarSign className="h-5 w-5" />
                                Presupuesto
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-blue-100 text-sm">Presupuesto Diario</p>
                                    <p className="text-2xl font-bold">${campaign.dailyBudget.toLocaleString()} COP</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">Total a Pagar</p>
                                    <p className="text-3xl font-black text-white">${campaign.totalBudget.toLocaleString()} COP</p>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-blue-700/50 p-2 text-xs">
                                    <Calendar className="h-4 w-4" />
                                    <span>Duración estimada: {campaign.durationDays} días</span>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Box */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                            <h2 className="mb-4 text-base font-bold text-gray-900 uppercase">Acciones Administrativas</h2>
                            <div className="space-y-3">
                                {campaign.status !== 'ACTIVE' && (
                                    <button
                                        onClick={() => handleStatusUpdate('ACTIVE')}
                                        disabled={actionLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <Check className="h-5 w-5" />
                                        APROBAR CAMPAÑA
                                    </button>
                                )}

                                {campaign.status !== 'REJECTED' && (
                                    <button
                                        onClick={() => handleStatusUpdate('REJECTED')}
                                        disabled={actionLoading}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 border border-red-200 py-3 font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <X className="h-5 w-5" />
                                        RECHAZAR / PAUSAR
                                    </button>
                                )}

                                <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
                                    <p className="font-bold mb-1">⚠️ Recordatorio</p>
                                    <p>Confirme que el pago haya sido recibido vía Nequi antes de presionar Aprobar.</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact User */}
                        <a
                            href={`https://wa.me/${campaign.user?.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                        >
                            Chatear con Cliente
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
