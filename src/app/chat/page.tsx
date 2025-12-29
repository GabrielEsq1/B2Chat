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
        <div className="h-screen w-full bg-[#f0f2f5] overflow-hidden pt-16 flex">
            <div className="w-full h-full flex flex-col md:flex-row relative">
                {/* 1. LEFT: CHATS list (Always visible on Desktop, Toggle on Mobile) */}
                <div
                    className={`${selectedConversation ? 'hidden' : 'flex'} md:flex h-full w-full md:w-[350px] lg:w-[400px] flex-col border-r border-gray-200 bg-white z-20`}
                >
                    <ChatSidebar
                        onSelectConversation={setSelectedConversation}
                        selectedId={selectedConversation?.id}
                    />
                </div>

                {/* 2. RIGHT: MESSAGES window (Always visible on Desktop, Toggle on Mobile) */}
                <main
                    className={`${!selectedConversation ? 'hidden' : 'flex'} md:flex flex-1 h-full flex-col bg-[#efeae2] relative overflow-hidden`}
                >
                    {initializing ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            {!selectedConversation ? (
                                <div className="hidden md:flex h-full items-center justify-center bg-[#f0f2f5] border-l border-gray-200">
                                    <div className="text-center max-w-md p-8">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="text-5xl text-gray-400">💬</span>
                                        </div>
                                        <h2 className="text-3xl font-light text-gray-600 mb-4">B2BChat para Escritorio</h2>
                                        <p className="text-gray-500 leading-relaxed">
                                            Envía y recibe mensajes sin necesidad de mantener tu teléfono conectado.
                                            Usa B2BChat en hasta 4 dispositivos vinculados a la vez.
                                        </p>
                                        <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            Encripción de extremo a extremo
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
