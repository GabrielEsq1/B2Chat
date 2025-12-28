"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, MessageSquare, User, MoreVertical, X, ArrowLeft, Globe, Trash2, LogOut, Settings, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import InvitationModal from "./InvitationModal";
import CreateGroupModal from "./CreateGroupModal";
import GlobalCompanySearch from "./GlobalCompanySearch";
// import FastAdsBar from "./FastAdsBar"; // Removed from sidebar for cleaner look, or verify if needed. Keeping it for now but maybe outside? User said "Clean". I'll keep it but style it better.

interface Conversation {
    id: string;
    participants: any[];
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount?: number;
    otherUser?: {
        id: string;
        name: string;
        phone: string;
        avatar?: string;
        profilePicture?: string;
    };
}

interface ChatSidebarProps {
    onSelectConversation: (conversation: Conversation) => void;
    selectedId?: string;
}

export default function ChatSidebar({ onSelectConversation, selectedId }: ChatSidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewChat, setShowNewChat] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [showStarredMessages, setShowStarredMessages] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [searchPhone, setSearchPhone] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [invitedPhone, setInvitedPhone] = useState("");
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    // Profile edit state
    const [editName, setEditName] = useState(session?.user?.name || "");
    const [savingProfile, setSavingProfile] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [pusherClient, setPusherClient] = useState<any>(null);
    const [globalResults, setGlobalResults] = useState<any[]>([]);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    useEffect(() => {
        loadConversations();
        loadContacts();

        // Initialize Pusher for Presence
        import('@/lib/pusher-client').then(({ getPusherClient }) => {
            const pusher = getPusherClient();
            setPusherClient(pusher);

            const channel = pusher.subscribe('presence-global');

            channel.bind('pusher:subscription_succeeded', (members: any) => {
                const initialMembers = new Set<string>();
                members.each((member: any) => initialMembers.add(member.id));
                setOnlineUsers(initialMembers);
            });

            channel.bind('pusher:member_added', (member: any) => {
                setOnlineUsers(prev => new Set(prev).add(member.id));
            });

            channel.bind('pusher:member_removed', (member: any) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(member.id);
                    return next;
                });
            });

            return () => {
                pusher.unsubscribe('presence-global');
            };
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length < 3) {
            setGlobalResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const compRes = await fetch(`/api/companies/search?q=${encodeURIComponent(searchTerm)}`);
                const compData = await compRes.json();
                if (compData.companies) {
                    const users = compData.companies.flatMap((c: any) => c.users.map((u: any) => ({
                        ...u,
                        companyName: c.name,
                        isGlobal: true
                    })));
                    setGlobalResults(users.slice(0, 5));
                }
            } catch (error) {
                console.error("Global search error:", error);
            } finally {
                setIsSearchingGlobal(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const loadConversations = async () => {
        try {
            const res = await fetch('/api/conversations');
            const data = await res.json();

            if (data.conversations) {
                const processedConversations = data.conversations.map((conv: any) => {
                    return {
                        id: conv.id,
                        otherUser: conv.otherUser || null,
                        lastMessage: conv.lastMessage?.text || null,
                        lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
                        unreadCount: 0, // TODO: Calculate unread count
                    };
                });
                setConversations(processedConversations);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            if (data.contacts) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    };

    const handleSearchContact = async () => {
        if (!searchPhone.trim()) return;

        try {
            const res = await fetch(`/api/contacts/search?phone=${encodeURIComponent(searchPhone)}`);
            const data = await res.json();

            if (data.invited) {
                setInvitedPhone(searchPhone);
                setShowInvitationModal(true);
                setSearchPhone("");
                setShowNewChat(false);
            } else if (data.user) {
                setSearchResults([data.user]);
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error searching contact:', error);
            alert('Error al buscar contacto');
        }
    };

    const handleStartChat = async (userId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });

            const data = await res.json();

            if (data.conversation) {
                const conv = data.conversation;
                const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;

                const formattedConversation = {
                    id: conv.id,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        phone: otherUser.phone,
                        avatar: otherUser.avatar || otherUser.profilePicture
                    },
                    participants: []
                };

                setShowNewChat(false);
                setSearchPhone("");
                setSearchResults([]);
                loadConversations();
                onSelectConversation(formattedConversation);
            }
        } catch (error) {
            console.error('[ChatSidebar] Error creating conversation:', error);
        }
    };

    const handleCreateGroup = async (name: string, description: string, memberIds: string[]) => {
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, memberIds }),
            });

            const data = await res.json();

            if (data.group) {
                alert(`✅ Grupo "${name}" creado exitosamente`);
                loadConversations();
            }
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    };

    const handleDeleteConversations = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedChats.length} conversaciones?`)) return;

        try {
            const res = await fetch('/api/conversations', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationIds: selectedChats })
            });

            if (res.ok) {
                setSelectedChats([]);
                setIsSelectionMode(false);
                loadConversations();
            } else {
                alert('Error al eliminar conversaciones');
            }
        } catch (error) {
            console.error('Error deleting conversations:', error);
            alert('Error al eliminar conversaciones');
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.otherUser?.phone?.includes(searchTerm)
    );

    return (
        <div className="flex h-full w-full flex-col bg-white border-r border-gray-100 shadow-sm relative z-50">
            {/* 1. Contemporary Header */}
            <div className="flex h-16 items-center justify-between px-5 bg-white border-b border-gray-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="rounded-full p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mensajes</h1>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowGlobalSearch(true)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    >
                        <Globe className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowNewChat(!showNewChat)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showOptionsMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 z-[9999] py-2 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={() => { setShowNewGroup(true); setShowOptionsMenu(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" /> Nuevo grupo
                                </button>
                                <button
                                    onClick={() => { setShowStarredMessages(true); setShowOptionsMenu(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Star className="h-4 w-4" /> Destacados
                                </button>
                                <button
                                    onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedChats([]); setShowOptionsMenu(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> {isSelectionMode ? "Cancelar" : "Seleccionar"}
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => { setShowOptionsMenu(false); window.location.href = '/dashboard/profile'; }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" /> Configuración
                                </button>
                                <button
                                    onClick={() => { setShowOptionsMenu(false); window.location.href = '/api/auth/signout'; }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" /> Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Modern Search Bar */}
            <div className="px-5 py-3 bg-white">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar chats..."
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Conversations List */}
            <div className="flex-1 overflow-y-auto px-3">

                {/* Selection Mode Header */}
                {isSelectionMode && (
                    <div className="mb-3 mx-2 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-red-700">{selectedChats.length} seleccionados</span>
                        {selectedChats.length > 0 && (
                            <button
                                onClick={handleDeleteConversations}
                                className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold"
                            >
                                ELIMINAR
                            </button>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                ) : filteredConversations.length === 0 && searchTerm.length < 3 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">Sin mensajes</h3>
                        <p className="text-sm text-gray-500 mb-6">Tus conversaciones aparecerán aquí.</p>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Iniciar Chat
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1 pb-4">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    if (isSelectionMode) {
                                        setSelectedChats(prev => prev.includes(conv.id) ? prev.filter(id => id !== conv.id) : [...prev, conv.id]);
                                    } else {
                                        onSelectConversation(conv);
                                    }
                                }}
                                className={`
                                    group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent
                                    ${selectedId === conv.id ? "bg-blue-50/80 border-blue-100" : "hover:bg-gray-50"}
                                    ${selectedChats.includes(conv.id) ? "bg-red-50 border-red-100" : ""}
                                `}
                            >
                                {/* Checkbox for Selection Mode */}
                                {isSelectionMode && (
                                    <div className={`
                                        h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all
                                        ${selectedChats.includes(conv.id) ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"}
                                    `}>
                                        {selectedChats.includes(conv.id) && <User className="h-3 w-3 text-white" />}
                                    </div>
                                )}

                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {conv.otherUser?.avatar || conv.otherUser?.profilePicture ? (
                                        <img
                                            src={conv.otherUser.avatar || conv.otherUser.profilePicture}
                                            alt={conv.otherUser.name}
                                            className="h-12 w-12 rounded-2xl object-cover shadow-sm bg-gray-100"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {conv.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    )}
                                    {conv.otherUser?.id && onlineUsers.has(conv.otherUser.id) && (
                                        <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className={`font-bold text-[15px] truncate ${selectedId === conv.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {conv.otherUser?.name || 'Usuario'}
                                        </h3>
                                        {conv.lastMessageAt && (
                                            <span className={`text-[11px] font-medium ${selectedId === conv.id ? 'text-blue-500' : 'text-gray-400'}`}>
                                                {new Date(conv.lastMessageAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-[13px] truncate pr-4 ${selectedId === conv.id ? 'text-blue-700/80' : 'text-gray-500'}`}>
                                            {conv.lastMessage || 'Envía un mensaje...'}
                                        </p>
                                        {conv.unreadCount && conv.unreadCount > 0 ? (
                                            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                                                {conv.unreadCount}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Chat Slide-over / Modal (Simplified to absolute overlay for now) */}
            {showNewChat && (
                <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-left duration-200">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                        <button onClick={() => setShowNewChat(false)} className="p-2 -ml-2 hover:bg-gray-200 rounded-full">
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <h2 className="font-bold text-lg">Nuevo Chat</h2>
                    </div>
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Escribe un número (+57...)"
                                className="w-full bg-gray-100 border-none rounded-xl py-3 pl-4 pr-12 font-medium"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchContact()}
                            />
                            <button
                                onClick={handleSearchContact}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                            >
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tus Contactos</h3>
                        <div className="space-y-2">
                            {searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleStartChat(user.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-blue-50 transition-all text-left"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.phone}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleStartChat(contact.id)}
                                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all text-left"
                                    >
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${contact.isBot ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {contact.avatar || contact.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{contact.name}</p>
                                            <p className="text-xs text-gray-500">{contact.company?.name || contact.phone}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showInvitationModal && <InvitationModal phone={invitedPhone} onClose={() => setShowInvitationModal(false)} />}
            {showNewGroup && <CreateGroupModal onClose={() => setShowNewGroup(false)} onCreateGroup={handleCreateGroup} />}
            {showGlobalSearch && <GlobalCompanySearch onClose={() => setShowGlobalSearch(false)} onStartChat={handleStartChat} />}
            {showProfileEdit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-6 text-center">Editar Perfil</h3>
                        <div className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                                    {editName.charAt(0)}
                                </div>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Tu nombre"
                            />
                            <input
                                disabled
                                type="text"
                                className="w-full bg-gray-100 border-transparent rounded-xl px-4 py-3 font-medium text-gray-500"
                                value={(session?.user as any)?.phone || ''}
                            />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button onClick={() => setShowProfileEdit(false)} className="py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
                                <button
                                    onClick={async () => {
                                        setSavingProfile(true);
                                        try {
                                            await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) });
                                            window.location.reload();
                                        } catch (e) { alert('Error'); } finally { setSavingProfile(false); }
                                    }}
                                    className="py-3 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
