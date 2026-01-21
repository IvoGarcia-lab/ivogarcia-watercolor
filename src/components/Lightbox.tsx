'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, Ruler, Paintbrush } from 'lucide-react';
import type { Painting } from '@/types/painting';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import CommentSection from './CommentSection';

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

    // Social State
    const [userRating, setUserRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalRatings, setTotalRatings] = useState<number>(0);

    const fetchRatings = useCallback(async () => {
        if (!painting) return;

        try {
            const { data, error } = await supabase
                .from('ratings')
                .select('rating')
                .eq('painting_id', painting.id);

            if (data && data.length > 0) {
                const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
                setAverageRating(Number((sum / data.length).toFixed(1)));
                setTotalRatings(data.length);
            } else {
                setAverageRating(0);
                setTotalRatings(0);
            }
        } catch (err) {
            console.error('Error fetching ratings', err);
        }
    }, [painting]);

    const handleRate = async (rating: number) => {
        if (!painting) return;

        try {
            // Check if IP/User already rated? (Skipping strict check for now, allowing update)
            await supabase.from('ratings').insert({
                painting_id: painting.id,
                rating: rating
            });
            setUserRating(rating);
            fetchRatings(); // Refresh totals
        } catch (err) {
            console.error('Error submitting rating', err);
        }
    };

    useEffect(() => {
        if (isOpen && painting) {
            fetchRatings();
            setUserRating(0); // Reset user rating for new painting view
        }
    }, [isOpen, painting, fetchRatings]);

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
            document.addEventListener('keydown', handleKeyDown);
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
            className={`lightbox ${isOpen ? 'open' : ''} ${controlsVisible ? 'cursor-default' : 'cursor-none'} overflow-y-auto`}
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                className={`fixed top-4 right-4 p-3 text-white/80 hover:text-white transition-opacity duration-500 z-50 cursor-pointer ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-label="Fechar"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Arrow Navigation */}
            {hasPrev && (
                <button
                    className={`fixed left-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-opacity duration-500 cursor-pointer z-50 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
            )}

            {hasNext && (
                <button
                    className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-opacity duration-500 cursor-pointer z-50 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            )}

            {/* Content Container - Allow scrolling for comments */}
            <div
                className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Container with Glass Effect */}
                <div className={`relative w-full max-w-7xl flex flex-col items-center justify-center rounded-lg transition-all duration-500 mb-8`}>
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-lg -z-10" />

                    <Image
                        src={painting.image_url}
                        alt={painting.title}
                        width={1200}
                        height={1600}
                        className="max-h-[80vh] w-auto object-contain shadow-2xl rounded-sm mb-6 mt-6"
                        priority
                    />

                    {/* Info Panel within the scrollable flow */}
                    <div className="w-full max-w-4xl px-6 pb-8 text-[var(--color-text)]">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-[var(--color-border)] pb-6">
                            <div>
                                <h2 className="font-heading text-3xl font-bold mb-2">{painting.title}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
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
                            </div>

                            {/* Rating Section */}
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{averageRating}</span>
                                    <span className="text-sm text-[var(--color-text-muted)]">({totalRatings} avaliações)</span>
                                </div>
                                <StarRating
                                    size="lg"
                                    initialRating={userRating}
                                    onRate={handleRate}
                                    readOnly={userRating > 0}
                                />
                                {userRating > 0 && <span className="text-xs text-[var(--color-cta)]">Obrigado por avaliaries!</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                {painting.description && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Sobre a obra</h3>
                                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                                            {painting.description}
                                        </p>
                                    </div>
                                )}
                                {painting.ai_description && (
                                    <div className="bg-[var(--glass-bg)] p-4 rounded-lg border border-[var(--color-border)]">
                                        <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                            ✨ Análise AI
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-muted)] italic leading-relaxed">
                                            {painting.ai_description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                {painting.ai_keywords && painting.ai_keywords.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="font-semibold mb-2 text-sm">Palavras-chave</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {painting.ai_keywords.map(keyword => (
                                                <span key={keyword} className="px-2 py-1 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {painting.is_sold && (
                                    <span className="inline-block px-4 py-1.5 text-sm font-medium bg-red-100 text-red-600 rounded-full border border-red-200">
                                        Vendido
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <CommentSection paintingId={painting.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
