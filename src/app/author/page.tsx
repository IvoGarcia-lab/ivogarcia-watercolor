'use client';

import Navbar from '@/components/Navbar';
import { Paintbrush, Heart, Award, BookOpen, Facebook, Instagram, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useAutoScroll } from '@/hooks/useAutoScroll';

export default function AuthorPage() {
    useAutoScroll(true, 8000, 0.3); // Idle 8s, Slow Speed 0.3
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
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />

            <div className="relative z-10 px-4 md:px-8 lg:px-12 py-20 lg:py-32">
                <div className="max-w-5xl mx-auto">

                    {/* Header Section */}
                    <header className="mb-24 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium tracking-widest uppercase mb-6">
                            O Artista
                        </span>
                        <h1 className="font-heading text-5xl md:text-7xl font-light mb-8 tracking-tight">
                            Ivo Garcia
                        </h1>
                        <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-8 opacity-50"></div>
                        <p className="text-xl md:text-2xl text-[var(--color-text-muted)] font-light max-w-3xl mx-auto leading-relaxed">
                            &quot;A aguarela e a arte de capturar a luz e a memoria...&quot;
                        </p>
                    </header>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">

                        {/* Bio Content */}
                        <div className="lg:col-span-7 lg:order-2">
                            <div className="glass p-10 md:p-14 rounded-2xl border border-[var(--glass-border)] shadow-2xl backdrop-blur-2xl">
                                <h2 className="font-heading text-3xl mb-8 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-[var(--color-text)] opacity-30"></span>
                                    Biografia
                                </h2>

                                {loading ? (
                                    <div className="space-y-6 animate-pulse opacity-50">
                                        <div className="h-4 bg-current rounded w-full"></div>
                                        <div className="h-4 bg-current rounded w-5/6"></div>
                                        <div className="h-4 bg-current rounded w-full"></div>
                                        <div className="h-4 bg-current rounded w-4/5"></div>
                                    </div>
                                ) : (
                                    <div className="prose prose-lg max-w-none text-[var(--color-text-muted)] leading-relaxed font-light">
                                        <div className="whitespace-pre-wrap">
                                            {bioContent || "O conteudo biografico esta a carregar..."}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-12 flex items-center gap-6 pt-8 border-t border-[var(--glass-border)]">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-heading font-bold text-[var(--color-primary)]">15+</span>
                                        <span className="text-xs uppercase tracking-wider opacity-60">Anos de Experiencia</span>
                                    </div>
                                    <div className="w-[1px] h-10 bg-[var(--glass-border)]"></div>
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-heading font-bold text-[var(--color-primary)]">500+</span>
                                        <span className="text-xs uppercase tracking-wider opacity-60">Obras Vendidas</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-5 lg:order-1 sticky top-32">
                            <div className="glass p-8 rounded-2xl border border-[var(--glass-border)] text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                <div className="w-48 h-48 mx-auto bg-[var(--color-surface-active)] rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10">
                                    <span className="text-6xl grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">🎨</span>
                                </div>

                                <h3 className="font-heading text-xl font-medium mb-1">Ivo Garcia</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mb-8 uppercase tracking-widest text-[10px]">Aguarelista Profissional</p>

                                <div className="space-y-4">
                                    <a href="mailto:aguarela@3dhr.pt" className="flex items-center justify-center gap-3 p-3 rounded-xl bg-[var(--glass-bg)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 group/link border border-[var(--glass-border)]">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm font-medium">Contactar por Email</span>
                                    </a>
                                    <div className="flex gap-4 justify-center pt-4">
                                        <a href="https://www.instagram.com/ivo_garcia_2023/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:bg-[#E4405F]/10 hover:text-[#E4405F] transition-colors"><Instagram className="w-5 h-5" /></a>
                                        <a href="#" className="p-3 rounded-full hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"><Facebook className="w-5 h-5" /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Philosophy */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { icon: Paintbrush, title: "Tecnica", desc: "Dominio exclusivo da aguarela..." },
                            { icon: Heart, title: "Emocao", desc: "Cada obra e um reflexo sincero..." },
                            { icon: Award, title: "Legado", desc: "Obras presentes em colecoes privadas..." }
                        ].map((item, idx) => (
                            <div key={idx} className="glass p-8 rounded-xl border border-[var(--glass-border)] hover:border-[var(--color-primary)]/30 transition-colors duration-300 group">
                                <item.icon className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-4" />
                                <h3 className="font-heading text-lg font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed opacity-80">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="px-4 md:px-8 lg:px-12 py-8 border-t border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto text-center text-[var(--color-text-muted)] text-sm">
                    <p>&copy; {new Date().getFullYear()} IvoGarcia Arte. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
