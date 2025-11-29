import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClient) {
        pusherClient = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );
    }
    return pusherClient;
}

export function subscribeToConversation(conversationId: string, callback: (data: any) => void) {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", callback);

    return () => {
        channel.unbind("new-message", callback);
        pusher.unsubscribe(`conversation-${conversationId}`);
    };
}

export function subscribeToTyping(conversationId: string, callback: (data: any) => void) {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`conversation-${conversationId}`);

    channel.bind("typing", callback);

    return () => {
        channel.unbind("typing", callback);
    };
}

export function sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    // This would typically be done via an API call
    fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, userId, isTyping }),
    });
}
