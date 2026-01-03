"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation } from '@/i18n/types';
import { es } from '@/i18n/es';
import { en } from '@/i18n/en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es');

    useEffect(() => {
        // Load persisted language
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'es' || saved === 'en')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const getTranslation = (lang: Language): Translation => {
        return lang === 'en' ? en : es;
    };

    const t = (path: string, params?: Record<string, string | number>): string => {
        const keys = path.split('.');
        let current: any = getTranslation(language);

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }

        let translation = current as string;

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                translation = translation.replace(`{${key}}`, String(value));
            });
        }

        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
