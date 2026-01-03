"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
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
import { useLanguage } from "@/context/LanguageContext";

export default function AppNavbar() {
    const { data: session } = useSession();
    const { t } = useLanguage();
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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-default">
                        <Image src="/logo.png" alt="B2BChat Logo" width={40} height={40} className="rounded-lg shadow-md" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 leading-none">B2BChat</span>
                            <a href="https://creatiendas.com" target="_blank" rel="noopener noreferrer" className="text-[9px] text-gray-500 hover:text-blue-600 font-medium transition-colors">
                                {t('ecosystem.seal')}
                            </a>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.filter(link => link.show).map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - User menu (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-4">
                        {session?.user ? (
                            <>
                                <div className="mr-2">
                                    <CreditBalance />
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <UserCircle className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {session.user.name?.split(" ")[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>

                    {/* Mobile Header Elements (Balance & Profile only) */}
                    <div className="md:hidden flex items-center gap-3">
                        {session?.user && (
                            <>
                                <CreditBalance />
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-600"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
