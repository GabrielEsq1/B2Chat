"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    MessageSquare,
    Store,
    Megaphone,
    LayoutDashboard,
    Share2,
    User,
    CreditCard,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/chat", label: "Chat", icon: MessageSquare },
        { href: "/ads-manager", label: "Ads Manager", icon: Megaphone, authRequired: true },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true },
    ];

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                                B2B
                            </div>
                            <span className="text-xl font-bold text-gray-900">B2BChat</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-1">
                        {navLinks.map((link) => {
                            if (link.authRequired && !session) return null;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href)
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {status === "loading" ? (
                            <div className="text-sm text-gray-500">Cargando...</div>
                        ) : session ? (
                            <>
                                <Link
                                    href="/dashboard/billing"
                                    className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Planes</span>
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    {(session.user as any)?.avatar || (session.user as any)?.profilePicture ? (
                                        <img 
                                            src={(session.user as any).avatar || (session.user as any).profilePicture} 
                                            alt={session.user?.name || 'User'}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-600">
                                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <span>{session.user?.name}</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-t border-gray-200 md:hidden">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {navLinks.map((link) => {
                            if (link.authRequired && !session) return null;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium ${isActive(link.href)
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard/billing"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <CreditCard className="h-5 w-5" />
                                    <span>Planes</span>
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Perfil</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut({ callbackUrl: "/" });
                                    }}
                                    className="w-full rounded-md bg-gray-100 px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

