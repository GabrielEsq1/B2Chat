"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Users,
    Search,
    Edit,
    Trash2,
    Lock,
    Store,
    Filter,
    X,
    UserCircle,
    CheckCircle,
    AlertCircle,
    MoreVertical
} from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    position: string | null;
    industry: string | null;
    company: {
        name: string;
    } | null;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        industry: "",
        role: "USER"
    });

    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (session?.user?.email !== "admin@b2bchat.com" && session?.user?.email !== "superadmin@b2bchat.com" && session?.user?.role !== "SUPERADMIN") {
            router.push('/dashboard');
            return;
        }
        loadUsers();
    }, [session]);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            } else {
                showNotification('error', 'Error al cargar usuarios');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showNotification('error', 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.company?.name?.toLowerCase().includes(term)
            );
        }
        setFilteredUsers(filtered);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleEditClick = (user: User) => {
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
                showNotification('success', 'Usuario actualizado correctamente');
                setEditModalOpen(false);
                loadUsers();
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al actualizar');
            }
        } catch (error) {
            console.error('Error updating:', error);
            showNotification('error', 'Error al actualizar usuario');
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
                showNotification('success', 'Contraseña restablecida correctamente');
                setResetPassModalOpen(false);
                setNewPassword("");
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al restablecer contraseña');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            showNotification('error', 'Error al restablecer contraseña');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showNotification('success', 'Usuario eliminado correctamente');
                setDeleteConfirmOpen(false);
                loadUsers(); // Refresh list
            } else {
                const data = await res.json();
                showNotification('error', data.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('error', 'Error eliminando usuario');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-3 animate-slide-in`}>
                        {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
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
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                                <p className="text-blue-100">Administra todos los usuarios de la plataforma ({users.length})</p>
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
                                onClick={loadUsers}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                🔄 Recargar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o empresa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Usuario</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Contacto</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Empresa / Rol</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-lg">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-gray-900">{user.email}</p>
                                                <p className="text-gray-500">{user.phone || 'Sin teléfono'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{user.company?.name || 'Sin Empresa'}</p>
                                                <p className="text-gray-500">{user.position || user.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Editar Usuario"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setResetPassModalOpen(true);
                                                        setNewPassword("");
                                                    }}
                                                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                                    title="Restablecer Contraseña"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </button>

                                                {/* Link to store/campaigns could go here */}

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Eliminar Usuario"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No se encontraron usuarios</p>
                            </div>
                        )}
                    </div>
                </div>

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
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cargo</label>
                                        <input
                                            type="text"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Industria</label>
                                        <input
                                            type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {resetPassModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Restablecer Contraseña</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Ingresa la nueva contraseña para <b>{selectedUser?.name}</b>.
                            </p>
                            <input
                                type="text"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setResetPassModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={!newPassword || newPassword.length < 6}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Restablecer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirm Modal */}
                {deleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas eliminar permanentemente al usuario <b>{selectedUser?.name}</b>?
                                <br /><br />
                                <span className="text-red-600 font-semibold">Esta acción no se puede deshacer.</span>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Eliminar Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
