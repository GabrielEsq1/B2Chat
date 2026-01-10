"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Phone, Lock, ArrowRight, Mail, User, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const { status } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        if (searchParams?.get("registered") === "true") {
            setSuccess(t('auth.success.account_created'));
        }
    }, [searchParams, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                phone: formData.phone,
                password: formData.password,
                redirect: false,
            });

            if (res?.error) {
                setError(t('auth.errors.invalid_credentials'));
                setLoading(false);
            } else {
                setSuccess(t('auth.success.login_redirect'));
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 1000);
            }
        } catch (err) {
            setError(t('auth.errors.generic'));
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
                <div className="text-left mb-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        ← {t('auth.back_to_home')}
                    </Link>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login_title')}</h1>
                    <p className="text-gray-600">{t('auth.login_subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('auth.email_phone_label')}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder={t('auth.email_phone_placeholder')}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('auth.password_label')}
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {t('auth.forgot_password_link')}
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder={t('auth.password_placeholder')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {t('auth.login_btn')}
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 text-xs mb-4">{t('auth.no_account')} <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold">{t('auth.register_here')}</Link></p>
                    <Link href="/hub" className="inline-flex items-center gap-2 text-[10px] text-gray-400 hover:text-blue-600 font-medium transition-colors">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        {t('home.footer_mockup_seal_gnosis', { defaultValue: 'Parte de GNOSIS' })}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
                <LoginContent />
            </Suspense>
        </div>
    );
}
