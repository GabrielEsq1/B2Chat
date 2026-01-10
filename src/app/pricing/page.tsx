import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import PricingCard from '@/components/pricing/PricingCard';

const prisma = new PrismaClient();

async function getPlans() {
    const plans = await prisma.plan.findMany({
        orderBy: { priceMonthly: 'asc' }
    });
    return plans;
}

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    const plans = await getPlans();

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-blue-600 tracking-tighter">B2BChat</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900">Iniciar Sesión</Link>
                        <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Empezar Gratis</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
                        Precios simples, ROI infinito.
                    </h2>
                    <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                        No cobramos por leads. Cobramos por darte las herramientas para cerrarlos.
                        Elige el plan que se adapte a tu velocidad de ventas.
                    </p>
                </div>

                <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-8">
                    {plans.map((plan) => (
                        <PricingCard key={plan.id} plan={plan} />
                    ))}
                </div>

                <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                    <h3 className="text-lg font-bold text-gray-900">¿Necesitas más WhatsApp?</h3>
                    <p className="text-gray-500 mt-2">Puedes comprar paquetes de créditos adicionales (Add-ons) en cualquier momento, sin cambiar de plan.</p>
                    <div className="mt-4 flex justify-center gap-4">
                        <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">100 Convs: $15</span>
                        <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">500 Convs: $60</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
