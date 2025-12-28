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

            if (!res.ok) return;

            const data = await res.json();
            if (data.conversation) {
                const conv = data.conversation;
                const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;
                setSelectedConversation({ ...conv, otherUser });
            }
        } catch (error) {
            console.error("[ChatPage] Error initiating chat:", error);
        } finally {
            setInitializing(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-full pt-16 bg-white overflow-hidden">
            {/* 1. Left Sidebar (Chats) - Hidden on mobile if a chat is open */}
            <div className={`
                ${selectedConversation ? 'hidden md:flex' : 'flex'} 
                w-full md:w-80 h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white
            `}>
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>

            {/* 2. Middle Content (Chat Window) - Hidden on mobile if NO chat is open */}
            <main className={`
                ${!selectedConversation ? 'hidden md:flex' : 'flex'} 
                flex-1 h-full min-w-0 flex-col bg-[#efeae2] relative
            `}>
                {initializing ? (
                    <div className="flex h-full items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-500">Iniciando conversación...</p>
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
            </main>

            {/* 3. Right Sidebar (Ads) - Always visible on Desktop (md+) */}
            <aside className="hidden md:flex h-full w-80 flex-shrink-0 border-l border-gray-200">
                <InternalAdsPanel />
            </aside>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}
