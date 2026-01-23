'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, Ruler, Paintbrush, Maximize, Minimize } from 'lucide-react';
import type { Painting } from '@/types/painting';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';
import CommentSection from './CommentSection';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);

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
            setActiveImage(null); // Reset active image
        }
    }, [isOpen, painting, fetchRatings]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                onPrev();
                break;
            case 'ArrowRight':
                onNext();
                break;
        }
    }, [isOpen, onClose, onPrev, onNext]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Start at top when opening new painting
            window.scrollTo(0, 0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, painting]); // Reset when painting changes too

    if (!isOpen || !painting) return null;

    const currentImage = activeImage || painting.image_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-sm">

            {/* Fullscreen Overlay (Unchanged logic, just ensure z-index is high) */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="fixed top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-[80] transition-colors cursor-pointer"
                    >
                        <Minimize className="w-8 h-8" />
                    </button>

                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={4}
                        centerOnInit
                    >
                        <TransformComponent wrapperClass="!w-screen !h-screen" contentClass="!w-screen !h-screen flex items-center justify-center">
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <Image
                                    src={currentImage}
                                    alt={painting.title}
                                    fill
                                    className="object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                    priority
                                    quality={100}
                                />
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                </div>
            )}

            {/* Modal Container - Fixed size on desktop to fit screen */}
            <div
                className="bg-[var(--color-bg)] w-full max-w-[95vw] h-[90vh] md:max-w-7xl md:h-[85vh] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Absolute) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white md:text-[var(--color-text)] md:bg-transparent md:hover:bg-[var(--glass-bg)] rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT COLUMN - IMAGE AREA */}
                <div className="w-full md:w-[60%] lg:w-[65%] h-[40vh] md:h-full relative bg-black/5 flex items-center justify-center group overflow-hidden">
                    {/* Navigation Buttons (Overlaid on Image for desktop) */}
                    <button
                        onClick={onPrev}
                        disabled={!hasPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/10 hover:bg-black/30 text-[var(--color-text)] rounded-full backdrop-blur-sm transition-all disabled:opacity-0 cursor-pointer z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!hasNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/10 hover:bg-black/30 text-[var(--color-text)] rounded-full backdrop-blur-sm transition-all disabled:opacity-0 cursor-pointer z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div
                        className="relative w-full h-full cursor-zoom-in flex items-center justify-center p-4"
                        onClick={() => setIsFullscreen(true)}
                    >
                        <div className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none flex items-center gap-2 text-xs font-medium">
                            <Maximize className="w-3 h-3" /> Fullscreen
                        </div>

                        <Image
                            src={currentImage}
                            alt={painting.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Thumbnails (Overlaid at bottom of image area) */}
                    {painting.gallery_images && painting.gallery_images.length > 0 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 backdrop-blur-md rounded-xl max-w-[90%] overflow-x-auto custom-scrollbar">
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveImage(painting.image_url); }}
                                className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${activeImage === painting.image_url || activeImage === null ? 'border-white ring-2 ring-white/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <Image src={painting.image_url} alt="Main" fill className="object-cover" />
                            </button>
                            {painting.gallery_images.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(img.image_url); }}
                                    className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img.image_url ? 'border-white ring-2 ring-white/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <Image src={img.image_url} alt="Detail" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - DETAILS & COMMENTS */}
                <div className="w-full md:w-[40%] lg:w-[35%] h-full flex flex-col bg-[var(--color-bg)] border-l border-[var(--color-border)]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        {/* Header Info */}
                        <div className="mb-6 border-b border-[var(--color-border)] pb-6">
                            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">{painting.title}</h2>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-text-muted)] mb-4">
                                {painting.year && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> {painting.year}
                                    </span>
                                )}
                                {painting.dimensions && (
                                    <span className="flex items-center gap-1.5">
                                        <Ruler className="w-4 h-4" /> {painting.dimensions}
                                    </span>
                                )}
                                {painting.technique && (
                                    <span className="flex items-center gap-1.5">
                                        <Paintbrush className="w-4 h-4" /> {painting.technique}
                                    </span>
                                )}
                            </div>

                            {/* Ratings */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">{averageRating}</span>
                                        <StarRating size="md" initialRating={Math.round(averageRating)} readOnly onRate={() => { }} />
                                    </div>
                                    <span className="text-xs text-[var(--color-text-muted)]">({totalRatings} avaliações)</span>
                                </div>

                                {painting.is_sold && (
                                    <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full border border-red-200">
                                        Vendido
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-6 mb-8">
                            {painting.description && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">O Artista</h3>
                                    <p className="text-[var(--color-text)] leading-relaxed text-sm md:text-base">
                                        {painting.description}
                                    </p>
                                </div>
                            )}

                            {painting.ai_description && (
                                <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--color-border)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-5">
                                        <Paintbrush className="w-12 h-12" />
                                    </div>
                                    <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-[var(--color-primary)]">Análise IA</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] italic leading-relaxed relative z-10">
                                        "{painting.ai_description}"
                                    </p>
                                </div>
                            )}

                            {painting.ai_keywords && painting.ai_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {painting.ai_keywords.map(keyword => (
                                        <span key={keyword} className="px-2 py-1 text-[10px] uppercase font-medium tracking-wide bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-md border border-[var(--color-border)]">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comments - Integrated in flow */}
                        <div className="pt-6 border-t border-[var(--color-border)]">
                            <h3 className="font-heading text-xl mb-4">Comentários</h3>
                            <div className="bg-[var(--glass-bg)]/50 -m-2 p-2 rounded-xl">
                                <CommentSection paintingId={painting.id} />
                            </div>
                        </div>
                    </div>

                    {/* Rate Action (Sticky Bottom of Right Panel) */}
                    <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-md">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[var(--color-text-muted)]">Avaliar esta obra:</span>
                            <StarRating size="md" initialRating={userRating} onRate={handleRate} readOnly={userRating > 0} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
