import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dg2suxdit',
    api_key: process.env.CLOUDINARY_API_KEY || '355811271115119',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'cx5-xSR98J2CtB4alwPFnwQlptg',
    secure: true,
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string || "general";

        if (!file) {
            return NextResponse.json(
                { error: "No se proporcionó ningún archivo" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
            "video/mp4", "video/webm",
            "audio/mpeg", "audio/wav", "audio/ogg",
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain"
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de archivo no permitido." },
                { status: 400 }
            );
        }

        // Validate file size (max 20MB for chat)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "El archivo es demasiado grande. Tamaño máximo: 20MB" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folder = type === "campaign" ? "b2bchat/campaigns" : "b2bchat/chat";

        // Upload to Cloudinary using a Promise wrapper
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: "auto", // Automatically detect image/video/raw
                    filename_override: file.name,
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            filename: uploadResult.original_filename,
            type: file.type,
            size: file.size,
            public_id: uploadResult.public_id
        });

    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json(
            { error: "Error al subir el archivo a la nube", details: error.message },
            { status: 500 }
        );
    }
}
