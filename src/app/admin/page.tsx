'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, PAINTINGS_BUCKET } from '@/lib/supabase';
import { analyzePainting, isAIConfigured } from '@/lib/aiml';
import { Upload, Trash2, Edit, X, Save, Plus, ArrowLeft, GripVertical, Sparkles, FileText, MessageSquare, Image as ImageIcon, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Painting, PaintingFormData } from '@/types/painting';
import type { SiteContent, Comment } from '@/types/social';
import { CATEGORIES } from '@/types/painting';

const ADMIN_PASSWORD = 'aguarela';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'paintings' | 'content' | 'comments'>('paintings');

    // Painting State
    const [paintings, setPaintings] = useState<Painting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Painting | null>(null);

    // Content State
    const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [editingContentSlug, setEditingContentSlug] = useState<string | null>(null);
    const [contentForm, setContentForm] = useState<string>('');

    // Comments State
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    // Batch Upload State
    const [batchMode, setBatchMode] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentFile: '' });

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
            .select('*, gallery_images:painting_gallery(*)')
            .order('display_order', { ascending: true });

        if (data) {
            // Sort gallery images by created_at inside each painting
            const sortedData = data.map((p: any) => ({
                ...p,
                gallery_images: p.gallery_images?.sort((a: any, b: any) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ) || []
            }));
            setPaintings(sortedData);
        }
        setLoading(false);
    }, []);

    const fetchContent = useCallback(async () => {
        setContentLoading(true);
        const { data } = await supabase
            .from('site_content')
            .select('*')
            .order('slug');

        if (data) setSiteContent(data);
        setContentLoading(false);
    }, []);

    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        const { data } = await supabase
            .from('comments')
            .select(`
                *,
                paintings (title, image_url)
            `)
            .order('created_at', { ascending: false });

        if (data) setComments(data as any); // Type assertion needed due to join
        setCommentsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPaintings();
            fetchContent();
            fetchComments();
        }
    }, [isAuthenticated, fetchPaintings, fetchContent]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Palavra-passe incorreta');
        }
    };

    // --- Content Handlers ---
    const handleEditContent = (item: SiteContent) => {
        setEditingContentSlug(item.slug);
        setContentForm(item.content);
    };

    const handleSaveContent = async (slug: string) => {
        try {
            const { error } = await supabase
                .from('site_content')
                .upsert({
                    slug,
                    content: contentForm,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            setSiteContent(siteContent.map(item =>
                item.slug === slug ? { ...item, content: contentForm } : item
            ));
            setEditingContentSlug(null);
            alert('Conteúdo atualizado com sucesso!');
        } catch (err) {
            console.error('Error saving content:', err);
            alert('Erro ao guardar conteúdo.');
        }
    };

    // --- Comment Handlers ---
    const handleDeleteComment = async (id: string) => {
        if (!confirm('Tem a certeza que quer eliminar este comentário?')) return;
        try {
            const { error } = await supabase.from('comments').delete().eq('id', id);
            if (error) throw error;
            setComments(comments.filter(c => c.id !== id));
        } catch (err) {
            alert('Erro ao eliminar comentário');
            console.error(err);
        }
    };

    const handleReplyComment = async (id: string) => {
        const reply = replyText[id];
        if (!reply) return;

        try {
            const { error } = await supabase
                .from('comments')
                .update({ reply })
                .eq('id', id);

            if (error) throw error;

            setComments(comments.map(c => c.id === id ? { ...c, reply } : c));
            alert('Resposta enviada!');
        } catch (err) {
            alert('Erro ao enviar resposta');
            console.error(err);
        }
    };

    // --- Painting Handlers (Keep existing) ---
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

            // AI Analysis
            let aiData = {};
            if (isAIConfigured()) {
                setAnalyzing(true);
                try {
                    const analysis = await analyzePainting(publicUrl);
                    if (analysis) {
                        aiData = {
                            ai_description: analysis.description,
                            ai_keywords: analysis.keywords,
                            ai_mood: analysis.mood,
                            ai_colors: analysis.colors,
                        };
                    }
                } catch (aiError) {
                    console.error('AI analysis failed:', aiError);
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

    // NEW: Batch Upload Handler
    const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setBatchMode(true);
        setUploading(true);
        setError('');
        setBatchProgress({ current: 0, total: files.length, currentFile: '' });

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                const autoTitle = baseName.charAt(0).toUpperCase() + baseName.slice(1);

                setBatchProgress({ current: i + 1, total: files.length, currentFile: autoTitle });

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from(PAINTINGS_BUCKET)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    console.error(`Upload failed for ${file.name}:`, uploadError);
                    continue; // Skip this file, continue with others
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(PAINTINGS_BUCKET)
                    .getPublicUrl(fileName);

                // AI Analysis
                let aiData = {};
                if (isAIConfigured()) {
                    setAnalyzing(true);
                    try {
                        const analysis = await analyzePainting(publicUrl);
                        if (analysis) {
                            aiData = {
                                ai_description: analysis.description,
                                ai_keywords: analysis.keywords,
                                ai_mood: analysis.mood,
                                ai_colors: analysis.colors,
                            };
                        }
                    } catch (aiError) {
                        console.error('AI analysis failed:', aiError);
                    } finally {
                        setAnalyzing(false);
                    }
                }

                const { error: insertError } = await supabase
                    .from('paintings')
                    .insert({
                        title: autoTitle,
                        description: '',
                        year: new Date().getFullYear(),
                        technique: 'Aguarela sobre papel',
                        category: 'Paisagem',
                        is_sold: false,
                        image_url: publicUrl,
                        display_order: paintings.length + i,
                        ...aiData,
                    });

                if (insertError) {
                    console.error(`Insert failed for ${file.name}:`, insertError);
                }
            }

            setShowUpload(false);
            fetchPaintings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar imagens em lote');
        } finally {
            setUploading(false);
            setAnalyzing(false);
            setBatchMode(false);
            setBatchProgress({ current: 0, total: 0, currentFile: '' });
        }
    };

    const handleDelete = (painting: Painting) => {
        setDeleteTarget(painting);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const urlParts = deleteTarget.image_url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            if (fileName) {
                await supabase.storage.from(PAINTINGS_BUCKET).remove([fileName]);
            }

            await supabase.from('paintings').delete().eq('id', deleteTarget.id);

            setDeleteTarget(null);
            fetchPaintings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao eliminar');
            setDeleteTarget(null);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, paintingId: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

                const { error: insertError } = await supabase
                    .from('painting_gallery')
                    .insert({
                        painting_id: paintingId,
                        image_url: publicUrl,
                    });

                if (insertError) throw insertError;
            }

            // Refresh to show new images
            fetchPaintings();
            alert('Imagens de galeria adicionadas com sucesso!');
        } catch (err) {
            console.error('Gallery upload error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar imagens de galeria');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteGalleryImage = async (imageId: string, imageUrl: string) => {
        if (!confirm('Apagar esta imagem da galeria?')) return;

        try {
            // Optional: Delete from storage
            /*
            const urlParts = imageUrl.split('/');
            const fileName = `gallery/${urlParts[urlParts.length - 1]}`;
            await supabase.storage.from(PAINTINGS_BUCKET).remove([fileName]);
            */

            const { error } = await supabase
                .from('painting_gallery')
                .delete()
                .eq('id', imageId);

            if (error) throw error;
            fetchPaintings();
        } catch (err) {
            console.error('Error deleting gallery image:', err);
            alert('Erro ao apagar imagem');
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

    const handleRetryAI = async (painting: Painting) => {
        if (!isAIConfigured()) {
            alert('API Key não configurada');
            return;
        }
        if (!window.confirm(`Reanalisar "${painting.title}" com IA?`)) return;

        setAnalyzing(true);
        try {
            const analysis = await analyzePainting(painting.image_url);
            if (analysis) {
                await supabase.from('paintings').update({
                    ai_description: analysis.description,
                    ai_keywords: analysis.keywords,
                    ai_mood: analysis.mood,
                    ai_colors: analysis.colors,
                }).eq('id', painting.id);

                setPaintings(paintings.map(p => p.id === painting.id ? {
                    ...p,
                    ai_description: analysis.description,
                    ai_keywords: analysis.keywords,
                    ai_mood: analysis.mood,
                    ai_colors: analysis.colors
                } : p));
                alert('Análise IA concluída!');
            }
        } catch (err) {
            alert('Erro na análise IA: ' + (err instanceof Error ? err.message : 'Erro'));
        } finally {
            setAnalyzing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 w-full max-w-md">
                    <h1 className="font-heading text-3xl text-center mb-8">IvoGarcia Arte - Admin</h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--color-text-muted)]">Palavra-passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" className="btn-primary w-full cursor-pointer">Entrar</button>
                    </form>
                    <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4" /> Voltar à galeria
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 pt-[calc(var(--nav-height)+2rem)]">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-3xl font-semibold">Painel de Administração</h1>
                        <p className="text-[var(--color-text-muted)]">Gerir Pinturas e Conteúdo do Site</p>
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

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[var(--glass-border)]">
                    <button
                        onClick={() => setActiveTab('paintings')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'paintings' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Pinturas
                        </div>
                        {activeTab === 'paintings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'content' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Conteúdo (CMS)
                        </div>
                        {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'comments' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Comentários
                        </div>
                        {activeTab === 'comments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]" />}
                    </button>
                </div>

                {/* TAB CONTENT: PAINTINGS */}
                {activeTab === 'paintings' && (
                    <>
                        {loading ? (
                            <div className="grid gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
                            </div>
                        ) : paintings.length === 0 ? (
                            <div className="text-center py-20 glass-card">
                                <p className="text-[var(--color-text-muted)] text-lg mb-4">Ainda não há pinturas na galeria.</p>
                                <button onClick={() => setShowUpload(true)} className="btn-primary cursor-pointer">Adicionar Primeira Pintura</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paintings.map((painting) => (
                                    <div key={painting.id} className="glass-card p-4 flex gap-4">
                                        <div className="flex items-center text-[var(--color-text-muted)]">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                                            <Image
                                                src={painting.image_url}
                                                alt={painting.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {editingId === painting.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={painting.title}
                                                        onChange={(e) => setPaintings(paintings.map(p => p.id === painting.id ? { ...p, title: e.target.value } : p))}
                                                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={painting.category || ''}
                                                            onChange={(e) => setPaintings(paintings.map(p => p.id === painting.id ? { ...p, category: e.target.value } : p))}
                                                            className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm cursor-pointer"
                                                        >
                                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={painting.is_sold}
                                                                onChange={(e) => setPaintings(paintings.map(p => p.id === painting.id ? { ...p, is_sold: e.target.checked } : p))}
                                                                className="w-4 h-4 cursor-pointer"
                                                            />
                                                            Vendido
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <label className="text-sm text-[var(--color-text-muted)]">Preço (€):</label>
                                                        <input
                                                            type="number"
                                                            value={painting.price || ''}
                                                            onChange={(e) => setPaintings(paintings.map(p => p.id === painting.id ? { ...p, price: e.target.value ? parseFloat(e.target.value) : null } : p))}
                                                            className="w-24 px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </div>

                                                    {/* Gallery Section in Edit Mode */}
                                                    <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium">Galeria de Detalhes</h4>
                                                            <label className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded cursor-pointer hover:bg-[var(--color-primary)]/20 transition-colors flex items-center gap-1">
                                                                <Plus className="w-3 h-3" /> Adicionar Fotos
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleGalleryUpload(e, painting.id)}
                                                                />
                                                            </label>
                                                        </div>

                                                        {painting.gallery_images && painting.gallery_images.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {painting.gallery_images.map(img => (
                                                                    <div key={img.id} className="relative group w-16 h-16 rounded overflow-hidden">
                                                                        <Image
                                                                            src={img.image_url}
                                                                            alt="Detalhe"
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                        <button
                                                                            onClick={() => handleDeleteGalleryImage(img.id, img.image_url)}
                                                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-[var(--color-text-muted)] italic">Sem imagens extra.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="font-medium truncate">{painting.title}</h3>
                                                    <p className="text-sm text-[var(--color-text-muted)]">
                                                        {painting.year && `${painting.year}`}
                                                        {painting.category && ` • ${painting.category}`}
                                                        {painting.is_sold && <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded-full">Vendido</span>}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingId === painting.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(painting)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer" title="Guardar"><Save className="w-5 h-5" /></button>
                                                    <button onClick={() => { setEditingId(null); fetchPaintings(); }} className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer" title="Cancelar"><X className="w-5 h-5" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setEditingId(painting.id)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer" title="Editar"><Edit className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(painting)} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Eliminar"><Trash2 className="w-5 h-5" /></button>
                                                    {isAIConfigured() && (!painting.ai_description || !painting.ai_keywords) && (
                                                        <button onClick={() => handleRetryAI(painting)} className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors cursor-pointer" title="Gerar Análise IA" disabled={analyzing}><Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} /></button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>

                )}

                {/* TAB CONTENT: COMMENTS */}
                {activeTab === 'comments' && (
                    <div className="space-y-6">
                        {commentsLoading ? (
                            <div className="grid gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="glass-card p-12 text-center text-[var(--color-text-muted)]">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Não há comentários para moderar.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="glass-card p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold">
                                                    {comment.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-heading font-semibold">{comment.user_name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                                        <span>{new Date(comment.created_at).toLocaleDateString('pt-PT')}</span>
                                                        <span>•</span>
                                                        {comment.paintings ? (
                                                            <span className="flex items-center gap-1">
                                                                <ImageIcon className="w-3 h-3" />
                                                                Na obra: <span className="text-[var(--color-text)]">{comment.paintings.title}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="italic">Geral</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                title="Eliminar Comentário"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p className="text-[var(--color-text)] mb-4 pl-14 leading-relaxed">
                                            {comment.content}
                                        </p>

                                        {/* Reply Section */}
                                        <div className="pl-14">
                                            {comment.reply ? (
                                                <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)] flex gap-3">
                                                    <div className="w-1 h-full bg-[var(--color-primary)] rounded-full"></div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-[var(--color-primary)] font-bold mb-1 uppercase tracking-wider">A tua resposta</p>
                                                        <p className="text-sm">{comment.reply}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Escrever resposta..."
                                                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                                        value={replyText[comment.id] || ''}
                                                        onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                                    />
                                                    <button
                                                        onClick={() => handleReplyComment(comment.id)}
                                                        disabled={!replyText[comment.id]}
                                                        className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB CONTENT: CMS */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {contentLoading ? (
                            <div className="grid gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                            </div>
                        ) : siteContent.length === 0 ? (
                            <div className="glass-card p-8 text-center text-[var(--color-text-muted)]">
                                Não há conteúdo configurado para edição.
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {siteContent.map((item) => (
                                    <div key={item.slug} className="glass-card p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-heading text-lg font-semibold capitalize">
                                                    {item.slug.replace('-', ' ')}
                                                </h3>
                                                <p className="text-sm text-[var(--color-text-muted)]">
                                                    Slug: <code className="bg-[var(--glass-bg)] px-1 rounded">{item.slug}</code>
                                                </p>
                                            </div>
                                            {editingContentSlug === item.slug ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveContent(item.slug)}
                                                        className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Save className="w-4 h-4" /> Guardar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingContentSlug(null)}
                                                        className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" /> Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditContent(item)}
                                                    className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4" /> Editar
                                                </button>
                                            )}
                                        </div>

                                        {editingContentSlug === item.slug ? (
                                            <textarea
                                                value={contentForm}
                                                onChange={(e) => setContentForm(e.target.value)}
                                                className="w-full h-48 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none resize-y font-sans text-sm leading-relaxed"
                                                placeholder="Introduza o conteúdo..."
                                            />
                                        ) : (
                                            <div className="prose prose-sm max-w-none text-[var(--color-text-muted)] bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)]">
                                                <p className="whitespace-pre-wrap line-clamp-3">{item.content}</p>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-[var(--color-text-muted)] text-right">
                                            Última atualização: {new Date(item.updated_at || '').toLocaleDateString('pt-PT')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Modals (Keep existing Upload/Delete Modals) --- */}
                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="glass-card p-6 w-full max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading text-2xl">Nova Pintura</h2>
                                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-[var(--glass-bg)] rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Título *</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none" placeholder="Nome da pintura" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Ano</label>
                                        <input type="number" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Dimensões</label>
                                        <input type="text" value={formData.dimensions || ''} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none" placeholder="30x40 cm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Categoria</label>
                                        <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer">
                                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Técnica</label>
                                        <input type="text" value={formData.technique || ''} onChange={(e) => setFormData({ ...formData, technique: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Descrição</label>
                                    <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:outline-none resize-none" placeholder="Breve descrição da obra..." />
                                </div>
                                <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors ${uploading || analyzing ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--glass-border)] hover:border-[var(--color-primary)] cursor-pointer'}`}>
                                    {analyzing ? (
                                        <>
                                            <Sparkles className="w-8 h-8 text-[var(--color-primary)] mb-2 animate-pulse" />
                                            <span className="text-sm text-[var(--color-primary)] font-medium">A analisar com IA...</span>
                                        </>
                                    ) : uploading ? (
                                        <>
                                            <Upload className="w-8 h-8 text-[var(--color-primary)] mb-2 animate-bounce" />
                                            <span className="text-sm text-[var(--color-primary)]">A carregar...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
                                            <span className="text-sm text-[var(--color-text-muted)]">Clique para selecionar imagem</span>
                                            {isAIConfigured() && <span className="text-xs text-[var(--color-primary)] mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Análise IA (Qwen3-VL)</span>}
                                        </>
                                    )}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} disabled={uploading || analyzing || !formData.title.trim()} className="hidden" />
                                </label>

                                {/* Batch Upload Option */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[var(--glass-border)]"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">ou</span>
                                    </div>
                                </div>

                                <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${batchMode ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5' : 'border-[var(--glass-border)] hover:border-[var(--color-secondary)] cursor-pointer'}`}>
                                    {batchMode ? (
                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[var(--color-secondary)] font-medium">A processar em lote...</span>
                                                <span className="text-[var(--color-text-muted)]">{batchProgress.current}/{batchProgress.total}</span>
                                            </div>
                                            <div className="w-full bg-[var(--glass-bg)] rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-[var(--color-secondary)] h-full transition-all duration-300"
                                                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-center text-[var(--color-text-muted)] truncate">
                                                {analyzing ? `A analisar: ${batchProgress.currentFile}` : `A carregar: ${batchProgress.currentFile}`}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Plus className="w-6 h-6 text-[var(--color-text-muted)] mb-2" />
                                            <span className="text-sm text-[var(--color-text-muted)] font-medium">Upload em Lote (Múltiplas Fotos)</span>
                                            <span className="text-xs text-[var(--color-text-muted)] mt-1 opacity-70">Títulos e análise IA gerados automaticamente</span>
                                        </>
                                    )}
                                    <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleBatchUpload} disabled={uploading || analyzing} className="hidden" />
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
                            <p className="text-[var(--color-text-muted)] mb-6">Tem a certeza que quer eliminar <strong>&quot;{deleteTarget.title}&quot;</strong>?</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} className="btn-secondary cursor-pointer">Cancelar</button>
                                <button onClick={confirmDelete} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors cursor-pointer">Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
