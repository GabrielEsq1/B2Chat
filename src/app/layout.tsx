import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/AppNavbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
    title: "B2BChat",
    description: "Conexiones Empresariales",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">
                <Providers>
                    <AppNavbar />
                    <div className="pb-16 md:pb-0"> {/* Add padding for bottom nav */}
                        {children}
                    </div>
                    <MobileBottomNav />
                </Providers>
            </body>
        </html>
    );
}
