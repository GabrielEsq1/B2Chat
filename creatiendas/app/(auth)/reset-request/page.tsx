"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetRequestPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [debugLink, setDebugLink] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        setDebugLink("");

        try {
            const res = await fetch("/api/auth/reset-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                if (data.debugLink) {
                    setDebugLink(data.debugLink);
                }
            } else {
                setStatus("error");
                setMessage(data.error || "Ocurrió un error");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Error de conexión");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ingresa tu correo electrónico para recibir un enlace de recuperación.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                    {debugLink && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 break-all">
                            <p className="font-bold">Modo Desarrollo (Debug):</p>
                            <p>Usa este enlace para resetear tu contraseña:</p>
                            <Link href={debugLink} className="text-blue-600 underline mt-2 block">
                                {debugLink}
                            </Link>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {status === "loading" ? "Enviando..." : "Enviar enlace"}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
