/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/components/providers/UserProvider';
import { Editorial, EditorialComment } from '@/types';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

export default function EditorialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const editorialId = params.id as string;
  const { user: CURRENT_USER } = useUser();

  const [editorial, setEditorial] = useState<Editorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<EditorialComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPublisher = editorial?.authorId === CURRENT_USER?.id;

  // Fetch editorial details
  useEffect(() => {
    const fetchEditorial = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/editorials/${editorialId}`);
        if (!res.ok) {
          throw new Error('Failed to load editorial');
        }
        const data = await res.json();
        if (data.success && data.editorial) {
          setEditorial(data.editorial);
          setLikes(data.editorial.likesCount || 0);
          setIsLiked(data.editorial.isLikedByMe || false);
          setComments(data.editorial.comments || []);
        } else {
          throw new Error('Editorial not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load editorial');
      } finally {
        setIsLoading(false);
      }
    };

    if (editorialId) {
      fetchEditorial();
    }
  }, [editorialId]);

  const handleLike = async () => {
    if (!editorial) return;
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));
    setToastMessage(newIsLiked ? '❤️ Added to your likes' : '💔 Removed from likes');
    setTimeout(() => setToastMessage(null), 2000);

    try {
      const res = await fetch(`/api/editorials/${editorial.id}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLiked(data.isLiked);
          setLikes(data.likesCount);
        }
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setIsLiked(!newIsLiked);
      setLikes((prev) => (newIsLiked ? Math.max(0, prev - 1) : prev + 1));
      setToastMessage(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !editorial) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/editorials/${editorial.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comment) {
          setComments([data.comment, ...comments]);
          setNewCommentText('');
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEdit = () => {
    router.push(`/editorials/${editorialId}/edit`);
  };

  const handleDelete = async () => {
    if (!editorial) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/editorials/${editorialId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId: CURRENT_USER?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setToastMessage('🗑️ Editorial deleted successfully');
          setTimeout(() => {
            router.push('/editorials');
          }, 1500);
        }
      } else {
        setError('Failed to delete editorial');
      }
    } catch (err) {
      console.error('Failed to delete editorial:', err);
      setError('Failed to delete editorial');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return <CapybaraLoader />;
  }

  if (error || !editorial) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-tomato-jam mx-auto" />
          <h1 className="text-2xl font-black text-onyx">Editorial Not Found</h1>
          <p className="text-onyx/70">{error || 'Could not load this editorial.'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1D6] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Header with Go Back and Action Menu */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-onyx/10 text-onyx font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          {isPublisher && (
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="p-2 rounded-lg hover:bg-onyx/10 text-onyx transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showActionMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-onyx/12 rounded-xl shadow-lg z-50">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-onyx hover:bg-golden-sand/10 transition-colors border-b border-onyx/12"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Editorial
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowActionMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-tomato-jam hover:bg-tomato-jam/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Editorial
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Author & Meta Info (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Author Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-4">
              <img
                src={editorial.authorAvatar}
                alt={editorial.authorName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-tomato-jam/30"
                loading="lazy"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-onyx">{editorial.authorName}</h3>
                <p className="text-xs text-onyx/60 font-medium">{editorial.authorDept}</p>
                <div className="pt-2">
                  <LevelBadge
                    level={editorial.authorLevel}
                    tier={editorial.authorTier}
                    size="sm"
                  />
                </div>
              </div>
              <p className="text-xs text-onyx/70 leading-relaxed">Published {editorial.publishedAt}</p>
            </div>

            {/* Metadata Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-3">
              <div>
                <p className="text-xs text-onyx/60 font-bold uppercase tracking-wider mb-1">Platform</p>
                <p className="text-sm font-bold text-onyx">{editorial.platform}</p>
              </div>
              <div className="border-t border-onyx/12 pt-3">
                <p className="text-xs text-onyx/60 font-bold uppercase tracking-wider mb-1">Difficulty</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs ${
                  editorial.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  editorial.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {editorial.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Content (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Title & Header Card */}
            <div className="rounded-3xl bg-gradient-to-r from-onyx to-dark-amethyst text-white p-8 lg:p-10 space-y-4 shadow-xs">
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">{editorial.title}</h1>
              <p className="text-golden-sand/90 text-sm font-medium">
                Code Language: <span className="font-bold text-golden-sand">{editorial.codeLanguage}</span>
              </p>
            </div>

            {/* Summary Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-onyx mb-3">Overview</h2>
              <p className="text-onyx/80 leading-relaxed text-sm">{editorial.summary}</p>
            </div>

            {/* Main Content Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-onyx">Full Explanation</h2>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-line text-onyx leading-relaxed text-sm">
                  {editorial.content}
                </div>
              </div>
            </div>

            {/* Code Snippet Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider text-onyx">
                Optimal Solution
              </h3>
              <div className="rounded-2xl bg-onyx text-golden-sand p-6 font-mono text-xs sm:text-sm overflow-x-auto border border-onyx/12">
                <pre className="overflow-x-auto">{editorial.codeSnippet}</pre>
              </div>
            </div>

            {/* Tags Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-onyx/70 mb-4">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {editorial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-golden-sand/15 text-onyx border border-onyx/12"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement Cards - Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Like Card */}
              <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">Did this help?</p>
                <button
                  onClick={handleLike}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-golden-sand/20 text-tomato-jam border border-onyx/12'
                      : 'bg-golden-sand/10 text-onyx/70 hover:bg-golden-sand/15'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
                </button>
              </div>

              {/* Comments Count Card */}
              <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">Discussion</p>
                <div className="flex items-center gap-2 text-onyx">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-2xl font-black">{comments.length}</span>
                  <span className="text-xs font-medium">Comment{comments.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Comments Section Card */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Discussion & Doubts
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a doubt or share your approach..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam placeholder:text-onyx/40"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="px-5 py-3 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-4 border-t border-onyx/12">
                {comments.length === 0 ? (
                  <p className="text-center py-8 text-onyx/60 text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl bg-golden-sand/8 border border-onyx/12 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-tomato-jam/30"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-onyx">
                              {comment.authorName}
                            </span>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-golden-sand/20 text-tomato-jam">
                              {comment.authorDept}
                            </span>
                          </div>
                          <span className="text-xs text-onyx/60">{comment.createdAt}</span>
                        </div>
                      </div>
                      <p className="text-xs text-onyx leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-onyx">Delete Editorial?</h2>
              <p className="text-onyx/70">
                This action cannot be undone. All comments on this editorial will also be deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-onyx/12 text-onyx font-bold text-sm hover:bg-onyx/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
          <span className="text-lg">{toastMessage.includes('❤️') ? '❤️' : toastMessage.includes('🗑️') ? '🗑️' : '✨'}</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
