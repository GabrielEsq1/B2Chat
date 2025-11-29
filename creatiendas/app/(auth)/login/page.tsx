'use client';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

function LoginForm() {
    const router = useRouter();
    const search = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const callbackUrl = search.get('callbackUrl') ?? '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const result = await signIn('credentials', { redirect: false, email, password });
        if (result?.error) setError('Correo o contraseña incorrectos');
        else router.push(callbackUrl);
    };

    return (
        <section className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" placeholder="Correo" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
                <input type="password" placeholder="Contraseña" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Entrar</button>
            </form>
            <p className="mt-4 text-center">
                ¿No tienes cuenta? <a href="/auth/register" className="text-indigo-600 hover:underline">Regístrate</a>
            </p>
            <p className="mt-2 text-center">
                <a href="/auth/reset-request" className="text-gray-600 hover:underline">¿Olvidaste tu contraseña?</a>
            </p>
        </section>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <LoginForm />
        </Suspense>
    );
}
