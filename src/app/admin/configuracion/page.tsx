"use client";

import { useState } from "react";
import { Save, Shield, Bell, Settings } from "lucide-react";

export default function AdminConfigPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: "B2BChat",
        supportEmail: "support@b2bchat.com",
        maintenanceMode: false,
        allowRegistration: true,
        maxUploadSize: 10,
        smtpHost: "smtp.example.com",
        smtpPort: 587,
    });

    const handleSave = async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        alert("Configuracion guardada exitosamente");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Configuracion del Sistema</h1>
                    <p className="mt-2 text-gray-600">Administra las configuraciones globales de la plataforma</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setActiveTab("general")} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                            <Settings className="h-4 w-4" />General
                        </button>
                        <button onClick={() => setActiveTab("security")} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "security" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                            <Shield className="h-4 w-4" />Seguridad
                        </button>
                        <button onClick={() => setActiveTab("notifications")} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "notifications" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                            <Bell className="h-4 w-4" />Notificaciones
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        {activeTab === "general" && (<div className="space-y-6"><div><label className="block text-sm font-medium text-gray-700">Nombre del Sitio</label><input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700">Email de Soporte</label><input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>)}
                        {activeTab === "security" && (<div className="space-y-6"><div className="flex items-center justify-between py-4"><div><h3 className="text-sm font-medium text-gray-900">Permitir Registro de Usuarios</h3><p className="text-sm text-gray-500">Habilitar o deshabilitar nuevos registros</p></div></div><div><label className="block text-sm font-medium text-gray-700">Tamano Maximo de Subida (MB)</label><input type="number" value={settings.maxUploadSize} onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>)}
                        {activeTab === "notifications" && (<div className="space-y-6"><div><label className="block text-sm font-medium text-gray-700">Host SMTP</label><input type="text" value={settings.smtpHost} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700">Puerto SMTP</label><input type="number" value={settings.smtpPort} onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div></div>)}
                        <div className="pt-6 border-t border-gray-200 flex justify-end">
                            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <Save className="h-4 w-4" />{loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}