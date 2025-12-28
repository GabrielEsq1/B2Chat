"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Users, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Hide if not logged in or on auth pages
    const hideNav = !session?.user || ["/login", "/register", "/"].includes(pathname || "");
    if (hideNav) return null;

    const navItems = [
        {
            href: "/dashboard",
            label: "Inicio",
            icon: Home,
        },
        {
            href: "/chat",
            label: "Chat",
            icon: MessageSquare,
        },
        {
            href: "/users",
            label: "Descubrir",
            icon: Users,
        },
        {
            href: "/profile",
            label: "Perfil",
            icon: UserCircle,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            <Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
