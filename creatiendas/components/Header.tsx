import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Creatiendas</h1>
            <div className="space-x-4">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                    Entrar
                </Link>
                <Link
                    href="/auth/register"
                    className="bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#22c55e]/90 transition-shadow shadow"
                >
                    Crear mi tienda gratis
                </Link>
            </div>
        </header>
    );
}
