import React from 'react';

export default function FinalCTA() {
    return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#22c55e] text-white text-center">
            <h3 className="text-3xl font-bold mb-4">¿Listo para empezar?</h3>
            <p className="mb-6 max-w-2xl mx-auto">
                Crea tu tienda hoy mismo y empieza a vender sin límites.
            </p>
            <a
                href="/auth/register"
                className="inline-block bg-white text-[#22c55e] font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-shadow"
            >
                Crear mi tienda ahora
            </a>
        </section>
    );
}
