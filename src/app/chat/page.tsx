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
        /* MAIN CONTAINER: Explicit flex-row, h-screen, no wrapping */
        <div className="flex flex-row h-screen w-full pt-16 bg-white overflow-hidden items-stretch">

            {/* 1. LEFT SIDEBAR: Rigid 320px width on desktop */}
            <div
                className={`${selectedConversation ? 'hidden' : 'flex'} md:flex w-full md:w-80 h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white z-20`}
                style={{ minWidth: (typeof window !== 'undefined' && window.innerWidth >= 768) ? '320px' : 'auto' }}
            >
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>

            {/* 2. CENTER AREA: Expands to fill, minimum width ensured */}
            <main
                className={`${!selectedConversation ? 'hidden' : 'flex'} md:flex flex-1 h-full min-w-0 flex-col bg-[#efeae2] relative z-10 border-r border-gray-200`}
            >
                {initializing ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            <p className="text-gray-500 font-medium">Iniciando chat...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {!selectedConversation ? (
                            <div className="flex h-full items-center justify-center bg-gray-50">
                                <div className="text-center p-8">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-4xl">💬</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus Mensajes B2B</h2>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Selecciona una conversación para empezar a hacer negocios.
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

            {/* 3. RIGHT SIDEBAR: Marketplace - ABSOLUTELY FORCED ON MD+ */}
            <aside
                className="hidden md:flex w-80 h-full flex-shrink-0 flex-col bg-gray-100 shadow-xl z-20 border-l border-gray-300"
                style={{ width: '320px', minWidth: '320px' }}
            >
                <InternalAdsPanel />
            </aside>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando B2Chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}
