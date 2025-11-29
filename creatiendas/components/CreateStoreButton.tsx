"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CreateStoreButtonProps {
    storeCount: number;
    userRole?: string;
    userPlan?: string;
    className?: string;
    text?: string;
}

export default function CreateStoreButton({ storeCount, userRole, userPlan, className, text = "Crear Tienda" }: CreateStoreButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    console.log('CreateStoreButton props:', { storeCount, userRole, userPlan });

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const isPro = userPlan === 'PRO';
        const isAdmin = userRole === 'ADMIN';
        const limit = isPro ? 5 : 1;

        // Allow if ADMIN, or if store count is below the limit
        if (isAdmin || storeCount < limit) {
            router.push('/builder');
        } else {
            // Otherwise show modal
            setIsModalOpen(true);
        }
    };

    const handleWhatsAppClick = () => {
        const message = "Hola, estoy interesado en crear más tiendas, necesito asesoría sobre los planes.";
        window.open(`https://wa.me/573026687991?text=${encodeURIComponent(message)}`, '_blank');
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={className || "inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"}
            >
                {text}
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Límite de Tiendas Alcanzado
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {userPlan === 'PRO'
                                    ? "Has alcanzado el límite de 5 tiendas de tu plan PRO. Para crear más tiendas, contáctanos para una solución personalizada."
                                    : "Tu plan actual permite crear solo 1 tienda gratuita. Para expandir tu negocio y crear más tiendas, necesitas activar un plan profesional."
                                }
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-lg shadow-green-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Hablar con un asesor
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
