import React from 'react';

export default function WhatIs() {
    return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card 1 */}
                <div className="bg-gray-50 rounded-xl shadow p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        ¿Qué es Creatiendas?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        Creatiendas permite crear una tienda online en minutos, sin
                        complicaciones y sin comisiones. Todo lo que necesitas para vender
                        tus productos directamente por WhatsApp.
                    </p>
                </div>
                {/* Card 2 */}
                <div className="bg-gray-50 rounded-xl shadow p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Personas ideales
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Emprendedores</li>
                        <li>Tiendas pequeñas</li>
                        <li>Marcas nuevas</li>
                        <li>Negocios locales</li>
                        <li>Dropshipping</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
