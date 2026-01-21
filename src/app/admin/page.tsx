'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, PAINTINGS_BUCKET } from '@/lib/supabase';
import { analyzePainting, isAIConfigured } from '@/lib/aiml';
import { Upload, Trash2, Edit, X, Save, Plus, ArrowLeft, GripVertical, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Painting, PaintingFormData } from '@/types/painting';
import { CATEGORIES } from '@/types/painting';

const ADMIN_PASSWORD = 'aguarela';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [paintings, setPaintings] = useState<Painting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Painting | null>(null);

    const [formData, setFormData] = useState<PaintingFormData>({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        dimensions: '',
        technique: 'Aguarela sobre papel',
        category: 'Paisagem',
        is_sold: false,
        price: undefined,
    });

    const fetchPaintings = useCallback(async () => {
        const { data } = await supabase
            .from('paintings')
            .select('*')
            .order('display_order', { ascending: true });

        if (data) setPaintings(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPaintings();
        }
    }, [isAuthenticated, fetchPaintings]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Palavra-passe incorreta');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formData.title.trim()) {
            setError('Por favor, insira um título antes de carregar a imagem.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(PAINTINGS_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(PAINTINGS_BUCKET)
                .getPublicUrl(fileName);

            // AI Analysis - send public URL to AI/ML API
            let aiData = {};
            if (isAIConfigured()) {
                setAnalyzing(true);
                try {
                    console.log('Starting AI analysis for:', publicUrl);
                    const analysis = await analyzePainting(publicUrl);

                    if (analysis) {
                        aiData = {
                            ai_description: analysis.description,
                            ai_keywords: analysis.keywords,
                            ai_mood: analysis.mood,
                            ai_colors: analysis.colors,
                        };
                        console.log('AI Analysis:', analysis);
                    }
                } catch (aiError) {
                    console.error('AI analysis failed:', aiError);
                    // Continue without AI data
                } finally {
                    setAnalyzing(false);
                }
            }

            const { error: insertError } = await supabase
                .from('paintings')
                .insert({
                    ...formData,
                    image_url: publicUrl,
                    display_order: paintings.length,
                    ...aiData,
                });

            if (insertError) throw insertError;

            setFormData({
                title: '',
                description: '',
                year: new Date().getFullYear(),
                dimensions: '',
                technique: 'Aguarela sobre papel',
                category: 'Paisagem',
                is_sold: false,
                price: undefined,
            });
            setShowUpload(false);
            fetchPaintings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar imagem');
        } finally {
            setUploading(false);
            setAnalyzing(false);
        }
    };

    const handleDelete = (painting: Painting) => {
        console.log('Delete clicked for:', painting.title);
        setDeleteTarget(painting);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        console.log('Confirming delete for:', deleteTarget.title);

        try {
            // Extract filename from URL
            const urlParts = deleteTarget.image_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            console.log('Deleting file:', fileName);

            if (fileName) {
                const { error: storageError } = await supabase.storage
                    .from(PAINTINGS_BUCKET)
                    .remove([fileName]);

                if (storageError) {
                    console.error('Storage delete error:', storageError);
                }
            }

            const { error: dbError } = await supabase
                .from('paintings')
                .delete()
                .eq('id', deleteTarget.id);

            if (dbError) {
                console.error('DB delete error:', dbError);
                throw dbError;
            }

            console.log('Delete successful');
            setDeleteTarget(null);
            fetchPaintings();
        } catch (err) {
            console.error('Delete error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao eliminar');
            setDeleteTarget(null);
        }
    };

    const handleUpdate = async (painting: Painting) => {
        try {
            await supabase
                .from('paintings')
                .update({
                    title: painting.title,
                    description: painting.description,
                    year: painting.year,
                    dimensions: painting.dimensions,
                    technique: painting.technique,
                    category: painting.category,
                    is_sold: painting.is_sold,
                    price: painting.price,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', painting.id);

            setEditingId(null);
            fetchPaintings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar');
        }
    };

    // Manual AI Retry Handler
    const handleRetryAI = async (painting: Painting) => {
        if (!isAIConfigured()) {
            alert('API Key não configurada');
            return;
        }

        const confirmRetry = window.confirm(`Reanalisar "${painting.title}" com IA?`);
        if (!confirmRetry) return;

        setAnalyzing(true);
        try {
            console.log('Starting manual AI analysis for:', painting.image_url);
            const analysis = await analyzePainting(painting.image_url);

            if (analysis) {
                const { error } = await supabase
                    .from('paintings')
                    .update({
                        ai_description: analysis.description,
                        ai_keywords: analysis.keywords,
                        ai_mood: analysis.mood,
                        ai_colors: analysis.colors,
                    })
                    .eq('id', painting.id);

                if (error) throw error;

                // Update local state
                setPaintings(paintings.map(p =>
                    p.id === painting.id ? {
                        ...p,
                        ai_description: analysis.description,
                        ai_keywords: analysis.keywords,
                        ai_mood: analysis.mood,
                        ai_colors: analysis.colors
                    } : p
                ));
                alert('Análise IA concluída com sucesso!');
            } else {
                throw new Error('Falha na resposta da IA');
            }
        } catch (err) {
            console.error('AI Retry Error:', err);
            alert('Erro na análise IA: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
        } finally {
            setAnalyzing(false);
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 w-full max-w-md">
                    <h1 className="font-heading text-3xl text-center mb-8">Administração</h1>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-muted)]">
                                Palavra-passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                placeholder="Introduza a palavra-passe"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <button type="submit" className="btn-primary w-full cursor-pointer">
                            Entrar
                        </button>
                    </form>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 mt-6 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar à galeria
                    </Link>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-semibold">Gerir Pinturas</h1>
                        <p className="text-[var(--color-text-muted)]">{paintings.length} pinturas na galeria</p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/" className="btn-secondary flex items-center gap-2 cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Ver Galeria
                        </Link>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="btn-primary flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Pintura
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
                        {error}
                    </div>
                )}

                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass-card p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading text-2xl">Nova Pintura</h2>
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="p-2 hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Título *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none"
                                        placeholder="Nome da pintura"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Ano</label>
                                        <input
                                            type="number"
                                            value={formData.year || ''}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Dimensões</label>
                                        <input
                                            type="text"
                                            value={formData.dimensions || ''}
                                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none"
                                            placeholder="30x40 cm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Categoria</label>
                                        <select
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Técnica</label>
                                        <input
                                            type="text"
                                            value={formData.technique || ''}
                                            onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Descrição</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
                                        placeholder="Breve descrição da obra..."
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_sold}
                                            onChange={(e) => setFormData({ ...formData, is_sold: e.target.checked })}
                                            className="w-4 h-4 rounded cursor-pointer"
                                        />
                                        <span className="text-sm">Vendido</span>
                                    </label>
                                </div>

                                {/* Upload Button */}
                                <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors ${uploading || analyzing ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--glass-border)] hover:border-[var(--color-primary)] cursor-pointer'}`}>
                                    {analyzing ? (
                                        <>
                                            <Sparkles className="w-8 h-8 text-[var(--color-primary)] mb-2 animate-pulse" />
                                            <span className="text-sm text-[var(--color-primary)] font-medium">
                                                A analisar com IA...
                                            </span>
                                        </>
                                    ) : uploading ? (
                                        <>
                                            <Upload className="w-8 h-8 text-[var(--color-primary)] mb-2 animate-bounce" />
                                            <span className="text-sm text-[var(--color-primary)]">
                                                A carregar...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                Clique para selecionar imagem
                                            </span>
                                            {isAIConfigured() && (
                                                <span className="text-xs text-[var(--color-primary)] mt-1 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    Análise IA (Qwen3-VL)
                                                </span>
                                            )}
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileUpload}
                                        disabled={uploading || analyzing || !formData.title.trim()}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass-card p-6 w-full max-w-md text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="font-heading text-2xl mb-2">Eliminar Pintura</h2>
                            <p className="text-[var(--color-text-muted)] mb-6">
                                Tem a certeza que quer eliminar <strong>&quot;{deleteTarget.title}&quot;</strong>?
                                Esta ação não pode ser revertida.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="btn-secondary cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors cursor-pointer"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Paintings List */}
                {loading ? (
                    <div className="grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-32 rounded-xl" />
                        ))}
                    </div>
                ) : paintings.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <p className="text-[var(--color-text-muted)] text-lg mb-4">
                            Ainda não há pinturas na galeria.
                        </p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="btn-primary cursor-pointer"
                        >
                            Adicionar Primeira Pintura
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paintings.map((painting) => (
                            <div key={painting.id} className="glass-card p-4 flex gap-4">
                                <div className="flex items-center text-[var(--color-text-muted)]">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image
                                        src={painting.image_url}
                                        alt={painting.title}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {editingId === painting.id ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={painting.title}
                                                onChange={(e) => {
                                                    setPaintings(paintings.map(p =>
                                                        p.id === painting.id ? { ...p, title: e.target.value } : p
                                                    ));
                                                }}
                                                className="w-full px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <select
                                                    value={painting.category || ''}
                                                    onChange={(e) => {
                                                        setPaintings(paintings.map(p =>
                                                            p.id === painting.id ? { ...p, category: e.target.value } : p
                                                        ));
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm cursor-pointer"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={painting.is_sold}
                                                        onChange={(e) => {
                                                            setPaintings(paintings.map(p =>
                                                                p.id === painting.id ? { ...p, is_sold: e.target.checked } : p
                                                            ));
                                                        }}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    Vendido
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-medium truncate">{painting.title}</h3>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                {painting.year && `${painting.year}`}
                                                {painting.category && ` • ${painting.category}`}
                                                {painting.is_sold && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded-full">
                                                        Vendido
                                                    </span>
                                                )}
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {editingId === painting.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(painting)}
                                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"
                                                title="Guardar"
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    fetchPaintings();
                                                }}
                                                className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer"
                                                title="Cancelar"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setEditingId(painting.id)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer"
                                                title="Editar"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(painting)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            {/* Retry AI Button */}
                                            {isAIConfigured() && (!painting.ai_description || !painting.ai_keywords) && (
                                                <button
                                                    onClick={() => handleRetryAI(painting)}
                                                    className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors cursor-pointer"
                                                    title="Gerar Análise IA"
                                                    disabled={analyzing}
                                                >
                                                    <Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
