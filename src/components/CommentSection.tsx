'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types/social';
import { User, MessageCircle, Send, Loader2 } from 'lucide-react';

interface CommentSectionProps {
    paintingId: string;
}

export default function CommentSection({ paintingId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
            <h3 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[var(--color-primary)]" />
                Comentários ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 glass p-6 rounded-xl">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Teu Nome</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como te chamas?"
                        className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none transition-colors"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Mensagem</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="O que achaste desta obra?"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none transition-colors resize-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            A enviar...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Comentar
                        </>
                    )}
                </button>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-[var(--color-text-muted)] py-4">
                    Sê o primeiro a comentar esta obra!
                </p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold">
                                {comment.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold">{comment.user_name}</h4>
                                    <span className="text-xs text-[var(--color-text-muted)]">{getTimeAgo(comment.created_at)}</span>
                                </div>
                                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
