"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Search, MoreVertical, Volume2, VolumeX } from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  fromSelf: boolean;
  readAt?: Date;
}

interface ChatWindowProps {
  conversation?: any;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ show: boolean, message: string, senderName: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedMessageIds = useRef<Set<string>>(new Set());

  // Initialize notification sound and load sound preference
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmGcHjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audioRef.current.volume = 0.5;

    // Load sound preference from localStorage
    const savedPref = localStorage.getItem('chatSoundEnabled');
    if (savedPref !== null) {
      setSoundEnabled(savedPref === 'true');
    }
  }, []);

  // Toggle sound preference
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('chatSoundEnabled', String(newValue));
  };

  // Smart scroll to bottom - only if user is near bottom
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.parentElement;
    if (!scrollContainer) return;

    const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Load messages with auto-refresh
  useEffect(() => {
    if (!conversation?.id) return;

    const fetchMessages = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const res = await fetch(`/api/conversations/${conversation.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          const formattedMessages = (data.messages || []).map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            senderId: msg.senderUserId,
            createdAt: new Date(msg.createdAt),
            fromSelf: msg.senderUserId === session?.user?.id
          }));

          // Only update if there are new messages (to avoid unnecessary re-renders)
          setMessages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(formattedMessages)) {
              return prev; // No changes
            }
            return formattedMessages;
          });

          // Notify for new messages (sound + visual)
          if (isPolling && formattedMessages.length > messages.length) {
            const newMessages = formattedMessages.filter(
              (msg: Message) => !notifiedMessageIds.current.has(msg.id) && !msg.fromSelf
            );

            if (newMessages.length > 0) {
              const lastNewMessage = newMessages[newMessages.length - 1];

              // Mark as notified
              newMessages.forEach((msg: Message) => notifiedMessageIds.current.add(msg.id));

              // Play sound if enabled
              if (soundEnabled && audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e));
              }

              // Show visual toast notification
              setToast({
                show: true,
                message: lastNewMessage.text,
                senderName: conversation.otherUser?.name || 'Usuario'
              });

              // Hide toast after 4 seconds
              setTimeout(() => setToast(null), 4000);
            }
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    // Initial load
    fetchMessages(false);

    // Auto-refresh every 3 seconds
    const pollInterval = setInterval(() => {
      fetchMessages(true);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [conversation?.id, session?.user?.id]);

  // Socket.IO Logic
  useEffect(() => {
    if (!socket || !conversation?.id) return;

    // Join conversation room
    socket.emit("join_conversation", conversation.id);

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      console.log('[ChatWindow] New message via Socket:', message);

      const formattedMessage: Message = {
        id: message.id,
        text: message.text,
        senderId: message.senderUserId || message.sender?.id,
        createdAt: new Date(message.createdAt),
        fromSelf: (message.senderUserId || message.sender?.id) === session?.user?.id
      };

      setMessages(prev => {
        if (prev.some(msg => msg.id === formattedMessage.id)) return prev;
        return [...prev, formattedMessage];
      });

      if (!formattedMessage.fromSelf && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    };

    // Listen for typing
    const handleTyping = (userId: string) => {
      if (userId !== session?.user?.id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (userId: string) => {
      if (userId !== session?.user?.id) {
        setIsTyping(false);
      }
    };

    const handleMessagesRead = (data: { userId: string, conversationId: string, readAt: string }) => {
      if (data.conversationId === conversation.id && data.userId !== session?.user?.id) {
        setMessages(prev => prev.map(msg =>
          msg.senderId === session?.user?.id && !msg.readAt
            ? { ...msg, readAt: new Date(data.readAt) }
            : msg
        ));
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.emit("leave_conversation", conversation.id);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, conversation?.id, session?.user?.id]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (!socket || !conversation?.id || !session?.user?.id || messages.length === 0) return;

    const unreadMessages = messages.filter(msg => !msg.fromSelf && !msg.readAt);

    if (unreadMessages.length > 0) {
      // Call API to update DB
      fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id })
      });

      // Emit socket event
      socket.emit("mark_messages_read", {
        conversationId: conversation.id,
        userId: session.user.id,
        readAt: new Date().toISOString()
      });
    }
  }, [socket, conversation?.id, messages, session?.user?.id]);

  // Handle typing events
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && conversation?.id && session?.user?.id) {
      if (e.target.value.length > 0) {
        socket.emit("typing", { conversationId: conversation.id, userId: session.user.id });
      } else {
        socket.emit("stop_typing", { conversationId: conversation.id, userId: session.user.id });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user?.id || !conversation?.id) return;

    const messageText = newMessage.trim();

    try {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: messageText,
        senderId: session.user.id,
        createdAt: new Date(),
        fromSelf: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      if (socket) {
        socket.emit("stop_typing", { conversationId: conversation.id, userId: session.user.id });
      }

      // Save to DB
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          text: messageText
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Emit to Socket.IO so others receive it
        if (socket) {
          socket.emit("send_message_client", {
            conversationId: conversation.id,
            ...data.message
          });
        }

        // Update local state with real message
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id
              ? {
                id: data.message.id,
                text: data.message.text,
                senderId: data.message.senderUserId,
                createdAt: new Date(data.message.createdAt),
                fromSelf: true
              }
              : msg
          )
        );
      } else {
        // Error handling
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageText);
        alert("Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Send error:", error);
      alert("Error al enviar mensaje");
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl font-bold text-blue-600">B2B</span>
          </div>
          <h2 className="text-2xl font-light text-gray-600">B2BChat</h2>
          <p className="mt-4 max-w-md text-sm text-gray-500">
            Selecciona una conversación para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#efeae2]">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-200 rounded-full text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="font-semibold text-blue-600">
              {conversation.otherUser?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {conversation.otherUser?.name || 'Usuario'}
            </h3>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500">
                {conversation.otherUser?.phone || ''}
              </p>
              {isConnected ? (
                <div className="flex items-center gap-1 ml-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-green-600">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 ml-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-xs text-red-500">Desconectado</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-gray-500">
          <button
            onClick={toggleSound}
            className="hover:bg-gray-200 p-2 rounded-full transition-colors"
            title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-blue-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full">
            <Search className="h-5 w-5" />
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast?.show && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[300px] max-w-md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-blue-600">
                  {toast.senderName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{toast.senderName}</p>
                <p className="text-gray-600 text-sm truncate mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No hay mensajes. ¡Envía el primero!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${msg.fromSelf
                  ? "bg-[#d9fdd3] rounded-tr-none"
                  : "bg-white rounded-tl-none"
                  }`}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
                <div className={`mt-1 flex items-center gap-1 ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-gray-500">
                    {msg.createdAt.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-xs text-gray-500 italic">
          Escribiendo...
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje"
            className="flex-1 rounded-lg border-none bg-white py-2 px-4 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
            value={newMessage}
            onChange={handleTyping}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Toast Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
