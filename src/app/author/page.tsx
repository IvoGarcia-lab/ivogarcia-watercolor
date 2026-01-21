'use client';

import Navbar from '@/components/Navbar';
import { Paintbrush, Heart, Award, BookOpen, Facebook, Instagram, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Client component, so we remove the metadata export or move it to layout/separate file
// For simplicity in this structure, we'll keep the component client-side.

export default function AuthorPage() {
    const [bioContent, setBioContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const { data, error } = await supabase
                    .from('site_content')
                    .select('content')
                    .eq('slug', 'author-bio')
                    .single();

                if (data) {
                    setBioContent(data.content);
                }
            } catch (err) {
                console.error('Error fetching bio:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, []);

    return (
        <>
            <Navbar />

            <main className="min-h-screen pt-[calc(var(--nav-height)+32px)]">
                <div className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section */}
                        <header className="text-center mb-16">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                                Sobre o Autor
                            </h1>
                            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                                A arte de capturar a luz e a emoção através da aguarela
                            </p>
                        </header>

                        <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 items-start mb-16">
                            {/* Biography Card */}
                            <div className="glass-card p-8 md:p-12">
                                <div className="prose prose-lg max-w-none">
                                    <h2 className="font-heading text-3xl font-semibold mb-6 text-[var(--color-text)]">
                                        A Minha Jornada
                                    </h2>
                                    {loading ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="h-4 bg-[var(--color-border)] rounded w-full"></div>
                                            <div className="h-4 bg-[var(--color-border)] rounded w-5/6"></div>
                                            <div className="h-4 bg-[var(--color-border)] rounded w-4/6"></div>
                                        </div>
                                    ) : (
                                        <div className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                                            {bioContent || "O conteúdo biográfico está a ser carregado..."}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar / Photo / Contact */}
                            <div className="space-y-6">
                                {/* Photo Placeholder - Could be dynamic later */}
                                <div className="glass-card p-4 aspect-square flex items-center justify-center bg-[var(--glass-bg)] overflow-hidden">
                                    <div className="text-center">
                                        <div className="w-32 h-32 mx-auto bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mb-2">
                                            <span className="text-4xl">🎨</span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-muted)]">Foto do Artista</p>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="glass-card p-6">
                                    <h3 className="font-heading text-xl font-semibold mb-4">Redes Sociais</h3>
                                    <div className="flex flex-col gap-3">
                                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-[var(--glass-border)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-[#E4405F]">
                                            <Instagram className="w-5 h-5" />
                                            <span>Instagram</span>
                                        </a>
                                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-[var(--glass-border)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-[#1877F2]">
                                            <Facebook className="w-5 h-5" />
                                            <span>Facebook</span>
                                        </a>
                                        <a href="mailto:contacto@ivogarcia.pt" className="flex items-center gap-3 p-2 hover:bg-[var(--glass-border)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                                            <Mail className="w-5 h-5" />
                                            <span>Email</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Values Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Paintbrush className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Técnica</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Trabalho exclusivamente com aguarela em técnicas húmidas e secas,
                                    explorando a transparência única deste medium.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Paixão</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Cada pintura nasce de uma emoção genuína, seja a serenidade de uma
                                    manhã de nevoeiro ou a energia de um pôr-do-sol.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <Award className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Reconhecimento</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    As minhas obras fazem parte de coleções privadas em Portugal,
                                    Espanha, França e Reino Unido.
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">Ensino</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Partilho regularmente o meu conhecimento através de workshops
                                    e demonstrações para aspirantes a aguarelistas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="px-4 md:px-8 lg:px-12 py-8 border-t border-[var(--color-border)]">
                    <div className="max-w-7xl mx-auto text-center text-[var(--color-text-muted)] text-sm">
                        <p>© {new Date().getFullYear()} IvoGarcia Arte. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </main>
        </>
    );
}
