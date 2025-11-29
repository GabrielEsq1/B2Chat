import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Creatiendas - Constructor de Tienda WhatsApp",
    description: "Crea tu tienda online en minutos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
            </head>
            <body className={inter.className}>
                <Providers>
                    <Navbar />
                    {children}
                    <WhatsAppButton />
                </Providers>
            </body>
        </html>
    );
}
