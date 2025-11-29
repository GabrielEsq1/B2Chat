import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        console.log("🔌 Starting Socket.IO server...");
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("join_conversation", (conversationId: string) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
            });

            socket.on("leave_conversation", (conversationId: string) => {
                socket.leave(conversationId);
                console.log(`Socket ${socket.id} left conversation:${conversationId}`);
            });

            socket.on("typing", (data) => {
                socket.to(data.conversationId).emit("user_typing", data.userId);
            });

            socket.on("stop_typing", (data) => {
                socket.to(data.conversationId).emit("user_stop_typing", data.userId);
            });

            socket.on("send_message_client", (data) => {
                socket.to(data.conversationId).emit("new_message", data);
            });

            socket.on("mark_messages_read", (data) => {
                socket.to(data.conversationId).emit("messages_read", data);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
        console.log("✅ Socket.IO server started successfully");
    }

    // End the response without sending JSON - Socket.IO will handle the connection
    res.end();
};

export default ioHandler;
