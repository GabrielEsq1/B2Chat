"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [phone, setPhone] = useState("");

    const handleWhatsAppRedirect = (e: React.FormEvent) => {
        e.preventDefault();

        // El número de soporte definido
        const supportNumber = "3026687991"; // Número proporcionado por el usuario

        const message = t('auth.forgot_password.whatsapp_message', { phone });
        const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('auth.forgot_password.title')}</h1>
                    <p className="text-gray-600 mt-2">
                        {t('auth.forgot_password.description')}
                    </p>
                </div>

                <form onSubmit={handleWhatsAppRedirect} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('auth.forgot_password.phone_label')}
                        </label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="+57 300 123 4567"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!phone}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {t('auth.forgot_password.contact_support')}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        {t('auth.forgot_password.support_hint')}
                    </p>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                        {t('auth.forgot_password.back_to_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
