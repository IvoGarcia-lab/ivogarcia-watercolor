'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { href: '/', label: 'Galeria' },
    { href: '/author', label: 'Autor' },
    { href: '/process', label: 'Processo' },
    { href: '/contact', label: 'Contacto' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar glass flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <Palette className="w-8 h-8 text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-[var(--color-primary)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                </div>
                <span className="font-heading text-2xl font-semibold tracking-tight">
                    Aquarela Vivida
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Right side - Theme toggle & Admin */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                <Link
                    href="/admin"
                    className="hidden md:flex px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-all duration-200 cursor-pointer"
                >
                    Admin
                </Link>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
                    aria-label="Menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 glass rounded-xl md:hidden">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-bg)] transition-all duration-200 cursor-pointer"
                        >
                            Admin
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
