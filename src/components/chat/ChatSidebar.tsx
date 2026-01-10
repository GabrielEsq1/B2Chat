"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, MessageSquare, User, MoreVertical, X, ArrowLeft, Globe, Trash2, Loader2, Check, Star, Users, VolumeX, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import InvitationModal from "./InvitationModal";
import CreateGroupModal from "./CreateGroupModal";
import GlobalCompanySearch from "./GlobalCompanySearch";
import FastAdsBar from "./FastAdsBar";
import { useLanguage } from "@/context/LanguageContext";

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
    isPinned?: boolean;
    isFavorite?: boolean;
    otherUser?: {
        id: string;
        name: string;
        phone: string;
        avatar?: string;
        profilePicture?: string;
    };
    // Economic Identity (Block 2)
    intentScore?: number;
    estimatedValue?: number;
    stage?: string;
}

interface ChatSidebarProps {
    onSelectConversation: (conversation: Conversation) => void;
    selectedId?: string;
    isFullWidth?: boolean;
}

export default function ChatSidebar({ onSelectConversation, selectedId, isFullWidth = false }: ChatSidebarProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
    const [initialGroupMembers, setInitialGroupMembers] = useState<string[]>([]);

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
    }, [session?.user?.id]);

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
                // The API returns { localResults: [], externalResults: [] }
                // We want to prioritize local results, then external.
                const allResults = [
                    ...(compData.localResults || []),
                    ...(compData.externalResults || [])
                ].map((u: any) => ({
                    ...u,
                    companyName: u.company || u.companyName || (u.isLocal ? t('chat.sidebar.independent_user') : u.source),
                    isGlobal: true,
                    // Ensure we have a consistent ID format
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar || u.image || "",
                }));

                setGlobalResults(allResults.slice(0, 5));
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
            setLoading(true);
            setError(null);
            // Adding timestamp and cache: 'no-store' to avoid stale results or 401s from cache
            const res = await fetch(`/api/conversations?t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });

            const data = await res.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            if (data.conversations) {
                const processedConversations = data.conversations.map((conv: any) => {
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
                        isPinned: conv.isPinned,
                        isFavorite: conv.isFavorite,
                        intentScore: conv.intentScore || 0,
                        estimatedValue: conv.estimatedValue,
                        stage: conv.stage
                    };
                });

                const sorted = processedConversations.sort((a: any, b: any) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;

                    // Smart Ranking (Block 2): Intent * 0.6 + Recency * 0.4
                    // Normalize intent (0-100) and Recency (hours since now?)
                    // For simpler implementation now:
                    // 1. Pinned
                    // 2. High Intent (>50) AND Unread -> Top Priority
                    // 3. Recency

                    const scoreA = (a.intentScore || 0) + (a.unreadCount > 0 ? 50 : 0);
                    const scoreB = (b.intentScore || 0) + (b.unreadCount > 0 ? 50 : 0);

                    // If sufficient difference in 'Value/Urgency', sort by Score
                    if (Math.abs(scoreA - scoreB) > 20) {
                        return scoreB - scoreA;
                    }

                    // Otherwise sort by recency as standard
                    const dateA = new Date(a.lastMessageAt).getTime();
                    const dateB = new Date(b.lastMessageAt).getTime();
                    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                });

                setConversations(sorted);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            setError('Error de conexión');
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
        if (!searchQuery.trim()) return;
        if (searchQuery.length < 2) {
            alert(t('chat.sidebar.search_error_short', { defaultValue: 'Por favor escribe al menos 2 caracteres' }));
            return;
        }

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
            alert(t('common.error'));
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
                alert(`✅ ${t('chat.sidebar.group_created_success', { defaultValue: `Grupo "${name}" creado exitosamente` })}`);
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
                alert(t('chat.sidebar.delete_success'));
            } else {
                alert(t('common.error'));
            }
        } catch (error) {
            console.error('Error deleting conversations:', error);
            alert(t('common.error'));
        }
    };

    const handleBatchUpdate = async (updates: { isPinned?: boolean, isFavorite?: boolean }) => {
        try {
            await Promise.all(selectedChats.map(id =>
                fetch(`/api/conversations/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                })
            ));
            setSelectedChats([]);
            setIsSelectionMode(false);
            loadConversations();
        } catch (error) {
            console.error('Error updating conversations:', error);
            alert(t('common.error'));
        }
    };

    const handleBatchCreateGroup = () => {
        const userIds = conversations
            .filter(c => selectedChats.includes(c.id) && c.type === 'USER_USER' && c.otherUser)
            .map(c => c.otherUser!.id);

        if (userIds.length === 0) {
            alert(t('chat.sidebar.select_individual_chats_error', { defaultValue: 'Selecciona chats individuales para crear un grupo' }));
            return;
        }

        setInitialGroupMembers(userIds);
        setShowNewGroup(true);
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

    const filteredConversations = conversations.filter(conv => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const name = conv.type === 'GROUP' ? conv.name : conv.otherUser?.name;
        const phone = conv.otherUser?.phone;
        return (name?.toLowerCase() || "").includes(term) || (phone?.toLowerCase() || "").includes(term);
    });

    return (
        <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="rounded-full p-2 hover:bg-gray-200 text-gray-600"
                        title={t('common.back')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowProfileEdit(true)}
                        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors"
                        title={t('chat.sidebar.my_profile')}
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
                    {/* Redundant Globe button removed as main scanner now handles global search */}
                    <button
                        onClick={() => setShowNewChat(!showNewChat)}
                        className="rounded-full p-2 hover:bg-gray-200 text-blue-600"
                        aria-label={t('chat.sidebar.new_chat')}
                        title={t('chat.sidebar.new_chat')}
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="rounded-full p-2 hover:bg-gray-200 text-gray-600"
                            aria-label={t('chat.window.options.more')}
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showOptionsMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-xl border border-gray-200 z-[9999]">
                                <div className="py-1">
                                    {/* Group Chat Disabled for Enterprise Focus */}
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                        onClick={() => {
                                            setShowProfileEdit(true);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        {t('chat.sidebar.my_profile')}
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                        onClick={() => {
                                            setShowStarredMessages(true);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        <Star className="h-4 w-4 text-gray-400" />
                                        {t('chat.sidebar.starred_messages_title')}
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setIsSelectionMode(!isSelectionMode);
                                            setSelectedChats([]);
                                            setShowOptionsMenu(false);
                                        }}
                                    >
                                        {isSelectionMode ? t('chat.sidebar.cancel_selection') : t('chat.sidebar.select_chats')}
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setShowOptionsMenu(false);
                                            window.location.href = '/dashboard/profile';
                                        }}
                                    >
                                        {t('chat.sidebar.settings')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowOptionsMenu(false);
                                            window.location.href = '/api/auth/signout';
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        {t('chat.sidebar.sign_out')}
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
                                <h3 className="text-xl font-bold text-gray-900">{t('chat.modals.profile.title')}</h3>
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
                                    <label htmlFor="edit-name" className="block text-sm font-bold text-gray-700 mb-1.5">{t('chat.modals.profile.name_label')}</label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder={t('chat.modals.profile.name_label')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('chat.modals.profile.phone_label')}</label>
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
                                    {t('common.cancel')}
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
                                                alert(t('chat.modals.profile.success'));
                                                setShowProfileEdit(false);
                                                window.location.reload();
                                            }
                                        } catch (error) {
                                            alert(t('common.error'));
                                        } finally {
                                            setSavingProfile(false);
                                        }
                                    }}
                                    disabled={savingProfile}
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    {savingProfile ? t('common.loading') : t('common.save')}
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
                                    <h3 className="text-xl font-bold text-gray-900">{t('chat.sidebar.starred_messages_title')}</h3>
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
                                        <p className="text-lg font-semibold text-gray-400">{t('chat.sidebar.no_starred_messages', { defaultValue: 'No hay mensajes destacados' })}</p>
                                        <p className="text-xs mt-2 px-10">
                                            {t('chat.sidebar.starred_hint', { defaultValue: 'Tus mensajes importantes aparecerán aquí para que puedas encontrarlos fácilmente.' })}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {starredMessagesList.map((msg) => (
                                            <div key={msg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-200 transition-colors">
                                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>{t('chat.sidebar.chat_with', { defaultValue: 'Chat con' })} {msg.otherUserName}</span>
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
                        onClose={() => {
                            setShowNewGroup(false);
                            setInitialGroupMembers([]);
                        }}
                        onCreateGroup={handleCreateGroup}
                        initialSelectedIds={initialGroupMembers}
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
                                {selectedChats.length === 1 ? t('chat.selection_count_single', { defaultValue: 'Conversación seleccionada' }) : t('chat.sidebar.selection_count', { count: selectedChats.length })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedChats.length > 0 && (
                                <>
                                    <button
                                        onClick={() => handleBatchUpdate({ isPinned: true })}
                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 border border-blue-400"
                                    >
                                        {t('chat.actions.pin')}
                                    </button>
                                    <button
                                        onClick={() => handleBatchUpdate({ isFavorite: true })}
                                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 border border-yellow-400"
                                    >
                                        <Star className="h-4 w-4" />
                                        {t('chat.actions.favorite')}
                                    </button>
                                    <button
                                        onClick={handleBatchCreateGroup}
                                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 border border-indigo-400"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('chat.sidebar.new_group')}
                                    </button>
                                    <button
                                        onClick={handleDeleteConversations}
                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 border border-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {t('chat.actions.delete')}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedChats([]);
                                }}
                                className="text-sm font-bold hover:underline opacity-80"
                            >
                                {t('common.cancel')}
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
                        placeholder={t('chat.sidebar.search_placeholder')}
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
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('common.loading')}</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <X className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-bold text-red-900 mb-1">No se pudieron cargar los chats</p>
                        <p className="text-xs text-red-500 mb-6">{error === 'No autenticado' ? 'Tu sesión ha expirado.' : 'Hubo un error al conectar con el servidor.'}</p>
                        <button
                            onClick={() => loadConversations()}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <>
                        {/* New Chat Area (Inline when searching and no local results found) */}
                        {showNewChat && (
                            <div className="mb-6 rounded-3xl bg-blue-50/50 p-4 border-2 border-dashed border-blue-200 animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('chat.sidebar.new_chat')}</h3>
                                    <button onClick={() => setShowNewChat(false)} className="text-blue-400 hover:text-blue-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                                        <input
                                            type="text"
                                            placeholder={t('chat.sidebar.search_placeholder')}
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
                                        {t('chat.sidebar.global_network')}
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
                                                    <p className="text-[10px] text-blue-500 font-bold uppercase truncate">{user.company?.name || t('chat.sidebar.independent_user')}</p>
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

                        <div className="mt-2">
                            {searchTerm === "" && !showNewChat && (
                                <h4 className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('chat.sidebar.recent_chats')}</h4>
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
                                            <div className="flex-1 min-w-0 relative">
                                                <div className="flex items-center justify-between gap-2 mb-1 pr-6">
                                                    <h3 className={`font-black tracking-tight truncate ${selectedId === conv.id ? 'text-white' : 'text-gray-900 text-lg'}`}>
                                                        {conv.type === "GROUP" ? conv.name : (conv.otherUser?.name || t('chat.sidebar.no_name', { defaultValue: 'Sin nombre' }))}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {conv.isPinned && <span title={t('chat.actions.pin')} className={`${selectedId === conv.id ? 'text-white' : 'text-blue-500'}`}><Plus className="h-3 w-3 rotate-45" /></span>}
                                                        {conv.isFavorite && <Star className={`h-3 w-3 fill-yellow-400 text-yellow-500 shadow-sm`} />}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm truncate font-bold leading-tight opacity-80 ${selectedId === conv.id ? 'text-blue-50' : 'text-gray-500'}`}>
                                                        {conv.type === "GROUP" && !conv.lastMessage ? `${t('chat.window.member')} • ${conv.memberCount} ${t('chat.sidebar.group_suffix')}` : (conv.lastMessage || t('chat.sidebar.empty_hint'))}
                                                    </p>
                                                    <div className="flex flex-col items-end gap-1 min-w-[30px]">
                                                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
                                                                {conv.unreadCount}
                                                            </span>
                                                        )}

                                                        <div className="flex flex-col items-end gap-0.5 mt-1">
                                                            {(conv.intentScore && conv.intentScore > 50) && (
                                                                <span title="Hot Lead">
                                                                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500 animate-bounce-slow" />
                                                                </span>
                                                            )}
                                                            {(conv.estimatedValue) && (
                                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded-sm border border-emerald-100 whitespace-nowrap">
                                                                    ${conv.estimatedValue.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Context Menu Trigger */}
                                                <div className="absolute top-0 right-0 -mt-1 -mr-2">
                                                    <div className="relative group/menu">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            className={`p-1 rounded-full hover:bg-black/10 transition-colors ${selectedId === conv.id ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 hidden group-hover/menu:block">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(t('chat.info_contact', { defaultValue: 'Info. del contacto' }));
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <User className="h-4 w-4" />
                                                                {t('chat.info_contact', { defaultValue: 'Info. del contacto' })}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(t('chat.mute_notifications', { defaultValue: 'Silenciar notificaciones' }));
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <VolumeX className="h-4 w-4" />
                                                                {t('chat.mute_notifications', { defaultValue: 'Silenciar notificaciones' })}
                                                            </button>
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(t('chat.delete_confirm', { defaultValue: '¿Eliminar chat?' }))) {
                                                                        await fetch('/api/conversations', {
                                                                            method: 'DELETE',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ conversationIds: [conv.id] })
                                                                        });
                                                                        loadConversations();
                                                                    }
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                {t('chat.actions.delete')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredConversations.length === 0 && searchTerm === "" && (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                            <MessageSquare className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">No tienes chats recientes</p>
                                        <p className="text-xs text-gray-500 mb-6">Explora el marketplace para conectar con empresas y agentes.</p>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                        >
                                            Explorar Marketplace
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Marketplace Results (External Search) */}
                        {searchTerm.length >= 2 && (
                            <div className="mt-8">
                                <h4 className="px-2 mb-4 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-blue-100"></div>
                                    {t('chat.sidebar.global_network')}
                                    <div className="h-1 flex-1 bg-blue-100"></div>
                                </h4>
                                {isSearchingGlobal ? (
                                    <div className="flex items-center justify-center py-10 gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        <span className="text-xs font-bold text-gray-400">{t('chat.sidebar.scanning')}</span>
                                    </div>
                                ) : globalResults.length === 0 ? (
                                    <div className="px-2 py-6 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-xs font-bold text-gray-400 italic">{t('chat.sidebar.no_global_results')}</p>
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
                                                        {user.companyName || t('chat.sidebar.independent_user')}
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

            {
                showInvitationModal && (
                    <InvitationModal
                        phone={invitedPhone}
                        onClose={() => setShowInvitationModal(false)}
                    />
                )
            }

            {
                showGlobalSearch && (
                    <GlobalCompanySearch
                        onClose={() => setShowGlobalSearch(false)}
                        onStartChat={handleStartChat}
                    />
                )
            }
        </div >
    );
}
