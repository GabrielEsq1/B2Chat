import React from 'react';

export default function Benefits() {
    const items = [
        { title: 'Fácil y rápido', icon: '⚡', description: 'Crea y lanza tu tienda en minutos.' },
        { title: 'Todo por WhatsApp', icon: '📲', description: 'Gestiona pedidos directamente desde WhatsApp.' },
        { title: 'Personaliza tu marca', icon: '🎨', description: 'Colores, logo y dominio propio.' },
        { title: 'Sin comisiones', icon: '💰', description: 'Todo el ingreso es 100% tuyo.' },
        { title: 'Compatible con cualquier dispositivo', icon: '📱', description: 'Responsive y móvil‑first.' },
        { title: 'Administra tus productos fácilmente', icon: '🗂️', description: 'Panel simple para agregar y editar productos.' },
    ];

    return (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl font-semibold text-center text-gray-800 mb-10">
                    Beneficios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center text-center"
                        >
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h4 className="text-lg font-medium text-gray-800 mb-2">
                                {item.title}
                            </h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
