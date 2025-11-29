import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface AdCreativeUploadProps {
    mediaPreview: string | null;
    creativeType: 'IMAGE' | 'VIDEO';
    onFileSelect: (file: File) => void;
    onClear: () => void;
    videoDuration?: number;
    error?: string;
    label?: string;
    accept?: string;
    maxSizeMB?: number;
    helperText?: string;
}

export function AdCreativeUpload({
    mediaPreview,
    creativeType,
    onFileSelect,
    onClear,
    videoDuration = 0,
    error,
    label = "Imagen o Video",
    accept = "image/*,video/*",
    maxSizeMB = 50,
    helperText = "Imágenes: JPG, PNG (máx 5MB) | Videos: MP4 (máx 50MB, 20 seg)"
}: AdCreativeUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </label>

            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${error ? 'border-red-300 bg-red-50' :
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {mediaPreview ? (
                    <div className="relative inline-block max-w-full">
                        {creativeType === 'IMAGE' ? (
                            <img
                                src={mediaPreview}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-lg shadow-sm"
                            />
                        ) : (
                            <div className="relative">
                                <video
                                    src={mediaPreview}
                                    controls
                                    className="max-h-64 mx-auto rounded-lg shadow-sm"
                                />
                                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <VideoIcon className="w-4 h-4" />
                                    <span>{videoDuration}s</span>
                                    {videoDuration > 20 && (
                                        <span className="text-red-600 font-medium text-xs bg-red-100 px-2 py-0.5 rounded-full">
                                            Excede 20s
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                onClear();
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute -top-2 -right-2 bg-white text-gray-500 p-1.5 rounded-full shadow-md hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="py-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            Sube tu archivo aquí
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            {helperText}
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            className="hidden"
                            id={`media-upload-${label.replace(/\s+/g, '-')}`}
                        />
                        <label
                            htmlFor={`media-upload-${label.replace(/\s+/g, '-')}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Seleccionar Archivo
                        </label>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600 inline-block" />
                    {error}
                </p>
            )}
        </div>
    );
}
