"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Briefcase, Globe, Building, Camera, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        bio: "",
        website: "",
        industry: "",
        profilePicture: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (data.user) {
                setProfile({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.user.phone || "",
                    position: data.user.position || "",
                    bio: data.user.bio || "",
                    website: data.user.website || "",
                    industry: data.user.industry || "",
                    profilePicture: data.user.profilePicture || "",
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                alert('✅ Perfil actualizado exitosamente');
                await loadProfile(); // Reload to confirm
            } else {
                const error = await res.json();
                alert(`❌ Error: ${error.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('❌ Error al actualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 2MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten imágenes.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            try {
                const res = await fetch('/api/user/profile/photo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photoData: base64 }),
                });

                if (res.ok) {
                    setProfile({ ...profile, profilePicture: base64 });
                    alert('✅ Foto actualizada');
                } else {
                    alert('❌ Error al subir foto');
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('❌ Error al subir foto');
            }
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración de Perfil</h1>
                    <p className="text-gray-600 mt-2">Gestiona tu información profesional B2B</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar */}
                        <div className="flex items-end -mt-16 mb-6">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {profile.profilePicture ? (
                                        <img src={profile.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-16 w-16 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="photo-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    aria-label="Upload profile photo"
                                />
                                <button
                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                                    title="Cambiar foto"
                                >
                                    <Camera className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="ml-6 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{profile.name || 'Usuario'}</h2>
                                <p className="text-gray-600">{profile.position || 'Sin cargo'}</p>
                            </div>
                        </div>

                        {/* Form Sections */}
                        <div className="space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Información Personal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre Completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none"
                                                placeholder="tu@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                disabled
                                                className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 bg-gray-100 text-gray-600"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">El teléfono no se puede cambiar</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cargo/Posición
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.position}
                                                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none"
                                                placeholder="CEO, Director, etc."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    Información Profesional
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Industria/Sector
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.industry}
                                            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                                            placeholder="Tecnología, Marketing, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sitio Web
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="url"
                                                value={profile.website}
                                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none"
                                                placeholder="https://tuempresa.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Biografía Profesional
                                    </label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
                                        rows={4}
                                        placeholder="Describe tu experiencia profesional, especialidades y qué ofreces a otros profesionales B2B..."
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 text-right">
                                        {profile.bio.length}/500 caracteres
                                    </p>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Información de la Cuenta</h4>
                    <p className="text-sm text-blue-700">
                        Tu cuenta está activa y funcionando correctamente. Si necesitas actualizar tu información, contacta al soporte.
                    </p>
                </div>
            </div>
        </div>
    );
}
