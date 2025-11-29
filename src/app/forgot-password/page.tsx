"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"REQUEST" | "RESET">("REQUEST");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.error) {
                setMessage({ type: "error", text: data.error });
            } else {
                setMessage({ type: "success", text: "Código enviado. Revisa la consola del servidor (modo local)." });
                setStep("RESET");
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error de conexión" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();

            if (data.error) {
                setMessage({ type: "error", text: data.error });
            } else {
                setMessage({ type: "success", text: "Contraseña actualizada. Redirigiendo..." });
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error de conexión" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
                    <p className="text-gray-600 mt-2">
                        {step === "REQUEST"
                            ? "Ingresa tu email para recibir un código de recuperación"
                            : "Ingresa el código recibido y tu nueva contraseña"}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {step === "REQUEST" ? (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Enviando..." : "Enviar Código"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código de Verificación</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123456"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Actualizando..." : "Cambiar Contraseña"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
