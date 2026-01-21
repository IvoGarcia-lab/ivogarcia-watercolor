'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, Ruler, Paintbrush } from 'lucide-react';
import type { Painting } from '@/types/painting';

interface LightboxProps {
    painting: Painting | null;
    isOpen: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}

export default function Lightbox({
    painting,
    isOpen,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext
}: LightboxProps) {

    const [controlsVisible, setControlsVisible] = useState(true);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                if (hasPrev) onPrev();
                break;
            case 'ArrowRight':
                if (hasNext) onNext();
                break;
        }
    }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const resetTimer = () => {
            setControlsVisible(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setControlsVisible(false), 5000);
        };

        if (isOpen) {
            document.addEventListener('mousemove', resetTimer);
            document.addEventListener('keydown', handleKeyDown); // Combined listener setup
            document.body.style.overflow = 'hidden';
            resetTimer();
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousemove', resetTimer);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            clearTimeout(timeout);
        };
    }, [isOpen, handleKeyDown]);

    if (!painting) return null;

    return (
        <div
            className={`lightbox ${isOpen ? 'open' : ''} ${controlsVisible ? 'cursor-default' : 'cursor-none'}`}
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                className={`absolute top-4 right-4 p-3 text-white/80 hover:text-white transition-opacity duration-500 z-10 cursor-pointer ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-label="Fechar"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Navigation Arrows */}
            {hasPrev && (
                <button
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-opacity duration-500 cursor-pointer ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
            )}

            {hasNext && (
                <button
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-opacity duration-500 cursor-pointer ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    aria-label="Próximo"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            )}

            {/* Content */}
            <div
                className="lightbox-content"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={painting.image_url}
                    alt={painting.title}
                    width={1200}
                    height={1600}
                    className="lightbox-image"
                    priority
                />

                {/* Info Panel */}
                <div className={`lightbox-info rounded-b-lg transition-opacity duration-700 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="font-heading text-2xl mb-2">{painting.title}</h2>

                    <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-3">
                        {painting.year && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {painting.year}
                            </span>
                        )}
                        {painting.dimensions && (
                            <span className="flex items-center gap-1.5">
                                <Ruler className="w-4 h-4" />
                                {painting.dimensions}
                            </span>
                        )}
                        {painting.technique && (
                            <span className="flex items-center gap-1.5">
                                <Paintbrush className="w-4 h-4" />
                                {painting.technique}
                            </span>
                        )}
                    </div>

                    {/* AI Description */}
                    {painting.ai_description && (
                        <p className="text-white/70 text-sm leading-relaxed mb-3 italic">
                            {painting.ai_description}
                        </p>
                    )}

                    {/* Manual Description */}
                    {painting.description && (
                        <p className="text-white/70 text-sm leading-relaxed">
                            {painting.description}
                        </p>
                    )}

                    {/* AI Keywords */}
                    {painting.ai_keywords && painting.ai_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {painting.ai_keywords.map(keyword => (
                                <span key={keyword} className="px-2 py-0.5 text-xs bg-white/10 text-white/80 rounded-full">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}

                    {painting.is_sold && (
                        <span className="inline-block mt-3 px-4 py-1.5 text-sm font-medium bg-red-500/80 rounded-full">
                            Vendido
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
