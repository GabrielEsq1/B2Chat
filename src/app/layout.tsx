import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppNavbar from "@/components/AppNavbar";

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
                    {children}
                </Providers>
            </body>
        </html>
    );
}
