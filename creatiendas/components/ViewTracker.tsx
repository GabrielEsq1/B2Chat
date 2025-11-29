"use client";

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        const incrementView = async () => {
            try {
                // Simple check to avoid counting double in strict mode dev
                // In production this is fine.
                // We could also check sessionStorage to avoid counting same user multiple times per session
                const viewed = sessionStorage.getItem(`viewed_${slug}`);
                if (!viewed) {
                    await fetch(`/api/stores/${slug}/view`, { method: 'POST' });
                    sessionStorage.setItem(`viewed_${slug}`, 'true');
                }
            } catch (error) {
                console.error('Error tracking view:', error);
            }
        };

        incrementView();
    }, [slug]);

    return null;
}
