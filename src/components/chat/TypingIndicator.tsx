// src/components/chat/TypingIndicator.tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeToTyping } from "@/lib/pusher-client";

interface TypingIndicatorProps {
    conversationId: string;
    userId: string; // current user id
}

export default function TypingIndicator({ conversationId, userId }: TypingIndicatorProps) {
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        // Subscribe to typing events
        const unsubscribe = subscribeToTyping(
            conversationId,
            (data) => {
                const { userId: typingUserId, isTyping } = data;
                setTypingUsers((prev) => {
                    const without = prev.filter((id) => id !== typingUserId);
                    return isTyping ? [...without, typingUserId] : without;
                });
            }
        );
        return () => unsubscribe();
    }, [conversationId]);

    // Don't show typing for self
    const othersTyping = typingUsers.filter((id) => id !== userId);

    if (othersTyping.length === 0) return null;

    return (
        <div className="text-xs text-gray-500 mt-1">
            {othersTyping.length === 1
                ? "Someone is typing..."
                : `${othersTyping.length} people are typing...`}
        </div>
    );
}
