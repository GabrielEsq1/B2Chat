"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { AIChatWindow } from "@/components/chat/AIChatWindow";
import InternalAdsPanel from "@/components/chat/InternalAdsPanel";
import FloatingAdsButton from "@/components/chat/FloatingAdsButton";

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
           FORCE 3-COLUMN LAYOUT Using CSS Grid
           Desktop/Tablet: Grid 320px | 1fr | 320px (Ads always visible)
           Mobile: Flex with floating button
        */
        <div className="h-screen w-full bg-[#efeae2] overflow-hidden pt-16 md:grid md:grid-cols-[320px_1fr_320px]">

            {/* 1. LEFT: CHATS (320px on Desktop) */}
            <div
                className={`${selectedConversation ? 'hidden' : 'flex'} md:flex h-full flex-col border-r border-gray-200 bg-white`}
            >
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>

            {/* 2. CENTER: MESSAGES (Flexible Area) */}
            <main
                className={`${!selectedConversation ? 'hidden' : 'flex'} md:flex h-full flex-col bg-[#efeae2] relative overflow-hidden`}
            >
                {initializing ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {!selectedConversation ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center p-12 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg">
                                        <span className="text-4xl">💬</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">B2BChat Messenger</h2>
                                    <p className="text-gray-600 font-medium">
                                        Selecciona un contacto para iniciar.
                                    </p>
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

            {/* 3. RIGHT: ADS MARKETPLACE (320px) - ALWAYS VISIBLE ON DESKTOP, HIGH Z-INDEX */}
            <aside
                className="hidden md:flex h-full flex-col bg-gray-50 border-l border-gray-200 shadow-2xl relative"
                style={{ zIndex: 30 }}
            >
                <InternalAdsPanel />
            </aside>

            {/* Floating Ads Button - Mobile Only - POSITIONED ABOVE SEND BUTTON */}
            <FloatingAdsButton />
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
