"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
            aria-label="Switch Language"
        >
            <Globe className="h-4 w-4" />
            <span>{language === 'es' ? 'ES' : 'EN'}</span>
        </button>
    );
}
