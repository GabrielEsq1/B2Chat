import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

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
        const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
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

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const filename = `${session.user.id}_${timestamp}.${extension}`;

        // Determine upload directory
        const uploadDir = type === "image" ? "images" : "videos";
        const uploadPath = join(process.cwd(), "public", "uploads", "campaigns", uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(uploadPath, buffer);

        // Return public URL
        const publicUrl = `/uploads/campaigns/${uploadDir}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
            type,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error al subir archivo" },
            { status: 500 }
        );
    }
}
