"use client";

import { useState, useRef } from "react";
import { AlertCircle, LayoutDashboard, Target, Users, DollarSign, Save } from "lucide-react";
import { AdPreviewCard } from "./AdPreviewCard";
import { AdCreativeUpload } from "./AdCreativeUpload";

interface CampaignFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        objective: "",
        industry: "",
        sector: "",
        dailyBudget: "",
        totalBudget: "",
        creativeType: "IMAGE" as "IMAGE" | "VIDEO",
        creativeUrl: "",
        videoUrl: "",
        videoDuration: 0,
        creativeText: "",
        description: "",
        ctaLabel: "Ver Más",
        destinationUrl: "",
        ageRange: "",
        gender: "ALL",
        location: "",
        mobileImageUrl: "",
    });

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mobileFile, setMobileFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string>("");
    const [mobilePreview, setMobilePreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [videoDuration, setVideoDuration] = useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors([]);
    };

    const handleFileSelect = (file: File) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            setErrors(["Por favor selecciona una imagen o video válido"]);
            return;
        }

        const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors([`El archivo es demasiado grande. Máximo ${isImage ? '5MB' : '50MB'}`]);
            return;
        }

        setMediaFile(file);
        setFormData(prev => ({
            ...prev,
            creativeType: isImage ? "IMAGE" : "VIDEO"
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        if (isVideo) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = Math.floor(video.duration);
                setVideoDuration(duration);
                if (duration > 20) {
                    setErrors([`El video dura ${duration}s. Máximo 20s.`]);
                } else {
                    setFormData(prev => ({ ...prev, videoDuration: duration }));
                }
            };
            video.src = URL.createObjectURL(file);
        }
    };

    const handleMobileFileSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrors(["Para móvil solo se permiten imágenes"]);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(["Imagen móvil demasiado grande (Máx 5MB)"]);
            return;
        }
        setMobileFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setMobilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", file.type.startsWith("image/") ? "image" : "video");

            const res = await fetch("/api/campaigns/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al subir archivo");
            return data.url;
        } catch (error: any) {
            setErrors([error.message]);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: string[] = [];
        if (!formData.name.trim()) newErrors.push("Nombre de campaña es obligatorio");
        if (!formData.description.trim()) newErrors.push("Descripción es obligatoria");
        if (!formData.objective) newErrors.push("Objetivo es obligatorio");
        if (!formData.dailyBudget || parseFloat(formData.dailyBudget) <= 0) newErrors.push("Presupuesto diario inválido");
        if (!mediaFile && !formData.creativeUrl && !formData.videoUrl) newErrors.push("Debe subir imagen o video");
        if (formData.creativeType === "VIDEO" && videoDuration > 20) newErrors.push("Video excede 20s");

        setErrors(newErrors);
        if (newErrors.length > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            let mediaUrl = formData.creativeUrl || formData.videoUrl;
            if (mediaFile) {
                const uploaded = await uploadFile(mediaFile);
                if (!uploaded) {
                    setSubmitting(false);
                    return;
                }
                mediaUrl = uploaded;
            }

            let mobileUrl = formData.mobileImageUrl;
            if (mobileFile) {
                const uploaded = await uploadFile(mobileFile);
                if (!uploaded) {
                    setSubmitting(false);
                    return;
                }
                mobileUrl = uploaded;
            }

            const campaignData = {
                ...formData,
                [formData.creativeType === "IMAGE" ? "creativeUrl" : "videoUrl"]: mediaUrl as string,
                mobileImageUrl: mobileUrl as string,
                videoDuration: formData.creativeType === "VIDEO" ? videoDuration : undefined,
            };

            const res = await fetch("/api/campaigns/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campaignData),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrors([data.error || "Error al crear campaña"]);
                return;
            }

            alert("✅ Campaña creada exitosamente");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setErrors([error.message]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
            <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 py-6">
                {/* Left Column: Form */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Nueva Campaña</h2>
                                <p className="text-sm text-gray-500">Configura los detalles de tu anuncio</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <ul className="text-sm text-red-700 list-disc list-inside">
                                        {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Section 1: Basic Info */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Información Básica
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Ej: Promo Verano"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Objetivo <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="objective"
                                            value={formData.objective}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="TRAFFIC">Tráfico</option>
                                            <option value="SALES">Ventas</option>
                                            <option value="AWARENESS">Reconocimiento</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción del Anuncio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Texto que aparecerá en el anuncio..."
                                    />
                                </div>
                            </section>

                            <div className="border-t border-gray-100" />

                            {/* Section 2: Creative */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Creatividad
                                </h3>
                                <div className="space-y-6">
                                    <AdCreativeUpload
                                        label="Imagen/Video Principal *"
                                        mediaPreview={mediaPreview}
                                        creativeType={formData.creativeType}
                                        onFileSelect={handleFileSelect}
                                        onClear={() => {
                                            setMediaFile(null);
                                            setMediaPreview("");
                                            setVideoDuration(0);
                                        }}
                                        videoDuration={videoDuration}
                                    />
                                    <AdCreativeUpload
                                        label="Versión Móvil (Opcional)"
                                        mediaPreview={mobilePreview}
                                        creativeType="IMAGE"
                                        onFileSelect={handleMobileFileSelect}
                                        onClear={() => {
                                            setMobileFile(null);
                                            setMobilePreview("");
                                        }}
                                        accept="image/*"
                                        helperText="Formato vertical 9:16 para historias"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Botón (CTA)</label>
                                        <input
                                            name="ctaLabel"
                                            value={formData.ctaLabel}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Ver Más"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Destino</label>
                                        <input
                                            name="destinationUrl"
                                            value={formData.destinationUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="border-t border-gray-100" />

                            {/* Section 3: Targeting & Budget */}
                            <section className="space-y-4">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Segmentación
                                        </h3>
                                        <div className="space-y-3">
                                            <input
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Industria"
                                            />
                                            <input
                                                name="sector"
                                                value={formData.sector}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                placeholder="Sector"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> Presupuesto
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">
                                                    Diario (USD) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="dailyBudget"
                                                    value={formData.dailyBudget}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="1"
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Total (USD)</label>
                                                <input
                                                    type="number"
                                                    name="totalBudget"
                                                    value={formData.totalBudget}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Actions */}
                            <div className="pt-6 flex flex-col md:flex-row gap-3">
                                {onCancel && (
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="w-full md:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting || uploading}
                                    className="w-full md:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? "Creando..." : "Lanzar Campaña"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="w-full lg:w-80 xl:w-96 space-y-6">
                    <div className="sticky top-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Vista Previa en Vivo</h3>

                        <div className="space-y-6">
                            {/* Feed Preview */}
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Feed de Noticias</p>
                                <AdPreviewCard
                                    title={formData.name}
                                    description={formData.description}
                                    creativeUrl={mediaPreview}
                                    videoUrl={mediaPreview}
                                    creativeType={formData.creativeType}
                                    ctaLabel={formData.ctaLabel}
                                    destinationUrl={formData.destinationUrl}
                                    aspectRatio="square"
                                />
                            </div>

                            {/* Mobile/Story Preview */}
                            {mobilePreview && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-2">Historia / Móvil</p>
                                    <div className="scale-90 origin-top-left">
                                        <AdPreviewCard
                                            title={formData.name}
                                            description={formData.description}
                                            creativeUrl={mobilePreview}
                                            creativeType="IMAGE"
                                            ctaLabel={formData.ctaLabel}
                                            destinationUrl={formData.destinationUrl}
                                            aspectRatio="story"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
