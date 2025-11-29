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
        console.log('[ChatPage] Initiating chat with userId:', userId);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("[ChatPage] Error initiating chat:", err);
                alert(`Error al iniciar chat: ${err.error || 'Error desconocido'}`);
                return;
            }

            const data = await res.json();
            console.log('[ChatPage] Conversation created/found:', data);
            if (data.conversation) {
                // Determine other user from the conversation data directly
                const conv = data.conversation;
                const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;

                const conversationToSet = {
                    ...conv,
                    otherUser
                };
                console.log('[ChatPage] Setting conversation:', conversationToSet);
                setSelectedConversation(conversationToSet);
            }
        } catch (error) {
            console.error("[ChatPage] Error initiating chat:", error);
            alert("Error de conexión al iniciar el chat");
        } finally {
            setInitializing(false);
        }
    };

    return (
        <div className="flex h-screen pt-16 bg-white">
            <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} h-full w-full lg:w-80 flex-col border-r border-gray-200 bg-white`}>
                <ChatSidebar
                    onSelectConversation={setSelectedConversation}
                    selectedId={selectedConversation?.id}
                />
            </div>
            <div className={`${!selectedConversation ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-[#efeae2]`}>
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
                    />
                ) : (
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                    />
                )}
            </div>
            <InternalAdsPanel />
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
