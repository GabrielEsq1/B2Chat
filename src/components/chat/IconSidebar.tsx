"use client";

import { User, MessageSquare, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IconSidebar() {
    const router = useRouter();

    return (
        <div className="hidden md:flex w-[60px] h-full flex-col bg-slate-800 border-r border-slate-700 flex-shrink-0">
            {/* Profile at top */}
            <button
                onClick={() => router.push('/profile')}
                className="p-4 hover:bg-slate-700 transition-colors group relative"
                title="Perfil"
            >
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                </div>
            </button>

            {/* Main icons */}
            <div className="flex-1 flex flex-col gap-2 py-4">
                <button
                    className="p-4 hover:bg-slate-700 transition-colors relative group"
                    title="Chats"
                >
                    <MessageSquare className="h-6 w-6 text-white" />
                    {/* Active indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-full"></div>
                </button>

                <button
                    onClick={() => router.push('/contacts')}
                    className="p-4 hover:bg-slate-700 transition-colors group"
                    title="Contactos"
                >
                    <Users className="h-6 w-6 text-slate-300 group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Settings at bottom */}
            <button
                onClick={() => router.push('/dashboard/profile')}
                className="p-4 hover:bg-slate-700 transition-colors group"
                title="Configuración"
            >
                <Settings className="h-6 w-6 text-slate-300 group-hover:text-white transition-colors" />
            </button>
        </div>
    );
}
