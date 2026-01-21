'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Painting } from '@/types/painting';

interface GalleryCarouselProps {
    paintings: Painting[];
    onSelect: (index: number) => void;
}

export default function GalleryCarousel({ paintings, onSelect }: GalleryCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            const cardWidth = 320; // approximate width of a card + gap
            const gap = 32;
            const containerWidth = containerRef.current.offsetWidth;
            const scrollPos = index * (cardWidth + gap) - (containerWidth / 2) + (cardWidth / 2);

            containerRef.current.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
        }
        setActiveIndex(index);
    };

    const handleNext = () => {
        if (activeIndex < paintings.length - 1) {
            scrollToIndex(activeIndex + 1);
        }
    };

    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            if (activeIndex < paintings.length - 1) {
                scrollToIndex(activeIndex + 1);
            } else {
                scrollToIndex(0); // Loop back to start
            }
        }, 4000); // 4 seconds

        return () => clearInterval(interval);
    }, [activeIndex, isPaused, paintings.length]);

    const handlePrev = () => {
        if (activeIndex > 0) {
            scrollToIndex(activeIndex - 1);
        }
    };

    return (
        <div
            className="relative w-full py-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >

            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--glass-bg)] disabled:hover:text-[var(--color-text)] transition-all duration-300"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={handleNext}
                disabled={activeIndex === paintings.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--glass-bg)] disabled:hover:text-[var(--color-text)] transition-all duration-300"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Scroll Container */}
            <div
                ref={containerRef}
                className="flex gap-8 overflow-x-auto snap-x snap-mandatory px-[calc(50%-160px)] scrollbar-hide py-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {paintings.map((painting, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <div
                            key={painting.id}
                            className={`relative flex-shrink-0 w-[320px] snap-center transition-all duration-500 transform cursor-pointer ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-70 hover:opacity-100'}`}
                            onClick={() => {
                                scrollToIndex(index);
                                onSelect(index);
                            }}
                        >
                            <div className={`glass-card overflow-hidden h-[450px] flex flex-col ${isActive ? 'shadow-2xl ring-2 ring-[var(--color-primary)]/20' : ''}`}>
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={painting.image_url}
                                        alt={painting.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {painting.is_sold && (
                                        <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full">
                                            Vendido
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-heading text-xl font-semibold mb-2 line-clamp-1">{painting.title}</h3>
                                        <p className="text-sm text-[var(--color-text-muted)]">{painting.year} • {painting.technique}</p>
                                    </div>

                                    {isActive && (
                                        <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                                            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                                                {painting.ai_description || painting.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
