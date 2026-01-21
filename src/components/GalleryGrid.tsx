'use client';

import { useState, useMemo } from 'react';
import PaintingCard from './PaintingCard';
import FilterBar from './FilterBar';
import KeywordFilter from './KeywordFilter';
import Lightbox from './Lightbox';
import GalleryCarousel from './GalleryCarousel';
import type { Painting } from '@/types/painting';
import { LayoutGrid, List, SortAsc, SortDesc, GalleryHorizontal } from 'lucide-react';

interface GalleryGridProps {
    paintings: Painting[];
}

type SortOption = 'order' | 'year-asc' | 'year-desc' | 'title';

export default function GalleryGrid({ paintings }: GalleryGridProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('order');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');

    // Handle keyword toggle
    const handleKeywordToggle = (keyword: string) => {
        setActiveKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    // Filter and sort paintings
    const filteredPaintings = useMemo(() => {
        let result = [...paintings];

        // Filter by category
        if (activeCategory) {
            result = result.filter(p => p.category === activeCategory);
        }

        // Filter by keywords
        if (activeKeywords.length > 0) {
            result = result.filter(p =>
                activeKeywords.some(keyword => p.ai_keywords?.includes(keyword))
            );
        }

        // Sort
        switch (sortBy) {
            case 'year-asc':
                result.sort((a, b) => {
                    const yearDiff = (a.year || 0) - (b.year || 0);
                    if (yearDiff !== 0) return yearDiff;
                    // Secondary sort by created_at for stability
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                });
                break;
            case 'year-desc':
                result.sort((a, b) => {
                    const yearDiff = (b.year || 0) - (a.year || 0);
                    if (yearDiff !== 0) return yearDiff;
                    // Secondary sort by created_at for stability
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                break;
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                result.sort((a, b) => a.display_order - b.display_order);
        }

        return result;
    }, [paintings, activeCategory, activeKeywords, sortBy]);

    const selectedPainting = selectedIndex !== null ? filteredPaintings[selectedIndex] : null;

    const handlePrev = () => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const handleNext = () => {
        if (selectedIndex !== null && selectedIndex < filteredPaintings.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    return (
        <>
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <FilterBar
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm cursor-pointer focus:outline-none focus:border-[var(--color-primary)]"
                    >
                        <option value="order">Ordem original</option>
                        <option value="year-desc">Mais recentes</option>
                        <option value="year-asc">Mais antigos</option>
                        <option value="title">Alfabético</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex rounded-lg border border-[var(--glass-border)] overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--glass-bg)] text-[var(--color-text-muted)]'}`}
                            title="Vista grelha"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--glass-bg)] text-[var(--color-text-muted)]'}`}
                            title="Vista lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('carousel')}
                            className={`p-2 transition-colors cursor-pointer ${viewMode === 'carousel' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--glass-bg)] text-[var(--color-text-muted)]'}`}
                            title="Vista carrossel"
                        >
                            <GalleryHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Keyword Filter */}
            <KeywordFilter
                paintings={paintings}
                activeKeywords={activeKeywords}
                onKeywordToggle={handleKeywordToggle}
                onClearAll={() => setActiveKeywords([])}
            />

            {/* Results count */}
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
                {filteredPaintings.length} {filteredPaintings.length === 1 ? 'pintura' : 'pinturas'}
                {activeCategory && ` em "${activeCategory}"`}
                {activeKeywords.length > 0 && ` com ${activeKeywords.length} ${activeKeywords.length === 1 ? 'palavra-chave' : 'palavras-chave'}`}
            </p>

            {filteredPaintings.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[var(--color-text-muted)] text-lg">
                        Nenhuma pintura encontrada com os filtros selecionados.
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="masonry-grid">
                    {filteredPaintings.map((painting, index) => (
                        <PaintingCard
                            key={painting.id}
                            painting={painting}
                            onClick={() => setSelectedIndex(index)}
                            index={index}
                        />
                    ))}
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredPaintings.map((painting, index) => (
                        <div
                            key={painting.id}
                            onClick={() => setSelectedIndex(index)}
                            className="glass-card p-4 flex gap-4 cursor-pointer"
                        >
                            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={painting.image_url}
                                    alt={painting.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-heading text-xl font-semibold mb-1">{painting.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mb-2">
                                    {painting.year && `${painting.year}`}
                                    {painting.technique && ` • ${painting.technique}`}
                                </p>
                                {painting.ai_description && (
                                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                                        {painting.ai_description}
                                    </p>
                                )}
                                {painting.ai_keywords && painting.ai_keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {painting.ai_keywords.slice(0, 4).map(keyword => (
                                            <span key={keyword} className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Carousel View */
                <GalleryCarousel
                    paintings={filteredPaintings}
                    onSelect={(index) => setSelectedIndex(index)}
                />
            )}

            <Lightbox
                painting={selectedPainting}
                isOpen={selectedIndex !== null}
                onClose={() => setSelectedIndex(null)}
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={selectedIndex !== null && selectedIndex > 0}
                hasNext={selectedIndex !== null && selectedIndex < filteredPaintings.length - 1}
            />
        </>
    );
}
