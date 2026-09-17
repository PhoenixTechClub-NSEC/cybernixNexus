/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { useRouter } from 'next/navigation';
import { Editorial, PlatformName, EditorialComment } from '@/types';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import {
  BookOpen,
  ThumbsUp,
  MessageSquare,
  Search,
  Code2,
  ChevronRight,
  Send,
  X,
  Plus,
  Sparkles,
  Tag,
  Loader2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

export default function EditorialsPage() {
  const { user: CURRENT_USER } = useUser();
  const router = useRouter();
  const [editorialsList, setEditorialsList] = useState<Editorial[]>([]);
  const [userEditorials, setUserEditorials] = useState<Editorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'ALL'>('ALL');
  const [selectedDiff, setSelectedDiff] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyEditorials, setShowMyEditorials] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Lock background scroll when modal is open & listen for Escape key
  useEffect(() => {
    if (isPublishModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      (window as any).lenis?.stop();
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      (window as any).lenis?.start();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPublishModalOpen && !isSubmitting) {
        setIsPublishModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      (window as any).lenis?.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPublishModalOpen, isSubmitting]);

  // Publish Form Fields
  const [postTitle, setPostTitle] = useState('');
  const [postProblemName, setPostProblemName] = useState('');
  const [postPlatform, setPostPlatform] = useState<PlatformName>('Codeforces');
  const [postDifficulty, setPostDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [postTags, setPostTags] = useState<string[]>(['Dynamic Programming', 'Algorithms']);
  const [postTagInput, setPostTagInput] = useState('');
  const [postSummary, setPostSummary] = useState('');
  const [postCodeSnippet, setPostCodeSnippet] = useState(
    '// Solution O(N log N)\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n  // Write your approach here\n}'
  );
  const [postContent, setPostContent] = useState('');
  const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write');

  const publishPlatforms: PlatformName[] = [
    'Codeforces',
    'LeetCode',
    'CodeChef',
    'HackerRank',
  ];

  const suggestedTags = [
    'Dynamic Programming',
    'Graphs',
    'Trees',
    'Greedy',
    'Two Pointers',
    'Math',
    'Bit Manipulation',
    'Binary Search',
    'DFS/BFS',
    'Number Theory',
  ];

  const platforms: (PlatformName | 'ALL')[] = [
    'ALL',
    'Codeforces',
    'LeetCode',
    'CodeChef',
  ];

  const handleToggleTag = (tag: string) => {
    if (postTags.includes(tag)) {
      setPostTags(postTags.filter((t) => t !== tag));
    } else {
      setPostTags([...postTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostTags(postTags.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && postTagInput.trim()) {
      e.preventDefault();
      const newTag = postTagInput.trim().replace(/^#+/, '');
      if (newTag && !postTags.includes(newTag)) {
        setPostTags([...postTags, newTag]);
      }
      setPostTagInput('');
    }
  };

  // Fetch editorials from API on mount
  useEffect(() => {
    const fetchEditorials = async () => {
      try {
        setIsLoading(true);
        const [resAll, resMy] = await Promise.all([
          fetch('/api/editorials'),
          fetch('/api/editorials/my-editorials'),
        ]);

        if (resAll.ok) {
          const data = await resAll.json();
          if (data.success && Array.isArray(data.editorials)) {
            setEditorialsList(data.editorials);
          }
        }

        if (resMy.ok) {
          const data = await resMy.json();
          if (data.success && Array.isArray(data.editorials)) {
            setUserEditorials(data.editorials);
          }
        }
      } catch (error) {
        console.error('Failed to fetch editorials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEditorials();
  }, []);

  const handleCreateEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!postTitle.trim()) {
      setFormError('Please provide an editorial title.');
      return;
    }
    if (!postContent.trim()) {
      setFormError('Please provide your editorial explanation and approach.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/editorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          problemUrl: postProblemName.trim() || 'https://codeforces.com',
          platform: postPlatform,
          difficulty: postDifficulty,
          tags: postTags.length > 0 ? postTags : ['Algorithms'],
          summary: postSummary.trim() || postContent.slice(0, 150) + (postContent.length > 150 ? '...' : ''),
          content: postContent.trim(),
          codeSnippet: postCodeSnippet.trim() || '// Solution approach',
          codeLanguage: 'cpp',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.editorial) {
        const ed = data.editorial;
        const score = ed.author.stats?.totalScore || CURRENT_USER.cpScore || 0;
        const level = Math.max(1, Math.min(100, Math.floor(score / 500)));
        const tier = score > 30000 ? 'Phoenix' : score > 10000 ? 'Flame' : score > 2000 ? 'Ember' : 'Spark';

        const formattedNew: Editorial = {
          id: ed.id,
          authorId: ed.authorId,
          title: ed.title,
          problemUrl: ed.problemUrl || '',
          platform: ed.platform,
          difficulty: ed.difficulty,
          authorName: ed.author.name,
          authorAvatar: ed.author.user?.image || CURRENT_USER.avatar,
          authorDept: ed.author.department,
          authorLevel: level,
          authorTier: tier,
          tags: ed.tags,
          summary: ed.summary,
          content: ed.content,
          codeSnippet: ed.codeSnippet,
          codeLanguage: ed.codeLanguage,
          likesCount: 0,
          commentsCount: 0,
          comments: [],
          publishedAt: 'Just now',
        };

        setEditorialsList([formattedNew, ...editorialsList]);
        setIsPublishModalOpen(false);

        // Reset Form
        setPostTitle('');
        setPostProblemName('');
        setPostSummary('');
        setPostContent('');
        setPostCodeSnippet(
          '// Solution O(N log N)\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n  // Write your approach here\n}'
        );
        setPostTags(['Dynamic Programming', 'Algorithms']);
        setPreviewTab('write');

        // Show Success Toast
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } else {
        setFormError(data.error || 'Failed to publish editorial. Please check your fields and try again.');
      }
    } catch (err: any) {
      console.error('Error creating editorial:', err);
      setFormError(err.message || 'An unexpected network error occurred while publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEditorials = useMemo(() => editorialsList.filter((item) => {
    const matchesPlatform = selectedPlatform === 'ALL' || item.platform === selectedPlatform;
    const matchesDiff = selectedDiff === 'ALL' || item.difficulty === selectedDiff;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlatform && matchesDiff && matchesSearch;
  }), [editorialsList, selectedPlatform, selectedDiff, searchQuery]);

  const handleDeleteEditorial = async (editorialId: string) => {
    if (!confirm('Are you sure you want to delete this editorial? This action cannot be undone.')) {
      return;
    }

    setDeletingId(editorialId);
    try {
      const res = await fetch(`/api/editorials/${editorialId}/delete`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUserEditorials(userEditorials.filter((ed) => ed.id !== editorialId));
        setEditorialsList(editorialsList.filter((ed) => ed.id !== editorialId));
      } else {
        alert(data.message || 'Unable to delete your editorial. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting editorial:', error);
      alert('Connection lost. Please check your internet and try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditEditorial = (editorialId: string) => {
    router.push(`/editorials/${editorialId}/edit`);
  };

  if (isLoading) {
    return <CapybaraLoader />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-golden-sand/20 text-tomato-jam border border-onyx/12 text-xs font-extrabold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-tomato-jam" />
            Peer-to-Peer Learning Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-onyx tracking-tight">
            Solution & Editorial Hub
          </h1>
          <p className="text-sm text-onyx/70 mt-1 max-w-2xl">
            A dedicated knowledge base where top coders publish step-by-step problem solutions and tutorials to help junior students learn algorithms faster.
          </p>
        </div>

        <button
          onClick={() => router.push('/editorials/publish')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#D43D42] text-white font-bold text-sm shadow-md shadow-tomato-jam/25 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Code2 className="w-4 h-4" />
          <span>Publish New Editorial</span>
        </button>
      </div>

      {/* My Editorials Tab Toggle */}
      {userEditorials.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowMyEditorials(false);
              setSearchQuery('');
              setSelectedPlatform('ALL');
              setSelectedDiff('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              !showMyEditorials
                ? 'bg-onyx text-white shadow-md shadow-onyx/20'
                : 'bg-golden-sand/20 text-onyx hover:bg-golden-sand/40'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            All Editorials
          </button>
          <button
            onClick={() => setShowMyEditorials(true)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              showMyEditorials
                ? 'bg-onyx text-white shadow-md shadow-onyx/20'
                : 'bg-golden-sand/20 text-onyx hover:bg-golden-sand/40'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            My Editorials ({userEditorials.length})
          </button>
        </div>
      )}

      {/* Filter Bar - Only show for All Editorials */}
      {!showMyEditorials && (
        <div className="rounded-2xl bg-white border border-onyx/12 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Platforms */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {platforms.map((platform) => {
            const isActive = selectedPlatform === platform;
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-onyx text-white shadow-xs'
                    : 'bg-golden-sand/20 text-onyx hover:bg-golden-sand/40'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>

        {/* Difficulty & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-golden-sand/12 rounded-lg p-1 text-xs font-semibold border border-onyx/12">
            {(['ALL', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDiff(diff)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  selectedDiff === diff ? 'bg-white text-tomato-jam shadow-2xs' : 'text-onyx/70'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-onyx/70" />
            <input
              type="text"
              placeholder="Search topic or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-onyx/12 bg-white text-onyx focus:outline-none focus:border-tomato-jam"
            />
          </div>
        </div>
      </div>
      )}

      {/* Editorials List with deferred off-screen rendering */}
      <div className="grid grid-cols-1 gap-6 content-visibility-auto">
        {showMyEditorials ? (
          userEditorials.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-onyx/12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-golden-sand/20 text-tomato-jam flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-onyx">You haven't published any editorials yet</h3>
                <p className="text-sm text-onyx/70 mt-1">
                  Share your problem-solving insights with the NSEC community today.
                </p>
              </div>
              <button
                onClick={() => router.push('/editorials/publish')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#D43D42] text-white font-bold text-xs shadow-md shadow-tomato-jam/25 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Your First Editorial</span>
              </button>
            </div>
          ) : (
            userEditorials.map((editorial) => (
              <div
                key={editorial.id}
                className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm hover:border-tomato-jam/50 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    {/* Top Bar: Platform, Diff */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-golden-sand/20 text-onyx text-xs font-bold">
                        {editorial.platform}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          editorial.difficulty === 'Easy'
                            ? 'bg-golden-sand/20 text-onyx/70'
                            : editorial.difficulty === 'Medium'
                            ? 'bg-golden-sand/20 text-onyx'
                            : 'bg-golden-sand/20 text-tomato-jam'
                        }`}
                      >
                        {editorial.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-black text-onyx group-hover:text-tomato-jam transition-colors cursor-pointer" onClick={() => router.push(`/editorials/${editorial.id}`)}>
                      {editorial.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-onyx/70 mt-2 leading-relaxed">
                      {editorial.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {editorial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-golden-sand/15 text-onyx border border-onyx/12"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-2 sm:ml-4 shrink-0">
                    <button
                      onClick={() => handleEditEditorial(editorial.id)}
                      className="p-2.5 rounded-lg hover:bg-golden-sand/20 text-onyx/70 hover:text-onyx transition-colors cursor-pointer"
                      title="Edit Editorial"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEditorial(editorial.id)}
                      disabled={deletingId === editorial.id}
                      className="p-2.5 rounded-lg hover:bg-rose-50 text-onyx/70 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Editorial"
                    >
                      {deletingId === editorial.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-onyx/12 flex items-center justify-between text-xs text-onyx/70">
                  <div className="flex items-center gap-4">
                    <span>{editorial.likesCount} likes</span>
                    <span>{editorial.commentsCount} comments</span>
                  </div>
                  <button
                    onClick={() => router.push(`/editorials/${editorial.id}`)}
                    className="inline-flex items-center gap-1 text-tomato-jam font-bold hover:underline"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredEditorials.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-onyx/12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-golden-sand/20 text-tomato-jam flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-onyx">No editorials found matching your filters</h3>
                <p className="text-sm text-onyx/70 mt-1">
                  Be the first coder at NSEC to publish a solution for this topic or algorithm!
                </p>
              </div>
              <button
                onClick={() => router.push('/editorials/publish')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#D43D42] text-white font-bold text-xs shadow-md shadow-tomato-jam/25 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Solution</span>
              </button>
            </div>
          ) : (
            filteredEditorials.map((editorial) => {
              return (
                <div
                  key={editorial.id}
                  onClick={() => router.push(`/editorials/${editorial.id}`)}
                  className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm hover:border-tomato-jam/50 transition-all cursor-pointer group flex flex-col justify-between gpu-accelerated"
                >
                  <div>
                    {/* Top Bar: Platform, Diff, Author */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-golden-sand/20 text-onyx text-xs font-bold">
                          {editorial.platform}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            editorial.difficulty === 'Easy'
                              ? 'bg-golden-sand/20 text-onyx/70'
                              : editorial.difficulty === 'Medium'
                              ? 'bg-golden-sand/20 text-onyx'
                              : 'bg-golden-sand/20 text-tomato-jam'
                          }`}
                        >
                          {editorial.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <img
                          src={editorial.authorAvatar}
                          alt={editorial.authorName}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-tomato-jam/30"
                          loading="lazy"
                        />
                        <span className="text-xs font-bold text-onyx">
                          {editorial.authorName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-golden-sand/20 text-tomato-jam border border-onyx/12">
                          {editorial.authorDept}
                        </span>
                        <LevelBadge
                          level={editorial.authorLevel}
                          tier={editorial.authorTier}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-xl sm:text-2xl font-black text-onyx group-hover:text-tomato-jam transition-colors">
                      {editorial.title}
                    </h3>
                    <p className="text-sm text-onyx/70 mt-2 leading-relaxed">
                      {editorial.summary}
                    </p>

                    {/* Code snippet preview */}
                    <div className="mt-4 rounded-xl bg-onyx text-golden-sand p-4 font-mono text-xs overflow-x-auto border border-onyx/12">
                      <pre>{editorial.codeSnippet}</pre>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {editorial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-golden-sand/15 text-onyx border border-onyx/12"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer bar: Comments, Read Tutorial CTA */}
                  <div className="mt-6 pt-4 border-t border-onyx/12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-onyx/70">
                        <MessageSquare className="w-4 h-4 text-onyx/70" />
                        <span>{editorial.comments.length} comments</span>
                      </div>

                      <span className="text-xs text-onyx/70">{editorial.publishedAt}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-tomato-jam group-hover:underline mr-[2px]">
                      Read Complete Tutorial <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Success Celebration Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-onyx text-white border border-golden-sand/40 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-golden-sand/20 flex items-center justify-center text-golden-sand shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">Editorial Published Successfully!</p>
            <p className="text-xs text-golden-sand">
              Your tutorial is now live for all NSEC peers to read & discuss.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Publish New Editorial Modal */}
      {isPublishModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-editorial-title"
          onClick={() => !isSubmitting && setIsPublishModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-onyx/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90dvh] sm:max-h-[95dvh] flex flex-col rounded-2xl sm:rounded-3xl bg-white border border-onyx/12 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            data-lenis-prevent="true"
          >
            {/* 1. STICKY MODAL HEADER - With proper background and shadow */}
            <div className="sticky top-0 z-20 shrink-0 px-6 sm:px-8 py-5 border-b border-onyx/10 bg-white shadow-md">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-golden-sand/40 text-tomato-jam border border-onyx/10 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-tomato-jam" />
                  Peer Knowledge Sharing
                </div>
                <h2 id="publish-editorial-title" className="text-xl sm:text-2xl font-black text-onyx tracking-tight">
                  Publish New Editorial
                </h2>
                <p className="text-xs text-onyx/70 mt-0.5">
                  Share problem intuition, approach breakdown, and optimal code with NSEC peers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsPublishModalOpen(false)}
                disabled={isSubmitting}
                className="absolute top-5 right-5 p-2 rounded-xl bg-onyx/5 hover:bg-onyx/10 text-onyx/70 hover:text-onyx transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE FORM CONTENT - Universal scroller */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form
                id="publish-editorial-form"
                onSubmit={handleCreateEditorial}
                className="px-6 sm:px-8 py-6"
                data-lenis-prevent="true"
              >
              {/* Error Alert if any */}
              {formError && (
                <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="flex-1">{formError}</span>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="text-rose-500 hover:text-rose-700 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bento Grid Layout */}
              <div className="space-y-6">
                {/* Author Card - Full Width */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={CURRENT_USER.avatar}
                        alt={CURRENT_USER.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-tomato-jam/30"
                        loading="lazy"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-onyx">{CURRENT_USER.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-golden-sand/30 text-tomato-jam">
                            {CURRENT_USER.department}
                          </span>
                        </div>
                        <p className="text-xs text-onyx/70">
                          Level {CURRENT_USER.level} • Verified Mentor
                        </p>
                      </div>
                    </div>
                    <LevelBadge
                      level={CURRENT_USER.level}
                      tier={CURRENT_USER.tier}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Title Card */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                    Editorial Title <span className="text-tomato-jam">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => {
                      setPostTitle(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder='e.g., "Optimal O(N log N) Tree DP Solution"'
                    className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
                  />
                </div>

                {/* Problem Name Card */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                    Problem Name or URL
                  </label>
                  <input
                    type="text"
                    value={postProblemName}
                    onChange={(e) => setPostProblemName(e.target.value)}
                    placeholder='e.g., "CF 1890D - Trees and Segments"'
                    className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
                  />
                </div>

                {/* Platform & Difficulty Cards - 2 Col Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Platform Card */}
                  <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                      Platform <span className="text-tomato-jam">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {publishPlatforms.map((plat) => {
                        const isSelected = postPlatform === plat;
                        return (
                          <button
                            type="button"
                            key={plat}
                            onClick={() => setPostPlatform(plat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-onyx text-white shadow-sm'
                                : 'bg-golden-sand/15 text-onyx hover:bg-golden-sand/30 border border-onyx/12'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty Card */}
                  <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                      Difficulty Level <span className="text-tomato-jam">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                        const isSelected = postDifficulty === diff;
                        const activeStyle =
                          diff === 'Easy'
                            ? 'bg-pine-teal text-white'
                            : diff === 'Medium'
                            ? 'bg-golden-sand text-onyx'
                            : 'bg-tomato-jam text-white';
                        return (
                          <button
                            type="button"
                            key={diff}
                            onClick={() => setPostDifficulty(diff)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? `${activeStyle} shadow-sm border-transparent`
                                : 'bg-onyx/5 text-onyx/70 hover:bg-onyx/10 border-onyx/12'
                            }`}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tags Card */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                    Algorithm Topics & Tags
                  </label>

                  {/* Active Tags */}
                  {postTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-golden-sand/10 border border-golden-sand/30">
                      {postTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-tomato-jam text-white shadow-xs"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:bg-black/20 rounded p-0.5 transition-colors cursor-pointer"
                            title={`Remove #${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {suggestedTags
                      .filter((t) => !postTags.includes(t))
                      .slice(0, 6)
                      .map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => handleToggleTag(tag)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-golden-sand/20 text-onyx/80 hover:bg-golden-sand/40 border border-onyx/12 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          {tag}
                        </button>
                      ))}
                  </div>

                  {/* Custom tag input */}
                  <input
                    type="text"
                    value={postTagInput}
                    onChange={(e) => setPostTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    placeholder="Type tag and press Enter..."
                    className="w-full px-4 py-2.5 rounded-lg border border-onyx/12 bg-golden-sand/8 text-xs font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
                  />
                </div>

                {/* Summary Card */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3">
                    Summary / TL;DR <span className="text-tomato-jam">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postSummary}
                    onChange={(e) => {
                      setPostSummary(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder='e.g., "Greedy line sweep + Segment Tree query in O(N log N) time."'
                    className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
                  />
                </div>

                {/* Content & Code Snippet Card */}
                <div className="rounded-3xl bg-white border border-pine-teal/25 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70">
                      Editorial Explanation & Code <span className="text-tomato-jam">*</span>
                    </label>
                    <div className="flex items-center gap-1 bg-onyx/5 p-1 rounded-lg border border-onyx/10">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('write')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewTab === 'write'
                            ? 'bg-onyx text-white shadow-xs'
                            : 'text-onyx/70 hover:text-onyx'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('preview')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          previewTab === 'preview'
                            ? 'bg-onyx text-white shadow-xs'
                            : 'text-onyx/70 hover:text-onyx'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Write Editor */}
                  {previewTab === 'write' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-onyx/70 mb-2 block">Explanation & Intuition</label>
                        <textarea
                          rows={5}
                          required
                          value={postContent}
                          onChange={(e) => {
                            setPostContent(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          placeholder={`### Intuition & Observation\nExplain why the approach works...\n\n### Step-by-Step Algorithm\n1. Sort array\n2. Use two pointers...`}
                          className="w-full px-4 py-3 rounded-lg border border-onyx/12 bg-golden-sand/8 text-sm font-mono text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-onyx/70 mb-2 block">Key Solution Code</label>
                        <textarea
                          rows={5}
                          value={postCodeSnippet}
                          onChange={(e) => setPostCodeSnippet(e.target.value)}
                          placeholder='// Optimal solution code here'
                          className="w-full px-4 py-3 rounded-lg border border-onyx/12 bg-onyx text-golden-sand text-xs font-mono focus:outline-none focus:ring-2 focus:ring-golden-sand/30 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {previewTab === 'preview' && (
                    <div className="space-y-3 p-4 rounded-lg bg-onyx/5 border border-onyx/12">
                      <div className="text-xs font-bold uppercase tracking-wider text-tomato-jam flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Live Preview
                      </div>

                      <div className="text-xs text-onyx/80 bg-white p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                        {postContent || 'Your explanation will appear here...'}
                      </div>

                      <div className="rounded-lg bg-onyx p-3 text-golden-sand font-mono text-xs overflow-x-auto">
                        <pre>{postCodeSnippet || '// Your code will appear here'}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button - Inside Form */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsPublishModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl border border-onyx/12 text-onyx font-bold text-sm hover:bg-onyx/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tomato-jam hover:bg-[#D43D42] active:bg-[#C83339] text-white font-extrabold text-sm shadow-lg shadow-tomato-jam/30 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publish Editorial
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
