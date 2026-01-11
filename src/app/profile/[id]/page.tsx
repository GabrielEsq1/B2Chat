"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    User,
    Mail,
    Phone,
    Globe,
    Briefcase,
    Building2,
    Camera,
    MessageSquare,
    ChevronLeft,
    Star,
    ShieldCheck,
    ArrowRight,
    Loader2
} from "lucide-react";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string | null;
    industry: string | null;
    bio: string | null;
    website: string | null;
    avatar: string | null;
    profilePicture: string | null;
    coverPhoto: string | null;
    isBot: boolean;
    botPersonality: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingCover, setUploadingCover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (params?.id) {
            fetchUser();
        }
    }, [params?.id]);

    const fetchUser = async () => {
        if (!params?.id) return;
        try {
            const res = await fetch(`/api/users/${params.id}`);
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = () => {
        if (!user) return;
        router.push(`/chat?userId=${user.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
                    <p className="mt-4 text-gray-500 font-medium animate-pulse">Cargando perfil corporativo...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-blue-50 text-center max-w-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Usuario no encontrado</h2>
                    <p className="text-slate-500 mb-8 font-medium italic">"La identidad que buscas parece haberse desvanecido en la red."</p>
                    <button
                        onClick={() => router.push("/hub")}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Volver al Hub
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = !!(session?.user?.id && user?.id && String(session.user.id) === String(user.id));
    const avatarUrl = user.avatar || user.profilePicture;

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingCover(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'b2bchat_profiles');

            const cloudinaryRes = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dg2suxdit'}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (cloudinaryRes.ok) {
                const cloudinaryData = await cloudinaryRes.json();
                const coverUrl = cloudinaryData.secure_url;

                // Update user profile with new cover
                const updateRes = await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coverPhoto: coverUrl })
                });

                if (updateRes.ok) {
                    setUser(prev => prev ? { ...prev, coverPhoto: coverUrl } : null);
                }
            }
        } catch (error) {
            console.error('Error uploading cover:', error);
        } finally {
            setUploadingCover(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Premium Header / Cover Photo */}
            <div className="relative h-64 md:h-[400px] w-full overflow-hidden bg-slate-900 group">
                {user.coverPhoto ? (
                    <img
                        src={user.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 relative">
                        {/* Dynamic Noise/Texture */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        {/* Subtle Lights */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 blur-[120px] rounded-full"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/30 blur-[120px] rounded-full"></div>
                    </div>
                )}

                {/* Cover Overlay Text */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>

                {/* Float Controls */}
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/20 transition-all group/back"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
                    </button>
                </div>

                {isOwnProfile && (
                    <>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            className="absolute bottom-40 right-10 z-20 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploadingCover ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Subiendo...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5" /> Cambiar Portada
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-20">
                {/* Identity Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 p-8 md:p-12 border border-slate-50 flex flex-col md:flex-row items-center md:items-end gap-8">
                    {/* Avatar with Ring */}
                    <div className="relative shrink-0 -mt-16 md:-mt-24">
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] bg-white p-3 shadow-2xl ring-4 ring-blue-50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-inner">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
                                        <User className="w-20 h-20 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={() => router.push(`/profile/${user.id}/edit`)}
                                className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-3xl shadow-2xl border-4 border-white hover:bg-blue-700 transition-all hover:scale-110 active:scale-90"
                            >
                                <Camera className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Basic Branding Info */}
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">{user.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-black text-sm uppercase tracking-wider">
                                        <Briefcase className="w-4 h-4" /> {user.position || "Socio B2BChat"}
                                    </span>
                                    {user.isBot && (
                                        <span className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-full font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-200">
                                            IA Global
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => router.push(`/profile/${user.id}/edit`)}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3"
                                    >
                                        Editar Perfil <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={startChat}
                                        className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-base hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center gap-3"
                                    >
                                        <MessageSquare className="w-6 h-6" /> Iniciar Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {/* Left & Center Columns (Story & Contact) */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Bio / Mission */}
                        <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <Star className="w-24 h-24 text-blue-600" />
                            </div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div> Perfil Profesional
                            </h2>
                            <p className="text-slate-700 text-xl font-medium leading-[1.8] italic">
                                "{user.bio || "Esta persona está reservando su historia para los mejores negocios. Contacta ahora para conocer más sobre sus capacidades y visión."}"
                            </p>
                        </div>

                        {/* Professional Credentials Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-slate-900">
                            {/* Contact Box */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Canales de Enlace</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:rotate-6 transition-transform">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Email Corporativo</p>
                                            <p className="text-sm font-black text-slate-700 truncate">{user.email || 'Reservado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:-rotate-6 transition-transform">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Conexión Directa</p>
                                            <p className="text-sm font-black text-slate-700">{user.phone || 'No vinculada'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Network Box */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Presencia en el Mercado</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:rotate-6 transition-transform">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Vertical del Sector</p>
                                            <p className="text-sm font-black text-slate-700">{user.industry || 'Empresarial'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:-rotate-6 transition-transform">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ecosistema Digital</p>
                                            <a
                                                href={user.website?.startsWith('http') ? user.website : `https://${user.website}`}
                                                target="_blank"
                                                className="text-sm font-black text-blue-600 hover:underline truncate block"
                                            >
                                                {user.website || 'No disponible'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Scoring & Trust */}
                    <div className="space-y-8">
                        {/* Trust Badge Card */}
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            {/* Abstract Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/40 transition-colors"></div>

                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Nivel de Confianza</h3>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl">
                                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-black text-2xl tracking-tight">Verificado</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Gnosis Network Member</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Reputación Corporativa</span>
                                    <span className="text-emerald-400 font-black text-sm uppercase">Excelente</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full w-[96%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold italic text-right mt-2">Puntaje basado en 48 negociaciones reales</p>
                            </div>
                        </div>

                        {/* Quick Action / CTA */}
                        {!isOwnProfile && (
                            <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
                                <h4 className="font-black text-blue-900 mb-2">¿Quieres negociar?</h4>
                                <p className="text-blue-700/70 text-sm font-medium leading-relaxed mb-6">
                                    Inicia una conversación directa para explorar alianzas estratégicas ahora mismo.
                                </p>
                                <button
                                    onClick={startChat}
                                    className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl shadow-blue-200/50 hover:shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    Enviar Propuesta <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

