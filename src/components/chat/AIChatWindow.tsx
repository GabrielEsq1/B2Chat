'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import { Send, Loader2, Bot, ArrowLeft, X } from 'lucide-react';

interface AIChatWindowProps {
    conversationId: string;
    userId: string;
    userName?: string;
    onBack?: () => void;
}

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
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-none">Asistente B2B</h2>
                        <p className="text-[10px] text-green-600 font-bold uppercase mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            IA Activa • 24/7
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <div className="bg-indigo-50 p-6 rounded-full mb-4">
                            <Bot className="w-12 h-12 text-indigo-400" />
                        </div>
                        <p className="text-sm font-bold text-indigo-900">¿Cómo puedo impulsarte hoy?</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] text-center">Resuelvo dudas, genero ideas o ayudo con tus ventas.</p>
                    </div>
                )}

                {messages.map((message: any) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SISTEMA IA</span>
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <span className={`text-[9px] font-bold uppercase mt-2 block opacity-50 ${message.role === 'user' ? 'text-right' : ''}`}>
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
                        <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Generando respuesta...</span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <X className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-red-600">
                            No se pudo procesar la solicitud. Revisa tu conexión.
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Pregúntame lo que necesites..."
                        disabled={isLoading}
                        className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-11 w-11 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:bg-gray-200 disabled:shadow-none disabled:translate-y-0"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
