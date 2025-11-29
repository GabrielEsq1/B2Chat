'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
    const router = useRouter();
    const token = useSearchParams().get('token');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!token) return <p className="text-center mt-10">Token inválido.</p>;

    const handle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirm) return setError('Las contraseñas no coinciden');
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: newPass }),
        });
        const data = await res.json();
        if (!res.ok) setError(data.error ?? 'Error');
        else {
            setMsg('Contraseña actualizada, redirigiendo al login...');
            setTimeout(() => router.push('/auth/login'), 1500);
        }
    };

    return (
        <section className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4 text-center">Nueva contraseña</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {msg && <p className="text-green-600 mb-2">{msg}</p>}
            <form onSubmit={handle} className="space-y-4">
                <input type="password" placeholder="Nueva contraseña" required minLength={6} value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full border rounded px-3 py-2" />
                <input type="password" placeholder="Confirmar contraseña" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border rounded px-3 py-2" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Cambiar contraseña</button>
            </form>
        </section>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
