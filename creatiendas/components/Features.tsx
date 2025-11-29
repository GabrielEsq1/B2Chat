import React from 'react';

export default function Features() {
    const features = [
        'Catálogo profesional',
        'Carrito conectado a WhatsApp',
        'Botón directo para pedidos',
        'Diseño moderno',
        'Personalización visual',
        'Dominio o enlace personalizable',
        'Inventario',
        'Estadísticas',
    ];

    return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl font-semibold text-center text-gray-800 mb-10">
                    Características
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-gray-700">
                            <svg
                                className="w-5 h-5 text-[#22c55e] flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feat}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
