import Link from 'next/link';


export default function Hero() {
    return (
        <section className="bg-gray-50 py-16 px-4 md:px-8 lg:px-16">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                    Crea tu tienda online en minutos y vende directo por WhatsApp
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    La forma más rápida, sencilla y sin comisiones para que emprendedores, marcas y negocios vendan sus productos desde cualquier lugar.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                    <Link
                        href="/auth/register"
                        className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#22c55e]/90 transition-shadow shadow"
                    >
                        Crear mi tienda gratis
                    </Link>
                    <Link
                        href="/auth/login"
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-shadow"
                    >
                        Entrar
                    </Link>
                </div>
                <span className="inline-block bg-[#6366f1] text-white text-sm px-3 py-1 rounded-full">
                    Sin comisiones. 100% tuyo.
                </span>
                {/* Steps Card */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                        { title: 'Regístrate gratis', icon: '📝' },
                        { title: 'Sube tus productos', icon: '📦' },
                        { title: 'Comparte tu tienda y recibe pedidos por WhatsApp', icon: '📲' },
                    ].map((step, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
                        >
                            <div className="text-4xl mb-4 animate-bounce">{step.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
