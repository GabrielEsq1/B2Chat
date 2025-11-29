"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // Don't show navbar on builder if desired, but user requested it in layout.
    // We can hide it on the builder page specifically if needed, but let's keep it consistent for now.

    const isActive = (path: string) => pathname === path ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-gray-900';

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href={session ? "/dashboard" : "/"} className="flex items-center">
                            <img src="/logo.png" alt="Creatiendas" className="h-8" />
                        </Link>
                        {session && (
                            <div className="hidden md:flex ml-10 space-x-8">
                                <Link href="/dashboard" className={isActive('/dashboard')}>
                                    Dashboard
                                </Link>
                                <Link href="/dashboard/stores" className={isActive('/dashboard/stores')}>
                                    Mis Tiendas
                                </Link>
                                <Link href="/dashboard/billing" className={isActive('/dashboard/billing')}>
                                    Mi Plan
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {status === 'loading' ? (
                            <span className="text-gray-400">Cargando...</span>
                        ) : session ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 hidden sm:inline">Hola, {session.user?.name}</span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                                    Entrar
                                </Link>
                                <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Crear Cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
