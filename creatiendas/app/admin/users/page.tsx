"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    plan: string;
    createdAt: string;
    _count: {
        stores: number;
    };
}

interface Store {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userStores, setUserStores] = useState<Store[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStoresModal, setShowStoresModal] = useState(false);
    const [isStoresLoading, setIsStoresLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const [editForm, setEditForm] = useState({ name: '', email: '', plan: '', role: '', newPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.status === 403 || res.status === 401) {
                router.push('/');
                return;
            }
            if (!res.ok) throw new Error('Error fetching users');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(`Error al cargar usuarios: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email,
            plan: user.plan,
            role: user.role,
            newPassword: '', // Empty by default, only set if admin wants to change it
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            console.log('Sending update for user:', selectedUser.id, editForm);
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error updating user');
            }

            await fetchUsers();
            setShowEditModal(false);
            setSuccessMessage('✅ Usuario actualizado exitosamente');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            console.error('Update error:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = (user: User) => {
        setSelectedUser(user);
        setShowResetConfirmModal(true);
    };

    const confirmResetPassword = async () => {
        if (!selectedUser) return;

        setShowResetConfirmModal(false);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Error resetting password');

            const data = await res.json();
            setTempPassword(data.temporaryPassword);
            setShowPasswordModal(true);
        } catch (err) {
            alert('Error al resetear contraseña');
        }
    };

    const handleViewStores = async (user: User) => {
        setSelectedUser(user);
        setIsStoresLoading(true);
        setShowStoresModal(true); // Show modal immediately with loading state
        try {
            const res = await fetch(`/api/admin/users/${user.id}`);
            if (!res.ok) throw new Error('Error fetching user stores');
            const data = await res.json();
            setUserStores(data.user.stores || []);
        } catch (err) {
            alert('Error al cargar tiendas');
            setShowStoresModal(false); // Close if error
        } finally {
            setIsStoresLoading(false);
        }
    };

    const handleDeleteStore = async (storeId: string) => {
        if (!confirm('¿Eliminar esta tienda permanentemente?')) return;

        try {
            const res = await fetch(`/api/admin/stores/${storeId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error deleting store');

            setUserStores(prev => prev.filter(s => s.id !== storeId));
            await fetchUsers();
            alert('Tienda eliminada exitosamente');
        } catch (err) {
            alert('Error al eliminar tienda');
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`¿Eliminar usuario ${user.email} y TODAS sus tiendas?`)) return;
        if (!confirm('Esta acción NO se puede deshacer. ¿Continuar?')) return;

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Error deleting user');

            await fetchUsers();
            alert('Usuario eliminado exitosamente');
        } catch (err) {
            alert('Error al eliminar usuario');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Contraseña copiada al portapapeles');
    };

    if (loading) return <div className="p-8 text-center">Cargando panel de administración...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                    <span className="text-lg">{successMessage}</span>
                </div>
            )}
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
                    <p className="mt-2 text-sm text-gray-700">Control total sobre usuarios, planes y tiendas.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Usuario
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Rol
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Tiendas
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Plan
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="font-medium text-gray-900">
                                                    {user.name || 'Sin nombre'}
                                                </div>
                                                <div className="text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {user._count.stores}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.plan === 'PRO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {user.plan}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Reset Pass
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewStores(user)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Tiendas
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000] pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl pointer-events-auto">
                        <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                                    <select
                                        value={editForm.plan}
                                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    >
                                        <option value="FREE">FREE</option>
                                        <option value="PRO">PRO</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={editForm.newPassword}
                                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                        placeholder="Dejar vacío para no cambiar"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres. Dejar vacío si no deseas cambiar la contraseña.</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000] pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl pointer-events-auto">
                        <h2 className="text-xl font-bold mb-4">Contraseña Temporal</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Nueva contraseña para <strong>{selectedUser.email}</strong>:
                        </p>
                        <div className="bg-gray-100 p-4 rounded-md mb-4">
                            <code className="text-lg font-mono">{tempPassword}</code>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => copyToClipboard(tempPassword)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Copiar
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirmModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000] pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl pointer-events-auto">
                        <h2 className="text-xl font-bold mb-4">¿Resetear Contraseña?</h2>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas resetear la contraseña para <strong>{selectedUser.email}</strong>?
                            <br />
                            Esta acción generará una contraseña temporal.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmResetPassword}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setShowResetConfirmModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stores Modal */}
            {showStoresModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000] pointer-events-none">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto">
                        <h2 className="text-xl font-bold mb-4">
                            Tiendas de {selectedUser.name || selectedUser.email}
                        </h2>
                        {isStoresLoading ? (
                            <div className="flex justify-center py-8">
                                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : userStores.length === 0 ? (
                            <p className="text-gray-500">No tiene tiendas creadas</p>
                        ) : (
                            <div className="space-y-3">
                                {userStores.map((store) => (
                                    <div key={store.id} className="border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{store.name}</h3>
                                            <p className="text-sm text-gray-500">/{store.slug}</p>
                                            <p className="text-xs text-gray-400">
                                                Creada: {new Date(store.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/stores/${store.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium"
                                            >
                                                Ver Tienda
                                            </a>
                                            <button
                                                onClick={() => handleDeleteStore(store.id)}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm font-medium"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setShowStoresModal(false)}
                            className="mt-6 w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
