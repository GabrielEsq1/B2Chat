"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Play,
    Pause,
    CheckCircle,
    Search,
    Filter,
    X,
    Image as ImageIcon,
    Video,
    DollarSign,
    Users,
    MousePointerClick,
    Target,
} from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    objective: string;
    status: string;
    dailyBudget: number;
    durationDays: number;
    totalBudget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    creativeType: string;
    creativeUrl: string | null;
    creativeText: string | null;
    industry: string | null;
    sector: string | null;
    targetRoles: string | null;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string | null;
        phone: string;
    };
    company: {
        id: string;
        name: string;
    } | null;
    creatives: any[];
}

interface Stats {
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

export default function AdminCampaignsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.email !== "admin@b2bchat.com" && session?.user?.email !== "superadmin@b2bchat.com") {
            router.push('/dashboard');
            return;
        }
        loadCampaigns();
    }, [session]);

    useEffect(() => {
        filterCampaigns();
    }, [searchTerm, statusFilter, campaigns]);



    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/campaigns');
            const data = await res.json();

            if (res.ok) {
                setCampaigns(data.campaigns || []);
                setStats(data.stats || null);
            } else {
                showNotification('error', data.error || 'Error al cargar campañas');
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            showNotification('error', 'Error al cargar campañas');
        } finally {
            setLoading(false);
        }
    };


    const filterCampaigns = () => {
        let filtered = campaigns;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        setFilteredCampaigns(filtered);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };


    const approveCampaign = async (campaignId: string, silent = false) => {
        try {
            const res = await fetch(`/api/admin/campaigns/${campaignId}/approve`, {
                method: 'POST',
            });

            if (res.ok) {
                if (!silent) {
                    showNotification('success', 'Campaña aprobada exitosamente');
                }

                // Send payment link via WhatsApp
                try {
                    const paymentRes = await fetch('/api/campaigns/send-payment-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ campaignId })
                    });

                    if (paymentRes.ok) {
                        const data = await paymentRes.json();
                        // Open WhatsApp in new tab
                        window.open(data.whatsappUrl, '_blank');
                        showNotification('success', 'Link de pago enviado por WhatsApp');
                    }
                } catch (error) {
                    console.error('Error sending payment link:', error);
                }

                loadCampaigns();
            } else {
                const data = await res.json();
                if (!silent) {
                    showNotification('error', data.error || 'Error al aprobar campaña');
                }
            }
        } catch (error) {
            console.error('Error approving campaign:', error);
            if (!silent) {
                showNotification('error', 'Error al aprobar campaña');
            }
        }
    };


    const rejectCampaign = async (campaignId: string) => {
        try {
            const res = await fetch(`/api/admin/campaigns/${campaignId}/reject`, {
                method: 'POST',
            });

            if (res.ok) {
                showNotification('success', 'Campaña rechazada');
                loadCampaigns();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al rechazar campaña');
            }
        } catch (error) {
            console.error('Error rejecting campaign:', error);
            showNotification('error', 'Error al rechazar campaña');
        }
    };

    const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                showNotification('success', `Campaña ${newStatus.toLowerCase()} exitosamente`);
                loadCampaigns();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al actualizar campaña');
            }
        } catch (error) {
            console.error('Error updating campaign:', error);
            showNotification('error', 'Error al actualizar campaña');
        }
    };

    const deleteCampaign = async (campaignId: string) => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showNotification('success', 'Campaña eliminada exitosamente');
                loadCampaigns();
                setDeleteConfirmOpen(false);
                setCampaignToDelete(null);
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al eliminar campaña');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            showNotification('error', 'Error al eliminar campaña');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PAUSED': return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            case 'DRAFT': return 'bg-gray-100 text-gray-700';
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Play className="h-4 w-4" />;
            case 'PAUSED': return <Pause className="h-4 w-4" />;
            case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando campañas...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-3 animate-slide-in`}>
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Gestión de Campañas</h1>
                                <p className="text-blue-100">Administra todas las campañas publicitarias</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <a
                                href="/admin/dashboard"
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                ← Panel Admin
                            </a>
                            <button
                                onClick={loadCampaigns}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                🔄 Recargar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-xl p-4 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Target className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Total Campañas</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-4 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Play className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Activas</p>
                                    <p className="text-xl font-bold text-green-600">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-4 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Gastado</p>
                                    <p className="text-xl font-bold text-purple-600">${stats.totalSpent.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-4 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Eye className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Impresiones</p>
                                    <p className="text-xl font-bold text-orange-600">{stats.totalImpressions.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-4 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <MousePointerClick className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Clics</p>
                                    <p className="text-xl font-bold text-pink-600">{stats.totalClicks.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de campaña o usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Filter className="h-10 w-10 p-2 text-gray-600" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="PENDING">Pendientes</option>
                                <option value="DRAFT">Borrador</option>
                                <option value="ACTIVE">Activas</option>
                                <option value="PAUSED">Pausadas</option>
                                <option value="COMPLETED">Completadas</option>
                                <option value="REJECTED">Rechazadas</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Mostrando {filteredCampaigns.length} de {campaigns.length} campañas
                    </p>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Campaña</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Usuario</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Presupuesto</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Métricas</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCampaigns.map((campaign) => (
                                    <>
                                        <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{campaign.name}</p>
                                                    <p className="text-sm text-gray-500">{campaign.objective}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {campaign.creatives.length} creativos
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.user.name}</p>
                                                    <p className="text-xs text-gray-500">{campaign.user.email || campaign.user.phone}</p>
                                                    {campaign.company && (
                                                        <p className="text-xs text-gray-400">{campaign.company.name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${campaign.totalBudget.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ${campaign.dailyBudget}/día × {campaign.durationDays} días
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
                                                    <p className="text-gray-600">✅ {campaign.conversions.toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(campaign.status)}`}>
                                                    {getStatusIcon(campaign.status)}
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCampaign(campaign);
                                                            setViewModalOpen(true);
                                                        }}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {campaign.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => approveCampaign(campaign.id)}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                title="Aprobar campaña"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => rejectCampaign(campaign.id)}
                                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                                title="Rechazar campaña"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {campaign.status === 'DRAFT' && (
                                                        <button
                                                            onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                            title="Activar"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {campaign.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => updateCampaignStatus(campaign.id, 'PAUSED')}
                                                            className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                                            title="Pausar"
                                                        >
                                                            <Pause className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {campaign.status === 'PAUSED' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateCampaignStatus(campaign.id, 'ACTIVE')}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                title="Reanudar"
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateCampaignStatus(campaign.id, 'COMPLETED')}
                                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                title="Completar"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setCampaignToDelete(campaign.id);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                    {campaign.creatives.length > 0 && (
                                                        <button
                                                            onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                                                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                                            title="Ver creativos"
                                                        >
                                                            {campaign.creativeType === 'VIDEO' ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Creatives Row */}
                                        {expandedCampaign === campaign.id && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-gray-900">Creativos de la campaña:</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {campaign.creatives.map((creative) => (
                                                                <div key={creative.id} className="bg-white rounded-lg p-4 shadow">
                                                                    <div className="flex items-start gap-3">
                                                                        {creative.imageUrl && (
                                                                            <img
                                                                                src={creative.imageUrl}
                                                                                alt={creative.title}
                                                                                className="w-20 h-20 object-cover rounded-lg"
                                                                            />
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-sm text-gray-900">{creative.title}</p>
                                                                            <p className="text-xs text-gray-500">{creative.description}</p>
                                                                            <div className="flex gap-2 mt-2">
                                                                                <span className={`px-2 py-1 rounded text-xs ${creative.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                                    {creative.isActive ? 'Activo' : 'Inactivo'}
                                                                                </span>
                                                                                <span className={`px-2 py-1 rounded text-xs ${creative.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : creative.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                                    {creative.approvalStatus}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>

                        {filteredCampaigns.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No se encontraron campañas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Campaign Modal */}
                {viewModalOpen && selectedCampaign && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                                <h3 className="text-2xl font-bold text-gray-900">Detalles de Campaña</h3>
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Nombre</label>
                                        <p className="text-lg font-semibold text-gray-900">{selectedCampaign.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Objetivo</label>
                                        <p className="text-lg text-gray-900">{selectedCampaign.objective}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Estado</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                                            {selectedCampaign.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Usuario</label>
                                        <p className="text-lg text-gray-900">{selectedCampaign.user.name}</p>
                                        <p className="text-sm text-gray-500">{selectedCampaign.user.email || selectedCampaign.user.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Presupuesto Diario</label>
                                        <p className="text-lg font-semibold text-gray-900">${selectedCampaign.dailyBudget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Duración</label>
                                        <p className="text-lg text-gray-900">{selectedCampaign.durationDays} días</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Presupuesto Total</label>
                                        <p className="text-lg font-semibold text-gray-900">${selectedCampaign.totalBudget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Gastado</label>
                                        <p className="text-lg font-semibold text-green-600">${selectedCampaign.spent.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Métricas</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Impresiones</p>
                                            <p className="text-2xl font-bold text-blue-600">{selectedCampaign.impressions.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Clics</p>
                                            <p className="text-2xl font-bold text-green-600">{selectedCampaign.clicks.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Conversiones</p>
                                            <p className="text-2xl font-bold text-purple-600">{selectedCampaign.conversions.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedCampaign.industry && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Segmentación</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedCampaign.industry && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Industria</label>
                                                    <p className="text-gray-900">{selectedCampaign.industry}</p>
                                                </div>
                                            )}
                                            {selectedCampaign.sector && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Sector</label>
                                                    <p className="text-gray-900">{selectedCampaign.sector}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedCampaign.creatives.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Creativos ({selectedCampaign.creatives.length})</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedCampaign.creatives.map((creative) => (
                                                <div key={creative.id} className="border rounded-lg p-4 flex gap-4">
                                                    {creative.imageUrl && (
                                                        <img
                                                            src={creative.imageUrl}
                                                            alt={creative.title}
                                                            className="w-24 h-24 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{creative.title}</p>
                                                        <p className="text-sm text-gray-600">{creative.description}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${creative.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                {creative.isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded text-xs ${creative.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : creative.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {creative.approvalStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas eliminar esta campaña? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setDeleteConfirmOpen(false);
                                        setCampaignToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => campaignToDelete && deleteCampaign(campaignToDelete)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
