import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CreateStoreButton from '@/components/CreateStoreButton';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return (
            <div className="text-center mt-20">
                <p>No tienes sesión. Redirigiendo a login...</p>
                <script dangerouslySetInnerHTML={{ __html: `setTimeout(()=>{window.location.href='/auth/login'},1500);` }} />
            </div>
        );
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true, stripeCustomer: true },
    });

    if (!user) {
        return (
            <div className="text-center mt-20">
                <p>Usuario no encontrado.</p>
            </div>
        );
    }

    const plan = user?.stripeCustomer ? 'Plan activo (consulta Stripe)' : 'Plan gratuito';

    return (
        <section className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-3xl font-bold mb-6">Panel de Creatiendas</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold">Datos de la cuenta</h2>
                <p><strong>Correo:</strong> {user?.email}</p>
                <p><strong>Nombre:</strong> {user?.name ?? 'No especificado'}</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold">Tus tiendas</h2>
                {user?.stores?.length ? (
                    <ul className="space-y-3 mt-4">
                        {user.stores.map((store) => (
                            <li key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div>
                                    <h3 className="font-medium text-lg">{store.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        https://creatiendasgit1.vercel.app/stores/{store.slug}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/builder?edit=${store.slug}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                                    >
                                        ✏️ Editar
                                    </Link>
                                    <Link
                                        href={`/stores/${store.slug}`}
                                        target="_blank"
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                                    >
                                        👁️ Ver
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tienes tiendas creadas.</p>
                )}
                <CreateStoreButton
                    storeCount={user.stores.length}
                    userRole={user.role}
                    userPlan={user.plan}
                    className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    text="Crear nueva tienda"
                />

                {user.role === 'ADMIN' && (
                    <Link
                        href="/admin/users"
                        className="inline-block mt-4 ml-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        ⚙️ Panel Admin
                    </Link>
                )}
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold">Plan de suscripción</h2>
                <p>{plan}</p>
                <div className="mt-4 flex flex-col gap-3">
                    <Link
                        href="/dashboard/billing"
                        className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center font-medium"
                    >
                        💳 Gestionar suscripción
                    </Link>
                    <Link
                        href="/dashboard/billing"
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center font-medium"
                    >
                        ⭐ Ver planes disponibles
                    </Link>
                </div>
            </section>
        </section>
    );
}
