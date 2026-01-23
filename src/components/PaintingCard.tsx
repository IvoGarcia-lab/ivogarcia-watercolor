'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Painting } from '@/types/painting';

interface PaintingCardProps {
    painting: Painting;
    onClick: () => void;
    index: number;
}

interface TooltipPosition {
    x: number;
    y: number;
}

export default function PaintingCard({ painting, onClick, index }: PaintingCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ x: 0, y: 0 });

    const staggerClass = `stagger-${(index % 5) + 1}`;

    const closeTooltip = useCallback(() => {
        setShowTooltip(false);
    }, []);

    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(closeTooltip, 10000);
            return () => clearTimeout(timer);
        }
    }, [showTooltip, closeTooltip]);

    const handleMoreInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top
        });
        setShowTooltip(true);
    };

    return (
        <>
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
                        {painting.is_sold ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-500/80 rounded-full">
                                Vendido
                            </span>
                        ) : (
                            <>
                                {painting.price && painting.price > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/80 rounded-full">
                                        €{painting.price}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={handleMoreInfo}
                                    className="px-3 py-1 text-xs font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full transition-colors w-full text-center mt-1 cursor-pointer"
                                >
                                    Mais Informações
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </article>

            {/* Elegant Tooltip */}
            {showTooltip && (
                <div
                    className="fixed z-[9999] animate-fade-in"
                    style={{
                        left: `${tooltipPos.x}px`,
                        top: `${tooltipPos.y}px`,
                        transform: 'translate(-50%, -100%) translateY(-12px)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 p-4 max-w-[280px]">
                        {/* Close button */}
                        <button
                            onClick={closeTooltip}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                            aria-label="Fechar"
                        >
                            ×
                        </button>

                        {/* Content */}
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                                    Interessado nesta obra?
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Visite a página de <span className="font-semibold text-[var(--color-primary)]">Contacto</span> e envie-me uma mensagem!
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--color-primary)] rounded-full"
                                style={{
                                    animation: 'shrink 10s linear forwards'
                                }}
                            />
                        </div>

                        {/* Arrow */}
                        <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-800/90 border-r border-b border-white/30 dark:border-white/10 transform -translate-x-1/2 rotate-45" />
                    </div>

                    <style jsx>{`
                        @keyframes shrink {
                            from { width: 100%; }
                            to { width: 0%; }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

