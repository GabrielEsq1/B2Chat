"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Las contraseñas no coinciden");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Contraseña actualizada exitosamente. Redirigiendo...");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setStatus("error");
                setMessage(data.error || "Ocurrió un error");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Error de conexión");
        }
    };

    if (!token) {
        return (
            <div className="text-center text-red-600">
                Token inválido o faltante.
            </div>
        );
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="password" className="sr-only">
                        Nueva Contraseña
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Nueva Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="sr-only">
                        Confirmar Contraseña
                    </label>
                    <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            {message && (
                <div
                    className={`text-sm p-2 rounded ${status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {message}
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {status === "loading" ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Establecer Nueva Contraseña
                    </h2>
                </div>
                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
                <div className="text-center">
                    <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
