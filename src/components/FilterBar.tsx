'use client';

import { CATEGORIES } from '@/types/painting';

interface FilterBarProps {
    activeCategory: string | null;
    onCategoryChange: (category: string | null) => void;
}

export default function FilterBar({ activeCategory, onCategoryChange }: FilterBarProps) {
    return (
        <div className="filter-bar">
            <button
                className={`filter-chip cursor-pointer ${activeCategory === null ? 'active' : ''}`}
                onClick={() => onCategoryChange(null)}
            >
                Todas
            </button>

            {CATEGORIES.map((category) => (
                <button
                    key={category}
                    className={`filter-chip cursor-pointer ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
