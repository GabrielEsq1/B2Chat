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
           FORCE 3-COLUMN LAYOUT 
           Using explicit flex-row and avoiding hidden on desktop 
        */
        <div className="flex flex-row h-screen w-full pt-16 bg-[#efeae2] overflow-hidden items-stretch">

            {/* 1. LEFT: CHATS (320px) */}
            <div
                className={`${selectedConversation ? 'hidden' : 'flex'} md:flex w-full md:w-80 h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white z-20`}
                style={{ minWidth: '320px' }}
            >
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>

            {/* 2. CENTER: MESSAGES (Flexible Area) */}
            <main
                className={`${!selectedConversation ? 'hidden' : 'flex'} md:flex flex-1 h-full min-w-0 flex-col bg-[#efeae2] relative z-10`}
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

            {/* 3. RIGHT: ADS MARKETPLACE (320px) - ABSOLUTELY FORCED ON ALL VIEWPORTS >= 768px */}
            <aside
                className="hidden md:flex w-80 h-full flex-shrink-0 flex-col bg-gray-50 border-l border-gray-200 shadow-2xl z-20"
                style={{ width: '320px', minWidth: '320px' }}
            >
                <div className="flex-1 flex flex-col h-full bg-slate-50">
                    <InternalAdsPanel />
                </div>
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
