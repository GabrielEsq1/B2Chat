import React from 'react';

export default function HowItWorks() {
  const steps = [
    { title: 'Regístrate gratis', description: 'Crea tu cuenta sin costo y empieza a construir tu tienda.', icon: '📝' },
    { title: 'Sube tus productos', description: 'Añade fotos, precios y descripciones fácilmente.', icon: '📦' },
    { title: 'Comparte tu tienda', description: 'Obtén un enlace o QR y recibe pedidos por WhatsApp.', icon: '📲' },
  ];

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
      <div className="max-w-5xl mx-auto text-center">
        <h3 className="text-3xl font-semibold text-gray-800 mb-10">Cómo funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">{step.title}</h4>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
