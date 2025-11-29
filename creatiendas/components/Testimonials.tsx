import React from 'react';

export default function Testimonials() {
    const testimonials = [
        {
            name: 'Andrea',
            quote: 'Creatiendas me permitió lanzar mi tienda en minutos y ya tengo pedidos todos los días. ¡Es increíble!'
        },
        {
            name: 'Jhon',
            quote: 'La integración con WhatsApp simplifica la comunicación con mis clientes. No hay comisiones y todo es mío.'
        }
    ];

    return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl font-semibold text-center text-gray-800 mb-10">
                    Testimonios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
                        >
                            <p className="text-gray-600 italic mb-4">"{t.quote}"</p>
                            <p className="text-gray-800 font-medium text-right">- {t.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
