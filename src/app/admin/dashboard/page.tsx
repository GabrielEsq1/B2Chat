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
        // Check role based access
        if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN_EMPRESA") {
            // Optional: Show a "Not Authorized" message or redirect
            // For now, if they are not admin, redirect. 
            // Better constraint: check if session exists first.
            if (session) router.push('/dashboard');
            return;
        }
        loadData();
    }, [session]);

    const loadData = async () => {
        try {
            const [usersRes, campaignsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/campaigns') // Fixed: use admin endpoint
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

    // User Management State
    const [page, setPage] = useState(1);
    const usersPerPage = 5;

    // User Action Modals State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        industry: "",
        role: "USER"
    });

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            position: user.position || "",
            industry: user.industry || "",
            role: user.role || "USER"
        });
        setEditModalOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Usuario actualizado correctamente');
                setEditModalOpen(false);
                loadData();
            } else {
                alert('Error al actualizar');
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });
            if (res.ok) {
                alert('Contraseña restablecida correctamente');
                setResetPassModalOpen(false);
                setNewPassword("");
            } else {
                alert('Error al restablecer contraseña');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Usuario eliminado correctamente');
                setDeleteConfirmOpen(false);
                loadData();
            } else {
                alert('Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Pagination Logic
    const indexOfLastUser = page * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando panel admin...</div>
            </div>
        );
    }

    const pendingCampaigns = campaigns.filter(c => c.status === 'PENDING' || c.status === 'REVIEW');
    const allOtherCampaigns = campaigns.filter(c => c.status !== 'PENDING' && c.status !== 'REVIEW');

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
                            <p className="text-blue-100">{session?.user?.name} ({session?.user?.role})</p>
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
                                <p className="text-sm text-gray-600">Campañas Totales</p>
                                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
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

                {/* All Campaigns Management */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <h2 className="text-xl font-bold text-gray-900">Todas las Campañas ({allOtherCampaigns.length})</h2>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allOtherCampaigns.map((campaign) => (
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
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                    campaign.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
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
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Usuarios Registrados ({users.length})</h2>
                        <div className="flex gap-2 text-sm text-gray-600">
                            Página {page} de {totalPages}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.company?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-1 px-2 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setResetPassModalOpen(true);
                                                        setNewPassword("");
                                                    }}
                                                    className="p-1 px-2 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200"
                                                >
                                                    Pass
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    className="p-1 px-2 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                                                >
                                                    Borrar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 flex justify-center gap-4 bg-gray-50">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Anterior
                            </button>
                            <span className="flex items-center px-4 font-medium text-gray-700">
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>

                {/* Modals placed at the end to avoid nesting issues */}

                {/* Edit Modal */}
                {editModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Usuario</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 border-slate-300"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                                    <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {resetPassModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>
                            <input
                                type="text"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4 border-slate-300"
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setResetPassModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                                <button onClick={handleResetPassword} className="px-4 py-2 bg-yellow-600 text-white rounded">Cambiar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {deleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">¿Eliminar Usuario?</h3>
                            <p className="mb-4 text-gray-700">Esta acción no se puede deshacer. Se eliminarán todas las campañas, tiendas y chats asociados.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                                <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
