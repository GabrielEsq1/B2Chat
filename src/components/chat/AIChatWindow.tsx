'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';

interface AIChatWindowProps {
    conversationId: string;
    userId: string;
    userName?: string;
    onBack?: () => void;
}

import { ArrowLeft } from 'lucide-react';

/**
 * Componente de Chat con IA usando Vercel AI SDK
 * Basado en código probado de vercel/ai-chatbot
 */
export function AIChatWindow({ conversationId, userId, userName = 'Usuario', onBack }: AIChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat/ai',
        body: {
            conversationId,
            userId,
        },
        onError: (error: Error) => {
            console.error('Error en chat con IA:', error);
        },
    } as any) as any;

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                {onBack && (
                    <button onClick={onBack} className="lg:hidden p-1 hover:bg-white/20 rounded-full text-white transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                )}
                <Bot className="w-6 h-6 text-white" />
                <div>
                    <h2 className="font-semibold text-white">Asistente IA</h2>
                    <p className="text-xs text-blue-100">Siempre disponible para ayudarte</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">¡Hola! Soy tu asistente de IA</p>
                        <p className="text-sm mt-2">¿En qué puedo ayudarte hoy?</p>
                    </div>
                )}

                {messages.map((message: any) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <Bot className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-medium text-purple-600">IA</span>
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block" suppressHydrationWarning>
                                {new Date(message.createdAt || Date.now()).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span className="text-sm text-gray-600">Escribiendo...</span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">
                            ❌ Error: {error.message || 'No se pudo conectar con el asistente'}
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe tu mensaje..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Presiona Enter para enviar • Shift+Enter para nueva línea
                </p>
            </form>
        </div>
    );
}
