import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CreateStoreButton from '@/components/CreateStoreButton';

export default async function StoresPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true }
    });

    if (!user) {
        return <div>Usuario no encontrado</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Mis Tiendas</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gestiona tus tiendas creadas o crea una nueva.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <CreateStoreButton
                        storeCount={user.stores.length}
                        userRole={user.role}
                        userPlan={user.plan}
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Nombre
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            URL
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Estado
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {user.stores.map((store: { id: string; name: string; slug: string }) => (
                                        <tr key={store.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {store.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <Link href={`/stores/${store.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900">
                                                    /stores/{store.slug}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                    Activa
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/builder?edit=${store.slug}`}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1"
                                                    >
                                                        ✏️ Editar
                                                    </Link>
                                                    <Link
                                                        href={`/stores/${store.slug}`}
                                                        target="_blank"
                                                        className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-medium inline-flex items-center gap-1"
                                                    >
                                                        👁️ Ver
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {user.stores.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-500">
                                                No tienes tiendas aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
