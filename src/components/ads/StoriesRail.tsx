"use client";

import { useEffect, useState } from "react";
import StoryCircle from "./StoryCircle";
import StoryViewer, { StoryGroup } from "./StoryViewer";
import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function StoriesRail() {
    const { t } = useLanguage();
    const router = useRouter();
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

    // Data State
    const [stories, setStories] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('/api/stories/active');
                if (res.ok) {
                    const data = await res.json();
                    setStories(data);
                }
            } catch (error) {
                console.error("Failed to load stories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    return (
        <div className="bg-white border-b border-gray-100 py-4 mb-6 overflow-x-auto scrollbar-hide">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
                {/* Create Story Button */}
                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => router.push('/ads-manager/create')}>
                    <div className="relative w-[60px] h-[60px]">
                        <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Plus className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{t('ads.create_first')}</span>
                </div>

                {/* Loading Skeletons */}
                {loading && [1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1 animate-pulse">
                        <div className="w-[66px] h-[66px] rounded-full bg-gray-200" />
                        <div className="w-16 h-3 bg-gray-200 rounded mt-1" />
                    </div>
                ))}

                {/* Story Circles */}
                {stories.map((group, idx) => (
                    <StoryCircle
                        key={group.companyId}
                        name={group.companyName}
                        logo={group.companyLogo}
                        hasUnseen={true} // Logic to track seen/unseen needed later
                        onClick={() => setActiveStoryIndex(idx)}
                    />
                ))}
            </div>

            {/* Viewer Modal */}
            {activeStoryIndex !== null && (
                <StoryViewer
                    groups={stories}
                    initialGroupIndex={activeStoryIndex}
                    onClose={() => setActiveStoryIndex(null)}
                />
            )}
        </div>
    );
}
