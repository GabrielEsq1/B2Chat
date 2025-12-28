import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.B2BCHAT_STRG_CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.B2BCHAT_STRG_CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.B2BCHAT_STRG_CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
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
        const type = formData.get("type") as string; // "image" or "video"

        if (!file) {
            return NextResponse.json(
                { error: "No se proporcionó archivo" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

        if (type === "image" && !allowedImageTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de imagen no válido. Use JPG, PNG, GIF o WebP" },
                { status: 400 }
            );
        }

        if (type === "video" && !allowedVideoTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de video no válido. Use MP4 o WebM" },
                { status: 400 }
            );
        }

        // Validate file size
        const maxImageSize = 5 * 1024 * 1024; // 5MB
        const maxVideoSize = 50 * 1024 * 1024; // 50MB

        if (type === "image" && file.size > maxImageSize) {
            return NextResponse.json(
                { error: "La imagen no debe superar 5MB" },
                { status: 400 }
            );
        }

        if (type === "video" && file.size > maxVideoSize) {
            return NextResponse.json(
                { error: "El video no debe superar 50MB" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "b2bchat/campaigns",
                    resource_type: type === "video" ? "video" : "image",
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
            type,
            public_id: uploadResult.public_id
        });

    } catch (error: any) {
        console.error("Cloudinary campaign upload error:", error);
        return NextResponse.json(
            { error: "Error al subir archivo a la nube", details: error.message },
            { status: 500 }
        );
    }
}
