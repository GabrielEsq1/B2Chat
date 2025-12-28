"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, MoreVertical, Volume2, VolumeX, Smile, Phone, Video, Paperclip } from "lucide-react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmGcHjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audioRef.current.volume = 0.5;
    const savedPref = localStorage.getItem('chatSoundEnabled');
    if (savedPref !== null) setSoundEnabled(savedPref === 'true');
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('chatSoundEnabled', String(newValue));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

          setMessages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(formattedMessages)) return prev;
            return formattedMessages;
          });

          if (isPolling && formattedMessages.length > messages.length) {
            const newMessages = formattedMessages.filter(
              (msg: Message) => !notifiedMessageIds.current.has(msg.id) && !msg.fromSelf
            );

            if (newMessages.length > 0) {
              newMessages.forEach((msg: Message) => notifiedMessageIds.current.add(msg.id));
              if (soundEnabled && audioRef.current) audioRef.current.play().catch(() => { });
            }
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchMessages(false);
    const pollInterval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(pollInterval);
  }, [conversation?.id, session?.user?.id]);

  useEffect(() => {
    if (!socket || !conversation?.id) return;
    socket.emit("join_conversation", conversation.id);

    const handleNewMessage = (message: any) => {
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

      if (!formattedMessage.fromSelf && audioRef.current && soundEnabled) {
        audioRef.current.play().catch(() => { });
      }
    };

    const handleTyping = (userId: string) => userId !== session?.user?.id && setIsTyping(true);
    const handleStopTyping = (userId: string) => userId !== session?.user?.id && setIsTyping(false);

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.emit("leave_conversation", conversation.id);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, conversation?.id, session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !conversation?.id) return;
    const messageText = newMessage.trim();

    try {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: messageText,
        senderId: session.user.id,
        createdAt: new Date(),
        fromSelf: true
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      if (socket) socket.emit("stop_typing", { conversationId: conversation.id, userId: session.user.id });

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, text: messageText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (socket) socket.emit("send_message_client", { conversationId: conversation.id, ...data.message });
        setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? { ...msg, id: data.message.id } : msg));
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageText);
      }
    } catch {
      setNewMessage(messageText);
    }
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && conversation?.id && session?.user?.id) {
      e.target.value.length > 0 ?
        socket.emit("typing", { conversationId: conversation.id, userId: session.user.id }) :
        socket.emit("stop_typing", { conversationId: conversation.id, userId: session.user.id });
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex bg-slate-50 h-full flex-col relative z-0">

      {/* 1. Modern Header */}
      <div className="flex h-16 items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative">
            {conversation.otherUser?.avatar ? (
              <img src={conversation.otherUser.avatar} alt="User" className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {conversation.otherUser?.name?.charAt(0)}
              </div>
            )}
            {isConnected && <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 leading-tight">
              {conversation.otherUser?.name || 'Usuario'}
            </h3>
            <p className="text-xs font-medium text-gray-500">
              {conversation.otherUser?.phone || 'En línea'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleSound} className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-all">
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-green-600 rounded-full transition-all">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-purple-600 rounded-full transition-all">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-all">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center opacity-40">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
              <Send className="h-10 w-10 text-gray-400 ml-1" />
            </div>
            <p className="text-lg font-bold text-gray-400">Comienza a charlar</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
              <div className={`
                    max-w-[70%] relative px-5 py-3 shadow-sm text-[15px] leading-relaxed
                    ${msg.fromSelf
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                }
                `}>
                <p>{msg.text}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 ${msg.fromSelf ? "text-blue-200" : "text-gray-400"}`}>
                  <span className="text-[10px] font-medium">
                    {msg.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.fromSelf && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-2 text-sm italic flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-50 p-2 rounded-3xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-all">
            <Smile className="h-6 w-6" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl">
              <EmojiPicker onEmojiClick={(emoji) => { setNewMessage(prev => prev + emoji.emoji); setShowEmojiPicker(false); }} />
            </div>
          )}

          <button type="button" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all">
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 font-medium px-2"
            value={newMessage}
            onChange={handleTypingChange}
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-200"
          >
            <Send className="h-5 w-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
