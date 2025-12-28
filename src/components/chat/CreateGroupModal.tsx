"use client";

import { X, Users, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface Contact {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
}

interface CreateGroupModalProps {
    onClose: () => void;
    onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
}

export default function CreateGroupModal({ onClose, onCreateGroup }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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

    const handleCreate = async () => {
        if (!groupName.trim() || selectedContacts.length === 0) {
            alert('Por favor ingresa un nombre y selecciona al menos un contacto');
            return;
        }

        setCreating(true);
        try {
            await onCreateGroup(groupName, description, selectedContacts);
            onClose();
        } catch (error) {
            alert('Error al crear grupo');
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
                            <h3 className="text-xl font-bold text-gray-900">Nuevo Grupo</h3>
                            <p className="text-sm text-gray-500">Crea un grupo para conectar con tu equipo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Cerrar"
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
                                Nombre del Grupo *
                            </label>
                            <input
                                id="group-name"
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                placeholder="Ej: Equipo de Ventas"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="group-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="Describe el propósito del grupo..."
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {/* Contact Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Participantes * ({selectedContacts.length} seleccionados)
                            </label>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                Cargando contactos...
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No tienes contactos disponibles</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {contacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => toggleContact(contact.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedContacts.includes(contact.id)
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'bg-white border-2 border-transparent hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-600">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-gray-900">{contact.name}</p>
                                            <p className="text-sm text-gray-500">{contact.phone}</p>
                                        </div>
                                        {selectedContacts.includes(contact.id) && (
                                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
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
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !groupName.trim() || selectedContacts.length === 0}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creating ? (
                            <>Creando...</>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Crear Grupo
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
