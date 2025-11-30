"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    MessageSquare,
    Users,
    Megaphone,
    Home,
    LogOut,
    Menu,
    X,
    UserCircle,
} from "lucide-react";
import { useState } from "react";
import CreditBalance from "./monetization/CreditBalance";

export default function AppNavbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Don't show navbar on landing page, login, or register
    const hideNavbar = pathname ? ["/", "/login", "/register"].includes(pathname) : false;
    if (hideNavbar) return null;

    const isAdmin = session?.user?.role === "SUPERADMIN" || session?.user?.role === "ADMIN_EMPRESA";

    const navLinks = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: Home,
            show: true,
        },
        {
            href: "/chat",
            label: "Chat",
            icon: MessageSquare,
            show: true,
        },
        {
            href: "/contacts",
            label: "Contactos",
            icon: Users,
            show: true,
        },
        {
            href: "/users",
            label: "Descubrir",
            icon: Users,
            show: true,
        },
        {
            href: "/ads-manager",
            label: "Anuncios",
            icon: Megaphone,
            show: isAdmin,
        },
        {
            href: "/admin/dashboard",
            label: "Admin",
            icon: Megaphone,
            show: isAdmin,
        },
    ];

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">B2BChat</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.filter(link => link.show).map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - User menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {session?.user ? (
                            <>
                                <div className="mr-2">
                                    <CreditBalance />
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <UserCircle className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {session.user.name?.split(" ")[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Salir
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.filter(link => link.show).map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            {session?.user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                                    >
                                        <UserCircle className="h-5 w-5" />
                                        Mi Perfil
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full block text-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
