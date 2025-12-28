"use client";

import { X, Copy, Share2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface InvitationModalProps {
    phone: string;
    onClose: () => void;
}

export default function InvitationModal({ phone, onClose }: InvitationModalProps) {
    const [copied, setCopied] = useState(false);

    const inviteLink = `${process.env.NEXT_PUBLIC_B2BCHAT_APP_BASEURL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register?ref=${phone}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = encodeURIComponent(
            `🎉 ¡Únete a B2BChat!\n\n` +
            `Te invito a conectar en B2BChat, la plataforma de mensajería profesional para empresas B2B.\n\n` +
            `✨ Beneficios:\n` +
            `• Chat empresarial seguro\n` +
            `• Networking profesional\n` +
            `• Publicidad dirigida\n\n` +
            `🔗 Regístrate aquí: ${inviteLink}`
        );
        window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Share2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Invitar Contacto</h3>
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
                <div className="space-y-4">
                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <strong>{phone}</strong> no está registrado en B2BChat.
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                            ¡Invítalo a unirse y empieza a conectar! 🚀
                        </p>
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link de Invitación
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium bg-gray-50"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                title="Copiar link"
                            >
                                {copied ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    <Copy className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {copied && (
                            <p className="text-sm text-green-600 mt-2 animate-fadeIn">
                                ✓ Link copiado al portapapeles
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleShareWhatsApp}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            Enviar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
