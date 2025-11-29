import { io, Socket } from "socket.io-client";

async function testSocketInteraction() {
    console.log('🚀 Testing User-to-User Socket Interaction\n');

    const socketUrl = 'http://localhost:3000';
    const socketPath = '/api/socket/io';
    const conversationId = 'test-conversation-999';

    // Helper to create a client
    const createClient = (name: string): Promise<Socket> => {
        return new Promise((resolve, reject) => {
            const socket = io(socketUrl, {
                path: socketPath,
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 3,
                timeout: 5000,
                forceNew: true, // Ensure distinct connections
            });

            socket.on("connect", () => {
                console.log(`✅ ${name} connected (ID: ${socket.id})`);
                resolve(socket);
            });

            socket.on("connect_error", (err) => {
                console.error(`❌ ${name} connection error: ${err.message}`);
                reject(err);
            });
        });
    };

    try {
        // 1. Connect two clients
        console.log('1️⃣ Connecting clients...');
        const clientA = await createClient('User A');
        const clientB = await createClient('User B');

        // 2. Join room
        console.log('\n2️⃣ Joining conversation room...');
        clientA.emit("join-conversation", conversationId);
        clientB.emit("join-conversation", conversationId);

        // Give it a moment to join
        await new Promise(r => setTimeout(r, 500));

        // 3. Setup listener on Client B
        const messagePromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for message'));
            }, 5000);

            clientB.on("new-message", (msg) => {
                console.log(`\n📨 User B received message: "${msg.text}" from ${msg.sender}`);
                if (msg.text === 'Hello from User A!') {
                    console.log('✅ Message content verified!');
                    clearTimeout(timeout);
                    resolve();
                }
            });
        });

        // 4. Send message from Client A
        console.log('\n3️⃣ User A sending message...');
        const testMessage = {
            id: 'msg-1',
            text: 'Hello from User A!',
            sender: 'User A',
            createdAt: new Date().toISOString()
        };

        clientA.emit("send-message", {
            conversationId,
            message: testMessage
        });

        // 5. Wait for receipt
        await messagePromise;

        console.log('\n✨ Interaction Test Passed! Real-time relay is working.');

        clientA.disconnect();
        clientB.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
}

testSocketInteraction();
