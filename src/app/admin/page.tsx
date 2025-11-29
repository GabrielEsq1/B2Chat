"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Store,
    TrendingUp,
    DollarSign,
    Eye,
    MessageSquare,
    Share2
} from "lucide-react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalStores: 0,
        totalProducts: 0,
        activeConversations: 0,
        socialConnections: 0,
        adConnections: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            // Check if user is SUPERADMIN
            if (session?.user?.role !== "SUPERADMIN") {
                router.push("/dashboard");
                return;
            }
            fetchAdminStats();
        }
    }, [status, session, router]);

    const fetchAdminStats = async () => {
        try {
            const response = await fetch("/api/admin/stats");
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    if (session?.user?.role !== "SUPERADMIN") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Center</h1>
                    <p className="mt-2 text-gray-600">
                        Panel de administración del ecosistema B2BChat
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <AdminStatCard
                        icon={Users}
                        label="Usuarios Totales"
                        value={stats.totalUsers}
                        color="bg-blue-500"
                    />
                    <AdminStatCard
                        icon={Building2}
                        label="Empresas"
                        value={stats.totalCompanies}
                        color="bg-purple-500"
                    />
                    <AdminStatCard
                        icon={Store}
                        label="Tiendas Públicas"
                        value={stats.totalStores}
                        color="bg-green-500"
                    />
                    <AdminStatCard
                        icon={TrendingUp}
                        label="Productos"
                        value={stats.totalProducts}
                        color="bg-orange-500"
                    />
                    <AdminStatCard
                        icon={MessageSquare}
                        label="Conversaciones Activas"
                        value={stats.activeConversations}
                        color="bg-pink-500"
                    />
                    <AdminStatCard
                        icon={Share2}
                        label="Conexiones Sociales"
                        value={stats.socialConnections}
                        color="bg-indigo-500"
                    />
                    <AdminStatCard
                        icon={Eye}
                        label="Cuentas Publicitarias"
                        value={stats.adConnections}
                        color="bg-red-500"
                    />
                    <AdminStatCard
                        icon={DollarSign}
                        label="Ingresos Totales"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        color="bg-emerald-500"
                    />
                </div>

                {/* Quick Links */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AdminLinkCard
                        title="Gestión de Usuarios"
                        description="Ver y administrar usuarios del sistema"
                        href="/admin/usuarios"
                        icon={Users}
                    />
                    <AdminLinkCard
                        title="Gestión de Empresas"
                        description="Administrar empresas registradas"
                        href="/admin/empresas"
                        icon={Building2}
                    />
                    <AdminLinkCard
                        title="Marketplace"
                        description="Moderar tiendas y productos"
                        href="/admin/marketplace"
                        icon={Store}
                    />
                    <AdminLinkCard
                        title="Campañas Internas"
                        description="Gestionar anuncios internos"
                        href="/admin/campanas-internas"
                        icon={TrendingUp}
                    />
                    <AdminLinkCard
                        title="Campañas Externas"
                        description="Ver campañas publicitarias"
                        href="/admin/campanas-externas"
                        icon={Eye}
                    />
                    <AdminLinkCard
                        title="Configuración"
                        description="Configuración global del sistema"
                        href="/admin/configuracion"
                        icon={DollarSign}
                    />
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <div className={`${color} flex h-12 w-12 items-center justify-center rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}

function AdminLinkCard({ title, description, href, icon: Icon }: any) {
    return (
        <a
            href={href}
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
            <Icon className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
        </a>
    );
}
