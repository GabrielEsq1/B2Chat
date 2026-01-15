"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { AIChatWindow } from "@/components/chat/AIChatWindow";
import IconSidebar from "@/components/chat/IconSidebar";


function ChatContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        setError(null);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.conversation) {
                    const conv = data.conversation;
                    const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;
                    setSelectedConversation({ ...conv, otherUser });
                } else {
                    setError("La respuesta del servidor no contenía los datos del chat.");
                }
            } else {
                setError(data.error || "No se pudo conectar con el usuario.");
            }
        } catch (error) {
            console.error(error);
            setError("Error de conexión. Verifica tu internet.");
        } finally {
            setInitializing(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-[#f0f2f5] overflow-hidden flex">
            <div className="w-full h-full flex relative">
                {/* 1. LEFT: Icon Sidebar (WhatsApp style) - Hidden on mobile */}
                <div className="hidden md:flex">
                    <IconSidebar />
                </div>

                {/* 2. MIDDLE: Chat List */}
                <div
                    className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-[280px] lg:w-[320px] h-full flex-col border-r border-gray-200 bg-white z-20`}
                >
                    <ChatSidebar
                        onSelectConversation={setSelectedConversation}
                        selectedId={selectedConversation?.id}
                        isFullWidth={!selectedConversation}
                    />
                </div>

                {/* 3. RIGHT: Chat Window */}
                <main
                    className={`${!selectedConversation && !initializing && !error ? 'hidden' : 'flex'} flex-1 h-full flex-col bg-[#efeae2] relative overflow-hidden transition-all duration-300 ease-in-out`}
                >
                    {initializing ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            <p className="text-gray-500 font-bold animate-pulse">Conectando...</p>
                        </div>
                    ) : error ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No se pudo iniciar el chat</h3>
                            <p className="text-gray-500 max-w-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Reintentar
                            </button>
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
