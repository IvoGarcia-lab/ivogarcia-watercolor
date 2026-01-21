'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Mail, MapPin, Phone, Send, Instagram, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
    const [contactContent, setContactContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        async function fetchContent() {
            try {
                const { data } = await supabase
                    .from('site_content')
                    .select('content')
                    .eq('slug', 'contact-info')
                    .single();

                if (data) {
                    setContactContent(data.content);
                }
            } catch (err) {
                console.error('Error fetching contact content:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setSent(false), 5000);
            } else {
                alert(data.error || 'Erro ao enviar mensagem.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Erro de conexão ao enviar mensagem.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen pt-[calc(var(--nav-height)+32px)]">
                <div className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
                    <div className="max-w-5xl mx-auto">
                        {/* Hero Section */}
                        <header className="text-center mb-16">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                                Contacto
                            </h1>
                            {loading ? (
                                <div className="h-6 bg-[var(--color-border)] rounded w-2/3 mx-auto animate-pulse"></div>
                            ) : (
                                <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto whitespace-pre-wrap">
                                    {contactContent || "Interessado em adquirir uma obra ou encomendar uma pintura personalizada? Entre em contacto."}
                                </p>
                            )}
                        </header>

                        <div className="grid lg:grid-cols-5 gap-8">
                            {/* Contact Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="glass-card p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-1">Email</h3>
                                            <a
                                                href="mailto:contato@ivogarcia.pt"
                                                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                            >
                                                contato@ivogarcia.pt
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 text-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-1">Telefone</h3>
                                            <a
                                                href="tel:+351912345678"
                                                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                            >
                                                +351 912 345 678
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-1">Localização</h3>
                                            <p className="text-[var(--color-text-muted)]">
                                                Lisboa, Portugal
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="glass-card p-6">
                                    <h3 className="font-medium mb-4">Redes Sociais</h3>
                                    <div className="flex gap-3">
                                        <a
                                            href="#"
                                            className="w-12 h-12 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer"
                                            aria-label="Instagram"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                        <a
                                            href="#"
                                            className="w-12 h-12 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer"
                                            aria-label="Facebook"
                                        >
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-3">
                                <div className="glass-card p-8">
                                    <h2 className="font-heading text-2xl font-semibold mb-6">Enviar Mensagem</h2>

                                    {sent && (
                                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600">
                                            Mensagem enviada com sucesso! Responderemos em breve.
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Nome</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                                    placeholder="O seu nome"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                                    placeholder="seu@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Assunto</label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                                placeholder="Motivo do contacto"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Mensagem</label>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                                                placeholder="A sua mensagem..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="btn-primary flex items-center justify-center gap-2 w-full cursor-pointer disabled:opacity-50"
                                        >
                                            {sending ? (
                                                'A enviar...'
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Enviar Mensagem
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
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
