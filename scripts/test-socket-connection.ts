import { io } from "socket.io-client";

async function testSocketConnection() {
    console.log('🚀 Testing Socket.IO Connection...\n');

    const socketUrl = 'http://localhost:3000';
    const socketPath = '/api/socket/io';

    console.log(`Connecting to ${socketUrl} (path: ${socketPath})...`);

    const socket = io(socketUrl, {
        path: socketPath,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 5000,
    });

    return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('❌ Connection timed out!');
            socket.disconnect();
            reject(new Error('Connection timed out'));
        }, 10000);

        socket.on("connect", () => {
            console.log(`✅ Connected successfully! Socket ID: ${socket.id}`);

            // Test joining a room
            const testRoom = "test-room-123";
            console.log(`Attempting to join room: ${testRoom}...`);
            socket.emit("join-conversation", testRoom);

            // Wait a bit to ensure it processed
            setTimeout(() => {
                console.log('✅ Join command sent.');
                socket.disconnect();
                clearTimeout(timeout);
                resolve();
            }, 1000);
        });

        socket.on("connect_error", (err) => {
            console.error(`❌ Connection error: ${err.message}`);
        });

        socket.on("disconnect", (reason) => {
            console.log(`Disconnected: ${reason}`);
        });
    });
}

testSocketConnection()
    .then(() => {
        console.log('\n✨ Socket test passed!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n💥 Socket test failed:', err);
        process.exit(1);
    });
