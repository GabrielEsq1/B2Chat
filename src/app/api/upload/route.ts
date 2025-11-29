import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

        // Determine folder based on type or request param
        const type = formData.get("type") as string || "general";
        const folder = type === "campaign" ? "campaigns" : "chat";

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const filename = `${session.user.id}_${timestamp}.${extension}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

        // Ensure directory exists (simple check, assuming public/uploads exists or using recursive mkdir if needed)
        // For now, we'll assume the structure exists or node's writeFile might fail if dir doesn't exist.
        // Better to use a helper to ensure dir, but for this environment we'll stick to the path.
        // We'll update the path to include the folder.
        const filepath = path.join(uploadDir, filename);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Save file
        await writeFile(filepath, buffer);

        // Return public URL
        // Return public URL
        const url = `/uploads/${folder}/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            type: file.type,
            size: file.size,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error al subir el archivo" },
            { status: 500 }
        );
    }
}
