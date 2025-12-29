"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, MessageSquare, User, MoreVertical, X, ArrowLeft, Globe, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import InvitationModal from "./InvitationModal";
import CreateGroupModal from "./CreateGroupModal";
import GlobalCompanySearch from "./GlobalCompanySearch";
import FastAdsBar from "./FastAdsBar";

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
                const formattedConversation = {
                    id: conv.id,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                        phone: otherUser.phone,
                        avatar: otherUser.avatar || otherUser.profilePicture
                    },
                    participants: [] // Added to satisfy interface
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
        <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
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
                        <span className="font-medium text-gray-700">{session?.user?.name}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGlobalSearch(true)}
                        className="rounded-full p-2 hover:bg-gray-200 text-green-600"
                        title="Buscar empresas globalmente"
                        aria-label="Buscar empresas"
                    >
                        <Globe className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowNewChat(!showNewChat)}
                        className="rounded-full p-2 hover:bg-gray-200 text-blue-600"
                        aria-label="Nuevo chat"
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
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Nuevo grupo
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setShowStarredMessages(true);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Editar Perfil</h3>
                                <button onClick={() => setShowProfileEdit(false)} className="text-gray-500 hover:text-gray-700" title="Cerrar">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input
                                        id="edit-phone"
                                        type="tel"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                                        value={(session?.user as any)?.phone || ''}
                                        disabled
                                        title="El teléfono no se puede cambiar"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">El teléfono no se puede cambiar</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowProfileEdit(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                                                alert('Perfil actualizado');
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
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {savingProfile ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Starred Messages Modal */}
            {
                showStarredMessages && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Mensajes Destacados</h3>
                                <button
                                    onClick={() => setShowStarredMessages(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                    title="Cerrar"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <p>No tienes mensajes destacados</p>
                                <p className="text-sm mt-2">Mantén presionado un mensaje y selecciona la estrella para destacarlo</p>
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

            {/* New Chat Modal */}
            {
                showNewChat && (
                    <div className="border-b border-gray-200 bg-blue-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">Nuevo Chat</h3>
                            <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre, email o teléfono..."
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchContact()}
                                />
                            </div>
                            <button
                                onClick={handleSearchContact}
                                className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 w-full"
                            >
                                Buscar
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleStartChat(user.id)}
                                        className="w-full flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold flex-shrink-0 overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.company?.name || user.email || user.phone}</p>
                                        </div>
                                        <Plus className="h-4 w-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchQuery.length > 0 && searchResults.length === 0 && (
                            <div className="mt-4 rounded-lg bg-white border border-gray-100 p-6 text-center shadow-sm">
                                <p className="text-sm text-gray-500 mb-4">No se encontraron usuarios registrados.</p>
                                <button
                                    onClick={() => {
                                        const isPhone = /^\+?[\d\s-]{8,}$/.test(searchQuery);
                                        setInvitedPhone(isPhone ? searchQuery : "");
                                        setShowInvitationModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Invitar por WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Contacts List in New Chat */}
            {
                showNewChat && searchResults.length === 0 && (
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-2">
                        <h4 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase">Tus Contactos</h4>
                        {contacts.length === 0 ? (
                            <p className="px-2 text-sm text-gray-500">No tienes contactos aún.</p>
                        ) : (
                            <div className="space-y-1">
                                {contacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleStartChat(contact.id)}
                                        className="w-full flex items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${contact.isBot ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} font-bold text-xs flex-shrink-0 overflow-hidden`}>
                                            {contact.avatar ? (
                                                <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" />
                                            ) : (
                                                contact.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-900 text-sm truncate">{contact.name}</p>
                                                {contact.isBot && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">AI</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {contact.isBot ? contact.botPersonality : contact.company?.name}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* Search */}
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o celular..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 font-semibold placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Selection Mode Banner */}
            {
                isSelectionMode && (
                    <div className="bg-blue-100 px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedChats.length} seleccionado{selectedChats.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-3">
                            {selectedChats.length > 0 && (
                                <button
                                    onClick={handleDeleteConversations}
                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                    title="Eliminar seleccionados"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedChats([]);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Cargando...</div>
                ) : (
                    <>
                        {filteredConversations.length === 0 && searchTerm.length < 3 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                                <p className="mt-2 text-sm text-gray-500">
                                    No hay conversaciones
                                </p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Iniciar nuevo chat
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
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
                                    className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${selectedId === conv.id ? "bg-blue-50" : ""
                                        } ${selectedChats.includes(conv.id) ? "bg-blue-100" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {isSelectionMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedChats.includes(conv.id)}
                                                    onChange={() => { }}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    title="Seleccionar chat"
                                                />
                                            )}
                                            {conv.otherUser?.avatar || conv.otherUser?.profilePicture ? (
                                                <div className="relative h-12 w-12 flex-shrink-0">
                                                    <img
                                                        src={conv.otherUser.avatar || conv.otherUser.profilePicture}
                                                        alt={conv.otherUser.name}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                    {conv.otherUser?.id && onlineUsers.has(conv.otherUser.id) && (
                                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative h-12 w-12 flex-shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-lg font-semibold text-blue-600">
                                                            {conv.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    {conv.otherUser?.id && onlineUsers.has(conv.otherUser.id) && (
                                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {conv.otherUser?.name || 'Usuario'}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conv.lastMessage || 'Sin mensajes'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {conv.lastMessageAt && (
                                                <span className="text-xs text-gray-400" suppressHydrationWarning>
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                            {conv.unreadCount && conv.unreadCount > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Global Search Results Inline */}
                        {searchTerm.length >= 3 && (
                            <div className="mt-4 border-t border-gray-100 p-2">
                                <h4 className="px-3 mb-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                    {isSearchingGlobal ? 'Buscando empresas...' : 'Marketplace de empresas'}
                                </h4>
                                {globalResults.length === 0 && !isSearchingGlobal && (
                                    <p className="px-3 py-4 text-xs text-gray-500 italic">No se encontraron más resultados</p>
                                )}
                                <div className="space-y-1">
                                    {globalResults.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleStartChat(user.id)}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-[11px] text-gray-600 truncate">
                                                    {user.companyName || 'Usuario'}
                                                </p>
                                            </div>
                                            <div className="text-blue-600 bg-blue-100/50 p-2 rounded-lg">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Invitation Modal */}
            {
                showInvitationModal && (
                    <InvitationModal
                        phone={invitedPhone}
                        onClose={() => setShowInvitationModal(false)}
                    />
                )
            }

            {/* Global Company Search Modal */}
            {
                showGlobalSearch && (
                    <GlobalCompanySearch
                        onClose={() => setShowGlobalSearch(false)}
                        onStartChat={handleStartChat}
                    />
                )
            }
        </div>
    );
}
