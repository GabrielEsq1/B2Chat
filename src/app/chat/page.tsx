"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { AIChatWindow } from "@/components/chat/AIChatWindow";


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
        <div className="h-screen w-full bg-[#f0f2f5] overflow-hidden flex">
            <div className="w-full h-full flex flex-col md:flex-row relative">
                {/* 1. LEFT: CHATS list (Full width if no selection, Sidebar if selection) */}
                <div
                    className={`${selectedConversation ? 'hidden md:flex md:w-[350px] lg:w-[400px]' : 'flex w-full'} h-full flex-col border-r border-gray-200 bg-white z-20 transition-all duration-300 ease-in-out`}
                >
                    <ChatSidebar
                        onSelectConversation={setSelectedConversation}
                        selectedId={selectedConversation?.id}
                        isFullWidth={!selectedConversation}
                    />
                </div>

                {/* 2. RIGHT: MESSAGES window (Hidden if no selection) */}
                <main
                    className={`${!selectedConversation ? 'hidden' : 'flex'} flex-1 h-full flex-col bg-[#efeae2] relative overflow-hidden transition-all duration-300 ease-in-out`}
                >
                    {initializing ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            {selectedConversation ? (
                                selectedConversation?.otherUser?.isBot ? (
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
                                )
                            ) : null}
                        </>
                    )}
                </main>
            </div>
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
