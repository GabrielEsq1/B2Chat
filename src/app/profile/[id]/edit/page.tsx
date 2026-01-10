"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        position: "",
        industry: "",
        bio: "",
        website: "",
        phone: "",
        avatar: "",
    });

    useEffect(() => {
        if (params?.id) {
            fetchUser();
        }
    }, [params?.id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users/${params?.id}`);
            const data = await res.json();

            if (data.user) {
                // Verify ownership
                if (!session?.user?.id || !data.user.id || String(session.user.id) !== String(data.user.id)) {
                    router.push(`/profile/${params?.id}`);
                    return;
                }

                setFormData({
                    name: data.user.name || "",
                    position: data.user.position || "",
                    industry: data.user.industry || "",
                    bio: data.user.bio || "",
                    website: data.user.website || "",
                    phone: data.user.phone || "",
                    avatar: data.user.avatar || data.user.profilePicture || "",
                });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/users/${params?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error updating profile");

            router.push(`/profile/${params?.id}`);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-blue-600">
                    <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            {formData.avatar || session?.user?.image ? (
                                <img
                                    src={formData.avatar || session?.user?.image || ''}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md group-hover:bg-blue-200 transition-colors">
                                    <span className="text-3xl font-bold text-blue-600">
                                        {formData.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Cambiar</span>
                            </div>
                        </div>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const uploadFormData = new FormData();
                                uploadFormData.append('file', file);
                                uploadFormData.append('type', 'image');

                                try {
                                    setSaving(true);
                                    const res = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: uploadFormData
                                    });

                                    if (res.ok) {
                                        const data = await res.json();
                                        setFormData(prev => ({ ...prev, avatar: data.url }));
                                    } else {
                                        alert('Error al subir imagen');
                                    }
                                } catch (error) {
                                    console.error('Upload error:', error);
                                    alert('Error al subir imagen');
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        />
                        <p className="mt-2 text-sm text-gray-500">Click en la imagen para cambiarla</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cargo / Posición</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Industria</label>
                        <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Biografía</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
