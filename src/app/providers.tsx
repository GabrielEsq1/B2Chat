"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { LanguageProvider } from "@/context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
            <LanguageProvider>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}
