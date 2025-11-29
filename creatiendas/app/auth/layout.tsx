import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center">
                    <Link href="/" className="flex items-center justify-center mb-8 group">
                        <img src="/logo.png" alt="Creatiendas" className="h-10 group-hover:scale-105 transition-transform duration-200" />
                    </Link>

                    <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 sm:p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80"></div>
                        {children}
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Creatiendas. Todos los derechos reservados.
                    </div>
                </div>
            </div>
        </div>
    );
}
