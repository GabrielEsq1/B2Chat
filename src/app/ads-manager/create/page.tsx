"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Play, Image as ImageIcon, Check, DollarSign, Users, Target } from "lucide-react";
import { WHATSAPP_CONFIG } from "@/config/whatsapp";
import { useLanguage } from "@/context/LanguageContext";

export default function CreateCampaignPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        objective: "SALES",
        industry: "",
        sector: "",
        roles: "",
        dailyBudget: 100000,
        totalBudget: 700000,
        creativeType: "IMAGE",
        creativeUrl: "",
        creativeText: "",
        // New fields for segmentation and ad details
        ageRange: "",
        gender: "",
        location: "",
        description: "",
        destinationUrl: "",
        paymentProofUrl: "",
        uploading: false,
    });

    // Calculate duration automatically
    const durationDays = Math.ceil(formData.totalBudget / formData.dailyBudget);

    // Validation for each step
    const validateStep = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1: // Detalles
                if (!formData.name.trim()) {
                    alert('❌ Por favor ingresa el nombre de la campaña');
                    return false;
                }
                if (!formData.objective) {
                    alert('❌ Por favor selecciona un objetivo');
                    return false;
                }
                return true;

            case 2: // Segmentación
                if (!formData.industry) {
                    alert('❌ Por favor selecciona una industria');
                    return false;
                }
                if (!formData.sector) {
                    alert('❌ Por favor selecciona un sector');
                    return false;
                }
                if (!formData.roles.trim()) {
                    alert('❌ Por favor ingresa al menos un cargo');
                    return false;
                }
                if (!formData.ageRange) {
                    alert('❌ Por favor selecciona un rango de edad');
                    return false;
                }
                if (!formData.gender) {
                    alert('❌ Por favor selecciona un género');
                    return false;
                }
                if (!formData.location.trim()) {
                    alert('❌ Por favor ingresa una ubicación');
                    return false;
                }
                return true;

            case 3: // Presupuesto
                if (formData.dailyBudget < 10000) {
                    alert('❌ El presupuesto diario mínimo es $10,000 COP');
                    return false;
                }
                if (formData.totalBudget < formData.dailyBudget) {
                    alert('❌ El presupuesto total debe ser mayor al presupuesto diario');
                    return false;
                }
                return true;

            case 4: // Creativo
                if (!formData.creativeUrl.trim()) {
                    alert('❌ Por favor sube una imagen o video');
                    return false;
                }
                if (!formData.creativeText.trim()) {
                    alert('❌ Por favor ingresa el texto del anuncio');
                    return false;
                }
                if (!formData.description.trim()) {
                    alert('❌ Por favor ingresa una descripción');
                    return false;
                }
                if (!formData.destinationUrl.trim()) {
                    alert('❌ Por favor ingresa la URL de destino');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = () => setStep(step - 1);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic Client-side Validation
        const isVideo = file.type.startsWith('video/');
        const maxSize = 20 * 1024 * 1024; // 20MB

        if (file.size > maxSize) {
            alert('❌ El archivo es demasiado grande. Máximo 20MB.');
            return;
        }

        setFormData({ ...formData, uploading: true });
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            // Explicitly set type based on file type
            uploadData.append('type', isVideo ? 'video' : 'image');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });
            const data = await response.json();
            if (data.success) {
                setFormData({ ...formData, creativeUrl: data.url, uploading: false });
            } else {
                console.error("Upload error details:", data);
                alert(`Error al subir archivo: ${data.details || data.error || 'Desconocido'}`);
                setFormData({ ...formData, uploading: false });
            }
        } catch (error) {
            console.error("Upload exception:", error);
            alert('Error de conexión al subir el archivo');
            setFormData({ ...formData, uploading: false });
        }
    };

    const handleCreateCampaign = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    objective: formData.objective,
                    industry: formData.industry,
                    sector: formData.sector,
                    targetRoles: formData.roles.split(',').map(r => r.trim()).filter(Boolean),
                    dailyBudget: formData.dailyBudget,
                    totalBudget: formData.totalBudget,
                    creativeType: formData.creativeType,
                    creativeUrl: formData.creativeUrl,
                    creativeText: formData.creativeText,
                    description: formData.description,
                    destinationUrl: formData.destinationUrl,
                    ageRange: formData.ageRange,
                    gender: formData.gender,
                    location: formData.location,
                    paymentProofUrl: formData.paymentProofUrl,
                    status: formData.paymentProofUrl ? 'PENDING_VERIFICATION' : 'PENDING_PAYMENT',
                }),
            });
            const data = await response.json();
            if (data.success && data.campaign) {
                // Generate campaign review URL for admin
                const appUrl = process.env.NEXT_PUBLIC_B2BCHAT_AUTH_APP_BASEURL_PROD || 'https://creatiendasgit1.vercel.app';
                const reviewUrl = `${appUrl}/admin/campaigns/review/${data.campaign.id}`;

                // Prepare WhatsApp message with campaign details
                const whatsappMessage = `🎯 *NUEVA CAMPAÑA - PENDIENTE DE APROBACIÓN*%0A%0A` +
                    `📋 *ID Campaña:* ${data.campaign.id.slice(-8)}%0A` +
                    `📝 *Nombre:* ${formData.name}%0A` +
                    `🎯 *Objetivo:* ${formData.objective}%0A` +
                    `🏢 *Segmentación:* ${formData.industry} - ${formData.sector}%0A` +
                    `💰 *Presupuesto Total:* $${formData.totalBudget.toLocaleString('es-CO')} COP%0A` +
                    `📅 *Duración:* ${durationDays} días%0A` +
                    `💵 *Presupuesto Diario:* $${formData.dailyBudget.toLocaleString('es-CO')} COP%0A%0A` +
                    `👤 *Segmentación Avanzada:*%0A` +
                    `- Edad: ${formData.ageRange}%0A` +
                    `- Género: ${formData.gender}%0A` +
                    `- Ubicación: ${formData.location}%0A` +
                    `- Cargos: ${formData.roles}%0A%0A` +
                    `📄 *Descripción:*%0A${formData.description.substring(0, 100)}...%0A%0A` +
                    `🔗 *Revisar Campaña Completa:*%0A${reviewUrl}%0A%0A` +
                    `⚠️ *Estado:* PENDIENTE DE PAGO%0A%0A` +
                    `📲 Por favor, envía el link de pago de Nequi al cliente.`;

                // Redirect to WhatsApp (configured in src/config/whatsapp.ts)
                const whatsappNumber = WHATSAPP_CONFIG.phoneNumber;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

                // Open WhatsApp in new tab
                window.open(whatsappUrl, '_blank');

                // Redirect to ads manager after a short delay
                setTimeout(() => {
                    router.push('/ads-manager');
                }, 1000);
            } else {
                alert(data.error || 'Error al crear la campaña');
            }
        } catch (error) {
            alert('Error al crear la campaña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="mx-auto max-w-5xl px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Crear Nueva Campaña</h1>
                    </div>
                    {/* Progress Steps */}
                    <div className="mt-6 flex items-center justify-between px-10">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                            <div key={s} className="flex flex-col items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                                >
                                    {s}
                                </div>
                                <span className="mt-2 text-xs text-gray-500">
                                    {s === 1 && t('ads.wizard.steps.details')}
                                    {s === 2 && t('ads.wizard.steps.segmentation')}
                                    {s === 3 && t('ads.wizard.steps.budget')}
                                    {s === 4 && t('ads.wizard.steps.creative')}
                                    {s === 5 && t('ads.wizard.steps.review')}
                                    {s === 6 && t('ads.wizard.steps.payment')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl px-4">
                {/* Step 1: Details */}
                {step === 1 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Detalles de la Campaña</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Campaña</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Ej: Promoción Verano 2025"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Objetivo</label>
                                <div className="mt-2 grid grid-cols-3 gap-4">
                                    {[{ id: "TRAFFIC", label: "Tráfico", icon: Target }, { id: "SALES", label: "Ventas", icon: DollarSign }, { id: "AWARENESS", label: "Reconocimiento", icon: Users }].map((obj) => (
                                        <button
                                            key={obj.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, objective: obj.id })}
                                            className={`flex flex-col items-center justify-center rounded-lg border p-4 text-center hover:bg-gray-50 ${formData.objective === obj.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                                        >
                                            <obj.icon className="mb-2 h-6 w-6" />
                                            <span className="text-sm font-medium">{obj.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Segmentation */}
                {step === 2 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Segmentación B2B</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Industria</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar Industria</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufactura">Manufactura</option>
                                    <option value="Servicios">Servicios</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sector</label>
                                <select
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.sector}
                                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar Sector</option>
                                    <option value="B2B">B2B</option>
                                    <option value="B2C">B2C</option>
                                    <option value="SaaS">SaaS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargos (Roles)</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Ej: CEO, Gerente de Compras, Director TI"
                                    value={formData.roles}
                                    onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Separa los cargos con comas</p>
                            </div>
                            {/* New segmentation fields */}
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rango de Edad</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.ageRange}
                                        onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Rango</option>
                                        <option value="18-25">18-25</option>
                                        <option value="26-35">26-35</option>
                                        <option value="36-45">36-45</option>
                                        <option value="46+">46+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Género</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Género</option>
                                        <option value="ALL">Todos</option>
                                        <option value="MALE">Masculino</option>
                                        <option value="FEMALE">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Ej: Bogotá, Medellín"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Budget */}
                {step === 3 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Presupuesto</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Presupuesto Diario (COP)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="100000"
                                        value={formData.dailyBudget}
                                        onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
                                        min={10000}
                                        step={10000}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-gray-500 sm:text-sm">COP</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Presupuesto Total (COP)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="block w-full rounded-md border border-gray-300 pl-7 pr-12 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="700000"
                                        value={formData.totalBudget}
                                        onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                                        min={formData.dailyBudget}
                                        step={50000}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-gray-500 sm:text-sm">COP</span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Mínimo: {formData.dailyBudget.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-4">
                                <div className="flex justify-between text-sm font-medium text-blue-900">
                                    <span>Duración Calculada:</span>
                                    <span className="text-lg">{durationDays} días</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">Presupuesto Total: {formData.totalBudget.toLocaleString('es-CO')} COP</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Creative */}
                {step === 4 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Creativo del Anuncio</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, creativeType: "IMAGE" })}
                                    className={`flex-1 rounded-lg border p-3 text-center ${formData.creativeType === "IMAGE" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}
                                >
                                    <ImageIcon className="mx-auto mb-1 h-5 w-5" />
                                    Imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, creativeType: "VIDEO" })}
                                    className={`flex-1 rounded-lg border p-3 text-center ${formData.creativeType === "VIDEO" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}
                                >
                                    <Play className="mx-auto mb-1 h-5 w-5" />
                                    Video (Max 20s)
                                </button>
                            </div>
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:bg-gray-50">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept={formData.creativeType === "IMAGE" ? "image/*" : "video/mp4"}
                                    onChange={handleFileUpload}
                                    disabled={formData.uploading}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {formData.uploading ? (
                                        <div>
                                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                                            <p className="mt-2 text-sm text-gray-600">Subiendo...</p>
                                        </div>
                                    ) : formData.creativeUrl ? (
                                        <div>
                                            <Check className="mx-auto h-12 w-12 text-green-500" />
                                            <p className="mt-2 text-sm text-green-600">Archivo subido exitosamente</p>
                                            <img src={formData.creativeUrl} alt="Preview" className="mx-auto mt-4 max-h-40 rounded" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFormData({ ...formData, creativeUrl: "" }); }}
                                                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Cambiar archivo
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">
                                                Arrastra tu {formData.creativeType === "IMAGE" ? "imagen" : "video"} aquí o haz clic para subir
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                {formData.creativeType === "IMAGE" ? "JPG, PNG hasta 10MB" : "MP4 hasta 20s"}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Texto del Anuncio</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="Escribe un texto para tu anuncio..."
                                    value={formData.creativeText}
                                    onChange={(e) => setFormData({ ...formData, creativeText: e.target.value })}
                                    required
                                />
                            </div>
                            {/* New fields for ad description and destination URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción del Anuncio</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="Descripción breve..."
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL de Destino</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    placeholder="https://example.com"
                                    value={formData.destinationUrl}
                                    onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">{t('ads.wizard.steps.review')}</h2>
                        <div className="space-y-4 rounded-lg bg-gray-50 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Campaña:</span>
                                <span className="font-medium text-gray-900">{formData.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Objetivo:</span>
                                <span className="font-medium text-gray-900">{formData.objective}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Segmentación:</span>
                                <span className="font-medium text-gray-900">{formData.industry} - {formData.sector}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Presupuesto Diario:</span>
                                <span className="font-medium text-gray-900">{formData.dailyBudget.toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Duración:</span>
                                <span className="font-medium text-gray-900">{durationDays} días</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="font-bold text-gray-900">Total:</span>
                                <span className="font-bold text-blue-600">{formData.totalBudget.toLocaleString('es-CO')} COP</span>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                                <Check className="h-5 w-5" />
                                <span>¡Información Verificada Correctamente!</span>
                            </h3>
                            <div className="text-sm text-green-800 space-y-2">
                                <p>
                                    Tu campaña tiene toda la información necesaria. Solo falta un paso para activarla.
                                </p>
                                <p>
                                    Haz clic en <strong>Siguiente</strong> para coordinar el pago.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Payment */}
                {step === 6 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-medium text-gray-900">Finalizar y Pagar</h2>

                        <div className="mb-8 text-center bg-gray-50 rounded-xl p-8 border border-gray-100">
                            <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Campaña casi lista!</h3>
                            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                Para activar tu campaña, coordinamos el pago de forma segura a través de WhatsApp. Un asesor te enviará los datos de Nequi/Bancolombia.
                            </p>

                            <a
                                href={`https://wa.me/573026687991?text=${encodeURIComponent(`Hola, acabo de crear la campaña "${formData.name}" por valor de $${formData.totalBudget.toLocaleString('es-CO')} y quiero realizar el pago.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#128C7E] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4"
                            >
                                <Users className="h-6 w-6" />
                                Pagar con Asesor (WhatsApp)
                            </a>

                            <p className="text-xs text-gray-400 mt-4">
                                Horario de atención: 24/7
                            </p>
                        </div>

                        <div className="mt-6 border-t pt-6 bg-blue-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">¿Ya contactaste al asesor?</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Si ya iniciaste el chat o realizaste el pago, haz clic en finalizar para guardar tu campaña. El administrador la aprobará en breve.
                            </p>
                            <button
                                onClick={handleCreateCampaign}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Procesando...' : 'Finalizar y Enviar a Revisión'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 flex justify-between">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Atrás
                        </button>
                    )}
                    {step < 5 && (
                        <button
                            onClick={handleNext}
                            className="ml-auto rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Siguiente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
