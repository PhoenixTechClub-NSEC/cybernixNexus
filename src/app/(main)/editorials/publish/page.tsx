/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/UserProvider';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Edit3,
  Eye,
  Sparkles,
} from 'lucide-react';

const publishPlatforms = ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank'];
const suggestedTags = [
  'Dynamic Programming',
  'Graph Theory',
  'Binary Search',
  'Greedy',
  'Two Pointers',
  'Sliding Window',
  'Recursion',
  'BIT',
];

export default function PublishEditorialPage() {
  const router = useRouter();
  const { user: CURRENT_USER } = useUser();

  const [postTitle, setPostTitle] = useState('');
  const [postProblemName, setPostProblemName] = useState('');
  const [postPlatform, setPostPlatform] = useState<'LeetCode' | 'CodeChef' | 'Codeforces' | 'HackerRank'>('LeetCode');
  const [postDifficulty, setPostDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [postTags, setPostTags] = useState<string[]>(['Dynamic Programming']);
  const [postTagInput, setPostTagInput] = useState('');
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCodeSnippet, setPostCodeSnippet] = useState('// Solution O(N log N)\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n  // Write your approach here\n}');
  const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleTag = (tag: string) => {
    if (postTags.includes(tag)) {
      setPostTags(postTags.filter((t) => t !== tag));
    } else if (postTags.length < 10) {
      setPostTags([...postTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPostTags(postTags.filter((t) => t !== tag));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && postTagInput.trim()) {
      e.preventDefault();
      const newTag = postTagInput.trim().toLowerCase();
      if (!postTags.includes(newTag) && postTags.length < 10) {
        setPostTags([...postTags, newTag]);
        setPostTagInput('');
      }
    }
  };

  const handleCreateEditorial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postTitle.trim() || !postContent.trim() || !postSummary.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/editorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          summary: postSummary,
          content: postContent,
          codeSnippet: postCodeSnippet,
          codeLanguage: 'cpp',
          platform: postPlatform,
          difficulty: postDifficulty,
          tags: postTags,
          problemUrl: postProblemName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage('✨ Editorial published successfully! +50 CP points earned');
        setTimeout(() => {
          router.push('/editorials');
        }, 2000);
      } else {
        setFormError(data.message || 'Unable to publish your editorial. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setFormError('Connection lost. Please check your internet and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1D6] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-onyx/10 text-onyx transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-golden-sand/40 text-tomato-jam border border-onyx/10 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              Peer Knowledge Sharing
            </div>
            <h1 className="text-3xl font-black text-onyx">Publish New Editorial</h1>
            <p className="text-sm text-onyx/70 mt-1">Share problem intuition, approach breakdown, and optimal code with NSEC peers.</p>
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{formError}</span>
            <button
              onClick={() => setFormError(null)}
              className="text-rose-500 hover:text-rose-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form - Bento Layout */}
        <form onSubmit={handleCreateEditorial} className="space-y-6">
          {/* Author Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-tomato-jam/30"
                  loading="lazy"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-onyx">{CURRENT_USER.name}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-golden-sand/30 text-tomato-jam">
                      {CURRENT_USER.department}
                    </span>
                  </div>
                  <p className="text-sm text-onyx/70 mt-1">
                    Level {CURRENT_USER.level} • Verified Mentor
                  </p>
                </div>
              </div>
              <LevelBadge level={CURRENT_USER.level} tier={CURRENT_USER.tier} size="sm" />
            </div>
          </div>

          {/* Title Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
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
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-base font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
            />
          </div>

          {/* Problem Name Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
              Problem Name or URL
            </label>
            <input
              type="text"
              value={postProblemName}
              onChange={(e) => setPostProblemName(e.target.value)}
              placeholder='e.g., "CF 1890D - Trees and Segments"'
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-base font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
            />
          </div>

          {/* Platform & Difficulty - 2 Col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Platform */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
                Platform <span className="text-tomato-jam">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {publishPlatforms.map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPostPlatform(plat as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      postPlatform === plat
                        ? 'bg-onyx text-white shadow-sm'
                        : 'bg-golden-sand/15 text-onyx hover:bg-golden-sand/30 border border-onyx/12'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
                Difficulty Level <span className="text-tomato-jam">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setPostDifficulty(diff)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      postDifficulty === diff
                        ? `${
                            diff === 'Easy'
                              ? 'bg-pine-teal text-white'
                              : diff === 'Medium'
                              ? 'bg-golden-sand text-onyx'
                              : 'bg-tomato-jam text-white'
                          } shadow-sm border-transparent`
                        : 'bg-onyx/5 text-onyx/70 hover:bg-onyx/10 border-onyx/12'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
              Algorithm Topics & Tags (Max 10)
            </label>

            {/* Active Tags */}
            {postTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-golden-sand/10 border border-golden-sand/30">
                {postTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-tomato-jam text-white shadow-xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-black/20 rounded p-0.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags
                .filter((t) => !postTags.includes(t))
                .slice(0, 6)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-golden-sand/20 text-onyx/80 hover:bg-golden-sand/40 border border-onyx/12 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
            </div>

            {/* Custom Tag Input */}
            <input
              type="text"
              value={postTagInput}
              onChange={(e) => setPostTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type tag and press Enter..."
              className="w-full px-4 py-2.5 rounded-lg border border-onyx/12 bg-golden-sand/8 text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
            />
          </div>

          {/* Summary Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-3 block">
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
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-base font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam transition-all"
            />
          </div>

          {/* Content & Code Card */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-onyx/70">
                Editorial Explanation & Code <span className="text-tomato-jam">*</span>
              </label>
              <div className="flex items-center gap-1 bg-onyx/5 p-1 rounded-lg border border-onyx/10">
                <button
                  type="button"
                  onClick={() => setPreviewTab('write')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

            {/* Write Mode */}
            {previewTab === 'write' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-onyx/70 mb-2 block">Explanation & Intuition</label>
                  <textarea
                    rows={6}
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
                    rows={6}
                    value={postCodeSnippet}
                    onChange={(e) => setPostCodeSnippet(e.target.value)}
                    placeholder='// Optimal solution code here'
                    className="w-full px-4 py-3 rounded-lg border border-onyx/12 bg-onyx text-golden-sand text-xs font-mono focus:outline-none focus:ring-2 focus:ring-golden-sand/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Preview Mode */}
            {previewTab === 'preview' && (
              <div className="space-y-3 p-4 rounded-lg bg-onyx/5 border border-onyx/12">
                <div className="text-xs font-bold uppercase tracking-wider text-tomato-jam flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Live Preview
                </div>

                <div className="text-xs text-onyx/80 bg-white p-4 rounded-lg leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {postContent || 'Your explanation will appear here...'}
                </div>

                <div className="rounded-lg bg-onyx p-4 text-golden-sand font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  <pre>{postCodeSnippet || '// Your code will appear here'}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl border border-onyx/12 text-onyx font-bold text-base hover:bg-onyx/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tomato-jam hover:bg-[#D43D42] active:bg-[#C83339] text-white font-extrabold text-base shadow-lg shadow-tomato-jam/30 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publish Editorial
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
            <span className="text-lg">{toastMessage.includes('✨') ? '✨' : '🎉'}</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
