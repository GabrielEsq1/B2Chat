"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let socketInstance: Socket | null = null;
        let mounted = true;

        const initSocket = async () => {
            try {
                if (!mounted) return;

                // Use window.location.origin to connect to the same server
                const socketUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_B2BCHAT_APP_BASEURL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');

                socketInstance = new (ClientIO as any)(socketUrl, {
                    path: "/api/socket/io",
                    addTrailingSlash: false,
                    transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 3000,
                    timeout: 20000,
                    autoConnect: true,
                });

                if (!socketInstance) return;

                socketInstance.on("connect", () => {
                    if (mounted) {
                        setIsConnected(true);
                    }
                });

                socketInstance.on("disconnect", () => {
                    if (mounted) {
                        setIsConnected(false);
                    }
                });

                socketInstance.on("connect_error", () => {
                    // Silent error handling
                });

                if (mounted) {
                    setSocket(socketInstance);
                }

            } catch {
                // Silent error handling
            }
        };

        // Small delay before initializing to avoid race conditions
        const timer = setTimeout(() => {
            initSocket();
        }, 1000);

        return () => {
            mounted = false;
            clearTimeout(timer);
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
