'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Painting } from '@/types/painting';

interface PaintingCardProps {
    painting: Painting;
    onClick: () => void;
    index: number;
}

export default function PaintingCard({ painting, onClick, index }: PaintingCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const staggerClass = `stagger-${(index % 5) + 1}`;

    return (
        <article
            className={`painting-card glass-card opacity-0 animate-fade-in ${staggerClass}`}
            onClick={onClick}
        >
            <div className="relative w-full">
                {!isLoaded && (
                    <div className="skeleton w-full h-64 rounded-xl" />
                )}
                <Image
                    src={painting.image_url}
                    alt={painting.title}
                    width={600}
                    height={800}
                    className={`w-full h-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
            </div>

            <div className="painting-overlay">
                <h3 className="font-heading">{painting.title}</h3>
                <p>
                    {painting.year && `${painting.year}`}
                    {painting.year && painting.technique && ' • '}
                    {painting.technique}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {painting.ai_mood && (
                        <span className="px-2 py-0.5 text-xs bg-white/20 backdrop-blur-sm rounded-full">
                            {painting.ai_mood}
                        </span>
                    )}
                    {painting.is_sold && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/80 rounded-full">
                            Vendido
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
