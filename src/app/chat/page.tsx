"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { AIChatWindow } from "@/components/chat/AIChatWindow";
import InternalAdsPanel from "@/components/chat/InternalAdsPanel";

function ChatContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [initializing, setInitializing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const userId = searchParams?.get("userId");
        if (userId && session?.user?.id) {
            initiateChat(userId);
        }
    }, [searchParams, session?.user?.id]);

    const initiateChat = async (userId: string) => {
        if (initializing) return;
        setInitializing(true);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.conversation) {
                    const conv = data.conversation;
                    const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;
                    setSelectedConversation({ ...conv, otherUser });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setInitializing(false);
        }
    };

    if (!mounted) return null;

    return (
        /* 
           CLEAN ENTERPRISE LAYOUT - CSS GRID
           Desktop: 350px (Sidebar) | 1fr (Chat) | 340px (Ads)
           Mobile: Adaptive Flex
        */
        <div className="h-screen w-full bg-white overflow-hidden pt-16 md:grid md:grid-cols-[350px_1fr_340px]">

            {/* 1. LEFT: SIDEBAR (350px) */}
            <div
                className={`${selectedConversation ? 'hidden' : 'flex'} md:flex h-full flex-col bg-white z-30 relative`}
            >
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>

            {/* 2. CENTER: CHAT WINDOW (Flexible) */}
            <main
                className={`${!selectedConversation ? 'hidden' : 'flex'} md:flex h-full flex-col bg-slate-50 relative z-10 overflow-hidden shadow-2xl shadow-gray-200/50 md:shadow-none clip-path-content`}
            >
                {initializing ? (
                    <div className="flex h-full items-center justify-center bg-white/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-gray-100 border-t-blue-600"></div>
                            <p className="text-sm font-bold text-gray-400 tracking-wider">CONECTANDO...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {!selectedConversation ? (
                            <div className="flex h-full flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                                {/* Decor Background */}
                                <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                                <div className="z-10 text-center max-w-md px-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 rotate-3 transform hover:rotate-6 transition-transform">
                                        <span className="text-5xl">💬</span>
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Bienvenido a B2Chat</h2>
                                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                        Selecciona una conversación de la izquierda o inicia un nuevo chat para conectar con empresas.
                                    </p>
                                    <div className="mt-8 flex justify-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                    </div>
                                </div>
                            </div>
                        ) : selectedConversation?.otherUser?.isBot ? (
                            <AIChatWindow
                                conversationId={selectedConversation.id}
                                userId={session?.user?.id || ''}
                                userName={session?.user?.name || 'Usuario'}
                                onBack={() => setSelectedConversation(null)}
                            />
                        ) : (
                            <ChatWindow
                                conversation={selectedConversation}
                                onBack={() => setSelectedConversation(null)}
                            />
                        )}
                    </>
                )}
            </main>

            {/* 3. RIGHT: ADS MARKETPLACE (340px) */}
            <aside
                className="hidden md:flex h-full flex-col bg-white z-20"
            >
                <InternalAdsPanel />
            </aside>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
            <ChatContent />
        </Suspense>
    );
}
