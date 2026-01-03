"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, MessageSquare, User, MoreVertical, X, ArrowLeft, Globe, Trash2, Loader2, Check, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import InvitationModal from "./InvitationModal";
import CreateGroupModal from "./CreateGroupModal";
import GlobalCompanySearch from "./GlobalCompanySearch";
import FastAdsBar from "./FastAdsBar";

interface Conversation {
    id: string;
    type: "USER_USER" | "GROUP";
    participants: any[];
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount?: number;
    name?: string; // Group name
    avatar?: string; // Group or user avatar
    memberCount?: number; // Group only
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
    isFullWidth?: boolean;
}

export default function ChatSidebar({ onSelectConversation, selectedId, isFullWidth = false }: ChatSidebarProps) {
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
    const [searchQuery, setSearchQuery] = useState("");
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
                    // API already returns otherUser, so use it directly
                    return {
                        id: conv.id,
                        otherUser: conv.otherUser || null,
                        lastMessage: conv.lastMessage?.text || null,
                        lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
                        unreadCount: 0,
                        type: conv.type,
                        name: conv.name,
                        avatar: conv.avatar,
                        memberCount: conv.memberCount,
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
        if (!searchQuery.trim() || searchQuery.length < 3) return;

        try {
            const res = await fetch(`/api/contacts/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data.users && data.users.length > 0) {
                // Contacts found
                setSearchResults(data.users);
            } else if (data.users && data.users.length === 0) {
                // No contact found, show invitation modal if it looks like a phone
                // or just let the user type the phone to invite
                const isPhone = /^\+?[\d\s-]{8,}$/.test(searchQuery);
                if (isPhone) {
                    setInvitedPhone(searchQuery);
                    setShowInvitationModal(true);
                    setSearchQuery("");
                } else {
                    // Just show a message or generic invitation button
                    setSearchResults([]);
                    // Optional: could show a "No results, want to invite someone?" button
                }
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error searching contact:', error);
            alert('Error al buscar contacto');
        }
    };

    const handleStartChat = async (userId: string) => {
        console.log('[ChatSidebar] Starting chat with userId:', userId);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });

            const data = await res.json();
            console.log('[ChatSidebar] Conversation response:', data);

            if (data.conversation) {
                // Get the full conversation with user data
                const conv = data.conversation;

                // Determine otherUser from conversation
                const otherUser = conv.userAId === session?.user?.id ? conv.userB : conv.userA;

                // Create properly formatted conversation object
                const formattedConversation: Conversation = {
                    id: conv.id,
                    type: "USER_USER",
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        phone: otherUser.phone,
                        avatar: otherUser.avatar || otherUser.profilePicture
                    },
                    participants: []
                };

                console.log('[ChatSidebar] Formatted conversation:', formattedConversation);

                setShowNewChat(false);
                setSearchQuery("");
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
                alert('Conversaciones eliminadas con éxito');
            } else {
                alert('Error al eliminar conversaciones');
            }
        } catch (error) {
            console.error('Error deleting conversations:', error);
            alert('Error al eliminar conversaciones');
        }
    };

    const fetchStarredMessages = async () => {
        try {
            const res = await fetch('/api/messages/starred');
            const data = await res.json();
            if (data.messages) {
                setStarredMessagesList(data.messages);
            }
        } catch (error) {
            console.error('Error fetching starred messages:', error);
        }
    };

    const [starredMessagesList, setStarredMessagesList] = useState<any[]>([]);

    useEffect(() => {
        if (showStarredMessages) {
            fetchStarredMessages();
        }
    }, [showStarredMessages]);

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.otherUser?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="rounded-full p-2 hover:bg-gray-200 text-gray-600"
                        title="Volver al dashboard"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowProfileEdit(true)}
                        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors"
                        title="Editar perfil"
                    >
                        {(session?.user as any)?.avatar || (session?.user as any)?.profilePicture ? (
                            <img
                                src={(session?.user as any).avatar || (session?.user as any).profilePicture}
                                alt={session?.user?.name || 'User'}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">
                                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <span className="font-medium text-gray-700 hidden sm:inline">{session?.user?.name}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGlobalSearch(true)}
                        className="rounded-full p-2 hover:bg-gray-200 text-green-600"
                        title="Marketplace de empresas (3000+)"
                        aria-label="Buscar empresas"
                    >
                        <Globe className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowNewChat(!showNewChat)}
                        className="rounded-full p-2 hover:bg-gray-200 text-blue-600"
                        aria-label="Nuevo chat"
                        title="Nuevo chat"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="rounded-full p-2 hover:bg-gray-200 text-gray-600"
                            aria-label="Opciones"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showOptionsMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-xl border border-gray-200 z-[9999]">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowNewGroup(true);
                                            setShowOptionsMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                    >
                                        <Users className="h-4 w-4 text-gray-400" />
                                        Nuevo grupo
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                        onClick={() => {
                                            setShowProfileEdit(true);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        Mi Perfil
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                        onClick={() => {
                                            setShowStarredMessages(true);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        <Star className="h-4 w-4 text-gray-400" />
                                        Mensajes destacados
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setIsSelectionMode(!isSelectionMode);
                                            setSelectedChats([]);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        {isSelectionMode ? "Cancelar selección" : "Seleccionar chats"}
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setShowOptionsMenu(false);
                                            window.location.href = '/dashboard/profile';
                                        }}
                                    >
                                        Configuración
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowOptionsMenu(false);
                                            window.location.href = '/api/auth/signout';
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Profile Edit Modal */}
            {
                showProfileEdit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Editar Perfil</h3>
                                <button onClick={() => setShowProfileEdit(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-5">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-50">
                                            {(session?.user as any)?.avatar ? (
                                                <img src={(session?.user as any).avatar} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-blue-600">{(session?.user as any)?.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-bold text-gray-700 mb-1.5">Nombre Completo</label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Teléfono (No editable)</label>
                                    <input
                                        type="tel"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                                        value={(session?.user as any)?.phone || ''}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setShowProfileEdit(false)}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        setSavingProfile(true);
                                        try {
                                            const res = await fetch('/api/user/profile', {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ name: editName })
                                            });
                                            if (res.ok) {
                                                alert('Perfil actualizado correctamente');
                                                setShowProfileEdit(false);
                                                window.location.reload();
                                            }
                                        } catch (error) {
                                            alert('Error al actualizar perfil');
                                        } finally {
                                            setSavingProfile(false);
                                        }
                                    }}
                                    disabled={savingProfile}
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Starred Messages Modal */}
            {
                showStarredMessages && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-2xl bg-white p-0 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between p-6 border-b shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-400/10 rounded-xl">
                                        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Mensajes Destacados</h3>
                                </div>
                                <button
                                    onClick={() => setShowStarredMessages(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                {starredMessagesList.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="h-10 w-10 text-gray-200" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-400">No hay mensajes destacados</p>
                                        <p className="text-xs mt-2 px-10">
                                            Tus mensajes importantes aparecerán aquí para que puedas encontrarlos fácilmente.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {starredMessagesList.map((msg) => (
                                            <div key={msg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-200 transition-colors">
                                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>Chat con {msg.otherUserName}</span>
                                                    <span>•</span>
                                                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-blue-600">{msg.sender.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-900 mb-1">{msg.sender.name}</p>
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* New Group Modal */}
            {
                showNewGroup && (
                    <CreateGroupModal
                        onClose={() => setShowNewGroup(false)}
                        onCreateGroup={handleCreateGroup}
                    />
                )
            }

            {/* Selection Mode Banner */}
            {
                isSelectionMode && (
                    <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white animate-in slide-in-from-top duration-300 flex-shrink-0 z-50">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center bg-white/20 rounded-full text-sm font-black ring-2 ring-white/30 truncate">
                                {selectedChats.length}
                            </span>
                            <span className="font-bold text-sm tracking-tight">
                                {selectedChats.length === 1 ? 'Conversación seleccionada' : 'Conversaciones seleccionadas'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedChats.length > 0 && (
                                <button
                                    onClick={handleDeleteConversations}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 border border-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    ELIMINAR
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedChats([]);
                                }}
                                className="text-sm font-bold hover:underline opacity-80"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Ads Bar */}
            <div className="flex-shrink-0">
                <FastAdsBar />
            </div>

            {/* Search Section */}
            <div className="p-3 bg-white flex-shrink-0">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Busca tus chats o explora el marketplace..."
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-8 scrollbar-hide">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando conversaciones...</p>
                    </div>
                ) : (
                    <>
                        {/* New Chat Area (Inline when searching and no local results found) */}
                        {showNewChat && (
                            <div className="mb-6 rounded-3xl bg-blue-50/50 p-4 border-2 border-dashed border-blue-200 animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Nuevo Chat Directo</h3>
                                    <button onClick={() => setShowNewChat(false)} className="text-blue-400 hover:text-blue-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                                        <input
                                            type="text"
                                            placeholder="Nombre, email o celular del contacto..."
                                            className="w-full rounded-2xl border-2 border-blue-100 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearchContact()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearchContact}
                                        className="rounded-2xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                                    >
                                        BUSCAR EN TODA LA RED
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleStartChat(user.id)}
                                                className="group flex items-center gap-3 rounded-2xl bg-white p-3 text-left hover:bg-blue-50 cursor-pointer transition-all border border-blue-100 shadow-sm"
                                            >
                                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 flex-shrink-0 shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-[10px] text-blue-500 font-bold uppercase truncate">{user.company?.name || 'Usuario B2BChat'}</p>
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Local Conversations (Current Chats) */}
                        <div className="mt-2">
                            {searchTerm === "" && !showNewChat && (
                                <h4 className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chats Recientes</h4>
                            )}
                            <div className={`${isFullWidth && searchTerm === "" ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}`}>
                                {filteredConversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                setSelectedChats(prev =>
                                                    prev.includes(conv.id)
                                                        ? prev.filter(id => id !== conv.id)
                                                        : [...prev, conv.id]
                                                );
                                            } else {
                                                onSelectConversation(conv);
                                            }
                                        }}
                                        className={`relative group cursor-pointer flex flex-col p-4 rounded-[2rem] transition-all border-2 ${selectedId === conv.id
                                            ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200 scale-[1.02] z-10"
                                            : "bg-white border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-gray-100"
                                            } ${selectedChats.includes(conv.id) ? "ring-4 ring-blue-500/30 border-blue-500" : ""}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isSelectionMode && (
                                                <div className="flex-shrink-0 animate-in slide-in-from-left-2 duration-200">
                                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedChats.includes(conv.id) ? 'bg-white border-white text-blue-600 shadow-md' : 'bg-transparent border-gray-200'}`}>
                                                        {selectedChats.includes(conv.id) && <Check className="h-4 w-4 stroke-[4]" />}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="relative h-16 w-16 shrink-0">
                                                <div className={`h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center font-black text-2xl transition-all shadow-sm ${selectedId === conv.id ? 'from-white/20 to-white/10 text-white ring-2 ring-white/30' : 'text-blue-600 ring-4 ring-gray-50'}`}>
                                                    {conv.type === "GROUP" ? (
                                                        <div className="h-full w-full flex items-center justify-center bg-indigo-100 rounded-[1.5rem] text-indigo-600">
                                                            <Users className="h-8 w-8" />
                                                        </div>
                                                    ) : conv.otherUser?.avatar || conv.otherUser?.profilePicture ? (
                                                        <img
                                                            src={conv.otherUser.avatar || conv.otherUser.profilePicture}
                                                            alt={conv.otherUser.name}
                                                            className="h-full w-full object-cover rounded-[1.5rem]"
                                                        />
                                                    ) : (
                                                        conv.otherUser?.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                {conv.type !== "GROUP" && conv.otherUser?.id && onlineUsers.has(conv.otherUser.id) && (
                                                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-4 border-white"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className={`font-black tracking-tight truncate ${selectedId === conv.id ? 'text-white' : 'text-gray-900 text-lg'}`}>
                                                        {conv.type === "GROUP" ? conv.name : (conv.otherUser?.name || 'Sin nombre')}
                                                    </h3>
                                                    {conv.lastMessageAt && (
                                                        <span className={`text-[10px] font-black uppercase opacity-60 shrink-0 ${selectedId === conv.id ? 'text-white' : 'text-gray-400'}`}>
                                                            {new Date(conv.lastMessageAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm truncate font-bold leading-tight opacity-80 ${selectedId === conv.id ? 'text-blue-50' : 'text-gray-500'}`}>
                                                        {conv.type === "GROUP" && !conv.lastMessage ? `Grupo • ${conv.memberCount} miembros` : (conv.lastMessage || 'Empieza la conversación...')}
                                                    </p>
                                                    {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-red-500 text-[10px] font-black text-white shadow-lg ring-2 ring-white animate-bounce-slow">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Marketplace Results (External Search) */}
                        {searchTerm.length >= 2 && (
                            <div className="mt-8">
                                <h4 className="px-2 mb-4 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-blue-100"></div>
                                    Red Global B2BChat (3000+)
                                    <div className="h-1 flex-1 bg-blue-100"></div>
                                </h4>
                                {isSearchingGlobal ? (
                                    <div className="flex items-center justify-center py-10 gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        <span className="text-xs font-bold text-gray-400">Escaneando base de datos...</span>
                                    </div>
                                ) : globalResults.length === 0 ? (
                                    <div className="px-2 py-6 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 italic">No se encontraron más resultados globales</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {globalResults.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleStartChat(user.id)}
                                                className="group flex items-center gap-3 p-4 rounded-[1.5rem] cursor-pointer bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
                                            >
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm group-hover:scale-110 transition-transform">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-gray-900 leading-none mb-1">{user.name}</p>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">
                                                        {user.companyName || 'Usuario Independiente'}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showInvitationModal && (
                <InvitationModal
                    phone={invitedPhone}
                    onClose={() => setShowInvitationModal(false)}
                />
            )}

            {showGlobalSearch && (
                <GlobalCompanySearch
                    onClose={() => setShowGlobalSearch(false)}
                    onStartChat={handleStartChat}
                />
            )}
        </div>
    );
}
