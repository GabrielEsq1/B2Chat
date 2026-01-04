"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Search, MoreVertical, Volume2, VolumeX, Smile, Star, Users, X, Mail } from "lucide-react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useSocket } from "@/components/providers/SocketProvider";
import FastAdsBar from "./FastAdsBar";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  createdAt: Date;
  fromSelf: boolean;
  readAt?: Date;
  isStarred?: boolean;
}

interface ChatWindowProps {
  conversation?: any;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ show: boolean, message: string, senderName: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedMessageIds = useRef<Set<string>>(new Set());
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");

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
            senderName: msg.sender?.name,
            senderAvatar: msg.sender?.avatar || msg.sender?.profilePicture,
            createdAt: new Date(msg.createdAt),
            fromSelf: msg.senderUserId === session?.user?.id,
            isStarred: msg.isStarred
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
        senderName: message.sender?.name,
        senderAvatar: message.sender?.avatar || message.sender?.profilePicture,
        createdAt: new Date(message.createdAt),
        fromSelf: (message.senderUserId || message.sender?.id) === session?.user?.id,
        isStarred: message.isStarred
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

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const [emailToast, setEmailToast] = useState<{ show: boolean, recipientEmail: string } | null>(null);

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

        // Show email sent notification if applicable
        if (data.emailSent) {
          setEmailToast({
            show: true,
            recipientEmail: conversation.otherUser?.email || 'el destinatario'
          });
          setTimeout(() => setEmailToast(null), 5000);
        }

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
        alert(t('common.error'));
      }
    } catch (error) {
      console.error("Send error:", error);
      alert(t('common.error'));
    }
  };
  const toggleStar = async (messageId: string, isCurrentlyStarred: boolean) => {
    try {
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: !isCurrentlyStarred } : m));

      const res = await fetch(`/api/messages/${messageId}/star`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !isCurrentlyStarred })
      });

      if (!res.ok) {
        // Rollback
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: isCurrentlyStarred } : m));
        alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error toggling star:', error);
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
            {t('chat.window.select_chat')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#efeae2]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-3 sm:px-4 py-2 border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600 flex-shrink-0 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${conversation.type === "GROUP" ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"}`}>
            {conversation.type === "GROUP" ? (
              <Users className="h-5 w-5" />
            ) : (
              <span className="font-bold text-sm sm:text-base">
                {conversation.otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate leading-tight">
              {conversation.type === "GROUP" ? conversation.name : (conversation.otherUser?.name || t('chat.sidebar.no_name', { defaultValue: 'Usuario' }))}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {conversation.type === "GROUP" ? (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {conversation.memberCount} {t('chat.window.member')}
                </p>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[120px]">
                    {conversation.otherUser?.phone || ''}
                  </p>
                  {isConnected ? (
                    <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full ring-1 ring-green-100">
                      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">{t('chat.window.online')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-full">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{t('chat.window.offline')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 text-gray-500 flex-shrink-0">
          {conversation.type !== "GROUP" && conversation.otherUser?.phone && (
            <button
              onClick={async () => {
                if (confirm(t('chat.window.whatsapp.confirm', { name: conversation.otherUser?.name || 'Usuario' }))) {
                  try {
                    const lastMessage = messages[messages.length - 1];
                    const res = await fetch('/api/whatsapp/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        conversationId: conversation.id,
                        text: lastMessage?.text || t('chat.window.whatsapp.default_text'),
                        recipientPhone: conversation.otherUser.phone
                      })
                    });
                    if (res.ok) {
                      alert(`✅ ${t('chat.window.whatsapp.success')}`);
                    } else {
                      alert(`❌ ${t('chat.window.whatsapp.error')}`);
                    }
                  } catch (error) {
                    alert(`❌ ${t('chat.window.whatsapp.error')}`);
                  }
                }
              }}
              className="hover:bg-gray-200 p-2 rounded-full transition-colors hidden sm:block"
              title={t('chat.window.whatsapp.title')}
            >
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          )}
          <button
            onClick={toggleSound}
            className="hover:bg-gray-200 p-2 rounded-full transition-colors hidden sm:block"
            title={soundEnabled ? t('chat.window.options.mute') : t('chat.window.options.unmute', { defaultValue: 'Activar sonido' })}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-blue-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setShowSearchInChat(!showSearchInChat)}
            className={`p-2 rounded-full transition-colors hidden sm:block ${showSearchInChat ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-500'}`}
            title={t('chat.window.options.search')}
          >
            <Search className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className={`p-2 rounded-full transition-colors ${showChatOptions ? 'bg-gray-200' : 'hover:bg-gray-200 text-gray-500'}`}
              title={t('chat.window.options.more')}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showChatOptions && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    const info = conversation.type === 'GROUP'
                      ? `Grupo: ${conversation.name}\nMiembros: ${conversation.memberCount}`
                      : `Contacto: ${conversation.otherUser?.name || 'Usuario'}\nTeléfono: ${conversation.otherUser?.phone || 'Sin teléfono'}\nID: ${conversation.otherUser?.id || 'N/A'}`;
                    alert(info);
                    setShowChatOptions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-gray-400" />
                  {t('chat.window.options.info', { defaultValue: 'Info. del contacto' })}
                </button>
                <button
                  onClick={() => {
                    toggleSound();
                    setShowChatOptions(false);
                    // Slight delay to verify state change visually if we had an indicator, for now just alert
                    // setTimeout(() => alert(soundEnabled ? 'Sonido desactivado' : 'Sonido activado'), 100);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                  {soundEnabled ? t('chat.window.options.mute', { defaultValue: 'Silenciar notificaciones' }) : t('chat.window.options.unmute', { defaultValue: 'Activar sonido' })}
                </button>
                <button
                  onClick={async () => {
                    if (confirm(t('chat.delete_confirm', { defaultValue: '¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer.' }))) {
                      try {
                        const res = await fetch('/api/conversations', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ conversationIds: [conversation.id] })
                        });
                        if (res.ok) {
                          window.location.href = '/dashboard';
                        } else {
                          alert(t('common.error', { defaultValue: 'Error al eliminar' }));
                        }
                      } catch (error) {
                        console.error('Error deleting:', error);
                        alert(t('common.error', { defaultValue: 'Error al eliminar' }));
                      }
                    }
                    setShowChatOptions(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-red-400" />
                  {t('chat.window.options.delete', { defaultValue: 'Eliminar chat' })}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ads Bar */}
      <div className="flex-shrink-0">
        <FastAdsBar />
      </div>

      {/* Inline Search Bar */}
      {showSearchInChat && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder={t('chat.window.options.search')}
              className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
            />
            {inChatSearchQuery && (
              <button
                onClick={() => setInChatSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification for incoming messages */}
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
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Sent Notification */}
      {emailToast?.show && (
        <div className="absolute bottom-24 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-600 text-white rounded-xl shadow-xl px-5 py-3 border border-blue-500/30 flex items-center gap-3 backdrop-blur-sm">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">{t('chat.window.email_toast.title')}</p>
              <p className="text-sm font-medium">{t('chat.window.email_toast.body', { email: emailToast.recipientEmail })}</p>
            </div>
            <button
              onClick={() => setEmailToast(null)}
              className="ml-2 hover:bg-white/10 p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('chat.window.loading')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('chat.window.no_messages')}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex group ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
              <div className={`relative flex items-end gap-2 max-w-[85%] ${msg.fromSelf ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`rounded-2xl px-4 py-2 shadow-sm ${msg.fromSelf
                    ? "bg-[#d9fdd3] text-gray-800 rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    }`}
                >
                  {conversation.type === "GROUP" && !msg.fromSelf && (
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                      {msg.senderName || t('chat.window.member')}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  <div className={`mt-1 flex items-center gap-1.5 ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] opacity-50 font-bold uppercase">
                      {msg.createdAt.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.isStarred && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>

                {/* Star Toggle Action */}
                <button
                  onClick={() => toggleStar(msg.id, !!msg.isStarred)}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-black/5 transition-all ${msg.isStarred ? 'opacity-100 text-yellow-500' : 'text-gray-300'}`}
                  title={msg.isStarred ? t('chat.window.unstar_title') : t('chat.window.starred_title')}
                >
                  <Star className={`h-4 w-4 ${msg.isStarred ? 'fill-yellow-500' : ''}`} />
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-xs text-gray-500 italic">
          {t('chat.window.typing')}
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Smile className="h-6 w-6" />
          </button>
          <input
            type="text"
            placeholder={t('chat.window.input_placeholder')}
            className="flex-1 rounded-lg border-none bg-white py-2 px-4 text-sm text-gray-900 font-medium placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
