'use client';

import { useMemo } from 'react';
import type { Painting } from '@/types/painting';
import { X, Sparkles } from 'lucide-react';

interface KeywordFilterProps {
    paintings: Painting[];
    activeKeywords: string[];
    onKeywordToggle: (keyword: string) => void;
    onClearAll: () => void;
}

export default function KeywordFilter({
    paintings,
    activeKeywords,
    onKeywordToggle,
    onClearAll
}: KeywordFilterProps) {
    // Extract all unique keywords from paintings
    const allKeywords = useMemo(() => {
        const keywordSet = new Set<string>();

        paintings.forEach(painting => {
            if (painting.ai_keywords) {
                painting.ai_keywords.forEach(keyword => keywordSet.add(keyword));
            }
        });

        return Array.from(keywordSet).sort();
    }, [paintings]);

    if (allKeywords.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                    Filtrar por palavras-chave IA
                </span>
                {activeKeywords.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="ml-auto text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {allKeywords.map((keyword) => {
                    const isActive = activeKeywords.includes(keyword);
                    const count = paintings.filter(p =>
                        p.ai_keywords?.includes(keyword)
                    ).length;

                    return (
                        <button
                            key={keyword}
                            onClick={() => onKeywordToggle(keyword)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                        >
                            {keyword}
                            <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                                ({count})
                            </span>
                            {isActive && <X className="w-3 h-3" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
