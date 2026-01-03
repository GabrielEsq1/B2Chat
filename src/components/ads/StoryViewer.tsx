"use client";

import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface Story {
    id: string;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    duration: number; // seconds
    ctaLink?: string;
    ctaText?: string;
}

export interface StoryGroup {
    companyId: string;
    companyName: string;
    companyLogo: string;
    stories: Story[];
}

interface StoryViewerProps {
    groups: StoryGroup[];
    initialGroupIndex: number;
    onClose: () => void;
}

export default function StoryViewer({ groups, initialGroupIndex, onClose }: StoryViewerProps) {
    const { t } = useLanguage();
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentGroup = groups[currentGroupIndex];
    const currentStory = currentGroup.stories[currentStoryIndex];

    useEffect(() => {
        setProgress(0);
        if (currentStory.mediaType === 'VIDEO' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    }, [currentStory, currentGroupIndex]);

    useEffect(() => {
        if (isPaused) return;

        const intervalTime = 100; // Update every 100ms
        const step = 100 / (currentStory.duration * 10); // Percentage step

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [currentStory, currentGroupIndex, isPaused]);

    const handleNext = () => {
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentGroupIndex < groups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(groups[currentGroupIndex - 1].stories.length - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Container for Desktop (Mobile style) */}
            <div className="relative w-full h-full md:w-[400px] md:h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900">

                {/* Progress Bars */}
                <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                    {currentGroup.stories.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentStoryIndex ? 'w-full' :
                                        idx === currentStoryIndex ? `w-[${progress}%]` : 'w-0'
                                    }`}
                                style={{ width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                        <img src={currentGroup.companyLogo || '/placeholder-user.jpg'} alt="Logo" className="w-8 h-8 rounded-full border border-white/50" />
                        <span className="text-white font-semibold shadow-black drop-shadow-md">{currentGroup.companyName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsPaused(!isPaused)}>
                            {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
                        </button>
                        <button onClick={onClose}>
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Interaction Layers */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev} />
                    <div className="w-1/3 h-full" onClick={() => setIsPaused(prev => !prev)} />
                    <div className="w-1/3 h-full" onClick={handleNext} />
                </div>

                {/* Media */}
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {currentStory.mediaType === 'VIDEO' ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-cover"
                            playsInline
                            muted={false} // Ideally should be muted first then unmuted by user, but for stories usually sound on tap
                            autoPlay={!isPaused}
                            onEnded={handleNext}
                        />
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                        />
                    )}
                </div>

                {/* CTA */}
                {currentStory.ctaLink && (
                    <div className="absolute bottom-6 left-6 right-6 z-30">
                        <a
                            href={currentStory.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white text-black font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {currentStory.ctaText || t('common.view_more')}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}
