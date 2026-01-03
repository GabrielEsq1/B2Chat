"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, User, Phone, Lock, Building2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        companyName: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    companyName: formData.companyName,
                    password: formData.password
                    // Email is omitted intentionally
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Error al registrarse");
                setLoading(false);
            } else {
                setSuccess("¡Cuenta creada correctamente! Redirigiendo al login...");
                setTimeout(() => {
                    router.push("/login?registered=true");
                }, 1500);
            }
        } catch (err) {
            setError("Ocurrió un error de conexión");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-left mb-6">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            ← Volver al inicio
                        </Link>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
                        <p className="text-gray-600">Únete a B2Chat y escala tu negocio</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle className="h-4 w-4" />
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Tu nombre"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nombre empresa"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="+57 300 ..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Diséñala segura"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Repite la contraseña"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Cuenta"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-xs mb-4">¿Ya tienes cuenta? <Link href="/login" className="text-green-600 hover:text-green-800 font-bold">Inicia Sesión</Link></p>
                        <a href="https://creatiendas.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] text-gray-400 hover:text-green-600 font-medium transition-colors">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Parte de Enterprise Hub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
