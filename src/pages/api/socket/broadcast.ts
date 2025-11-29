import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { channel, event, data } = req.body;

    if (!channel || !event || !data) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const io = (res.socket as any).server.io;

        if (!io) {
            console.error("Socket.io not initialized");
            return res.status(500).json({ error: "Socket.io not initialized" });
        }

        io.to(channel).emit(event, data);
        console.log(`📡 Broadcasted event '${event}' to channel '${channel}'`);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Broadcast error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
