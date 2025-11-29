"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, MessageSquare, TrendingUp, Settings, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        // Solo admin puede acceder
        if (session?.user?.email !== "admin@b2bchat.com" && session?.user?.email !== "superadmin@b2bchat.com") {
            router.push('/dashboard');
            return;
        }
        loadData();
    }, [session]);

    const loadData = async () => {
        try {
            const [usersRes, campaignsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/campaigns')
            ]);

            const usersData = await usersRes.json();
            const campaignsData = await campaignsRes.json();

            setUsers(usersData.users || []);
            setCampaigns(campaignsData.campaigns || []);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (campaignId: string, action: 'APPROVE' | 'REJECT') => {
        setProcessingId(campaignId);
        try {
            if (action === 'APPROVE') {
                // 1. Generate Payment Link & WhatsApp Message
                const paymentRes = await fetch('/api/campaigns/send-payment-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId }),
                });

                const paymentData = await paymentRes.json();

                if (!paymentRes.ok) throw new Error(paymentData.error);

                // 2. Open WhatsApp in new tab
                window.open(paymentData.whatsappUrl, '_blank');

                // 3. Update status to ACTIVE (or PENDING_PAYMENT if preferred)
                await updateCampaignStatus(campaignId, 'ACTIVE');

                alert(`✅ Campaña aprobada. Se ha abierto WhatsApp para enviar el link de pago.`);
            } else {
                // Reject
                await updateCampaignStatus(campaignId, 'REJECTED');
            }

            loadData();
        } catch (error: any) {
            console.error('Error processing campaign:', error);
            alert('Error: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const updateCampaignStatus = async (campaignId: string, status: string) => {
        const res = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update status');
    };

    const toggleCampaign = async (campaignId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
            await updateCampaignStatus(campaignId, newStatus);
            loadData();
        } catch (error) {
            console.error('Error toggling campaign:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando panel admin...</div>
            </div>
        );
    }

    const pendingCampaigns = campaigns.filter(c => c.status === 'PENDING' || c.status === 'REVIEW');
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE' || c.status === 'PAUSED');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Settings className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                            <p className="text-blue-100">Admin: {session?.user?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <a href="/admin/ads" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all">
                            Gestionar Anuncios
                        </a>
                        <a href="/dashboard" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all">
                            ← Volver al Dashboard
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl"><Users className="h-6 w-6 text-blue-600" /></div>
                            <div>
                                <p className="text-sm text-gray-600">Usuarios Totales</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-xl"><AlertCircle className="h-6 w-6 text-yellow-600" /></div>
                            <div>
                                <p className="text-sm text-gray-600">Pendientes de Aprobación</p>
                                <p className="text-2xl font-bold text-gray-900">{pendingCampaigns.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl"><TrendingUp className="h-6 w-6 text-green-600" /></div>
                            <div>
                                <p className="text-sm text-gray-600">Campañas Activas</p>
                                <p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'ACTIVE').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals Section */}
                {pendingCampaigns.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border-l-4 border-yellow-400">
                        <div className="p-6 border-b border-gray-200 bg-yellow-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                Solicitudes Pendientes ({pendingCampaigns.length})
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Revisa y aprueba campañas para generar links de pago</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{campaign.name}</p>
                                                    <p className="text-sm text-gray-500">{campaign.objective} • {campaign.industry}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {campaign.user?.name}
                                                <div className="text-xs text-gray-400">{campaign.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                ${campaign.totalBudget?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproval(campaign.id, 'APPROVE')}
                                                        disabled={processingId === campaign.id}
                                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                                                    >
                                                        {processingId === campaign.id ? 'Procesando...' : 'Aprobar & WhatsApp'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(campaign.id, 'REJECT')}
                                                        disabled={processingId === campaign.id}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm disabled:opacity-50"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Active Campaigns Management */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <h2 className="text-xl font-bold text-gray-900">Gestión de Campañas Activas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{campaign.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {campaign.user?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleCampaign(campaign.id, campaign.status)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                {campaign.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                        <h2 className="text-xl font-bold text-gray-900">Usuarios Registrados</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.company?.name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
