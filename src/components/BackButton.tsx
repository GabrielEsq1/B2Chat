"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    label?: string;
    fallbackUrl?: string; // Where to go if history is empty (optional)
}

export default function BackButton({ label = "Volver", fallbackUrl }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else if (fallbackUrl) {
            router.push(fallbackUrl);
        } else {
            router.push("/dashboard"); // Default safe fallback
        }
    };

    return (
        <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </button>
    );
}
