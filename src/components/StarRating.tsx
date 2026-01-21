'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    initialRating?: number | null;
    readOnly?: boolean;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
    initialRating = 0,
    readOnly = false,
    onRate,
    size = 'md'
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [currentRating, setCurrentRating] = useState<number>(initialRating || 0);

    const handleMouseEnter = (star: number) => {
        if (!readOnly) setHoverRating(star);
    };

    const handleMouseLeave = () => {
        if (!readOnly) setHoverRating(null);
    };

    const handleClick = (star: number) => {
        if (!readOnly && onRate) {
            setCurrentRating(star);
            onRate(star);
        }
    };

    const starSize = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating !== null ? star <= hoverRating : star <= currentRating);

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        className={`transition-transform duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} focus:outline-none`}
                        disabled={readOnly}
                    >
                        <Star
                            className={`${starSize[size]} transition-colors duration-300 ${isActive
                                    ? 'fill-[var(--color-cta)] text-[var(--color-cta)] drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                                    : 'fill-transparent text-[var(--color-text-muted)]'
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
