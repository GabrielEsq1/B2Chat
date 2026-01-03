"use client";

import { X, Users, Plus, Check, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Contact {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
}

interface CreateGroupModalProps {
    onClose: () => void;
    onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
    initialSelectedIds?: string[];
}

export default function CreateGroupModal({ onClose, onCreateGroup, initialSelectedIds = [] }: CreateGroupModalProps) {
    const { t } = useLanguage();
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>(initialSelectedIds);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [globalResults, setGlobalResults] = useState<Contact[]>([]);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            const data = await res.json();
            if (data.contacts) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleContact = (contactId: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setGlobalResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.localResults) {
                setGlobalResults(data.localResults.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    phone: u.phone,
                    avatar: u.avatar || u.profilePicture
                })));
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedContacts.length === 0) {
            alert(t('chat.sidebar.select_individual_chats_error', { defaultValue: 'Por favor ingresa un nombre y selecciona al menos un contacto' }));
            return;
        }

        setCreating(true);
        try {
            await onCreateGroup(groupName, description, selectedContacts);
            onClose();
        } catch (error) {
            alert(t('common.error'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('chat.sidebar.new_group')}</h3>
                            <p className="text-sm text-gray-500">{t('chat.modals.group.description_label', { defaultValue: 'Crea un grupo para conectar con tu equipo' })}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={t('common.close', { defaultValue: 'Cerrar' })}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Group Info */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('chat.modals.group.name_label')} *
                            </label>
                            <input
                                id="group-name"
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                placeholder={t('chat.modals.group.name_label')}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('chat.modals.group.description_label')} ({t('common.optional', { defaultValue: 'opcional' })})
                            </label>
                            <textarea
                                id="group-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                                placeholder={t('chat.modals.group.description_label')}
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {/* Contact Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('chat.selection_count', { count: selectedContacts.length })} *
                            </label>
                        </div>

                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('chat.sidebar.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                {t('common.loading')}
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-64 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                                {(searchQuery.length >= 3 ? globalResults : contacts).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                                        <Users className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                                        <p className="text-sm font-bold text-gray-400">{t('chat.sidebar.no_global_results')}</p>
                                    </div>
                                ) : (
                                    (searchQuery.length >= 3 ? globalResults : contacts).map((contact) => (
                                        <button
                                            key={contact.id}
                                            onClick={() => toggleContact(contact.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedContacts.includes(contact.id)
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${selectedContacts.includes(contact.id) ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className={`font-bold text-sm truncate ${selectedContacts.includes(contact.id) ? 'text-white' : 'text-gray-900'}`}>{contact.name}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${selectedContacts.includes(contact.id) ? 'text-blue-100' : 'text-gray-400'}`}>{contact.phone}</p>
                                            </div>
                                            {selectedContacts.includes(contact.id) && (
                                                <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white stroke-[4]" />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !groupName.trim() || selectedContacts.length === 0}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creating ? (
                            <>{t('common.loading')}</>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                {t('chat.sidebar.new_group')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
