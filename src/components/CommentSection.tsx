'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types/social';
import { User, MessageCircle, Send, Loader2, X } from 'lucide-react';

interface CommentSectionProps {
    paintingId: string;
}

export default function CommentSection({ paintingId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchComments();
    }, [paintingId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('painting_id', paintingId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data as Comment[] || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([
                    {
                        painting_id: paintingId,
                        user_name: name,
                        content: content
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setComments([data as Comment, ...comments]);
                setContent('');
                setIsFormOpen(false); // Close modal
                // Keep name for convenience
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Erro ao enviar comentário via Supabase.');
        } finally {
            setSubmitting(false);
        }
    };

    function getTimeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'agora mesmo';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min atrás`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} h atrás`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} dias atrás`;
        return date.toLocaleDateString('pt-PT');
    }

    return (
        <div className="w-full mt-8 border-t border-[var(--color-border)] pt-8">
            {/* Header & Trigger */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[var(--color-primary)]" />
                    Comentários ({comments.length})
                </h3>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2 cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4" />
                    Deixar Comentário
                </button>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}>
                    <div className="glass-card p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-[var(--glass-bg)] rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="font-heading text-xl mb-4">Deixar Comentário</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Teu Nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Como te chamas?"
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] outline-none transition-colors"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Mensagem</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="O que achaste desta obra?"
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        A enviar...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Publicar Comentário
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-[var(--color-text-muted)] py-8 glass rounded-xl">
                    Sê o primeiro a comentar esta obra!
                </p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold shadow-lg">
                                    {comment.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-[var(--color-text)]">{comment.user_name}</h4>
                                        <span className="text-xs text-[var(--color-text-muted)]">{getTimeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-3">{comment.content}</p>

                                    {/* Admin Reply Display */}
                                    {comment.reply && (
                                        <div className="ml-4 pl-4 border-l-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-3 rounded-r-lg">
                                            <p className="text-xs text-[var(--color-primary)] font-bold mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Resposta do Ivo:
                                            </p>
                                            <p className="text-sm text-[var(--color-text)] italic">"{comment.reply}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
