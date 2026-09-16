/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/components/providers/UserProvider';
import { Editorial } from '@/types';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

export default function EditEditorialPage() {
  const router = useRouter();
  const params = useParams();
  const editorialId = params.id as string;
  const { user: CURRENT_USER } = useUser();

  const [editorial, setEditorial] = useState<Editorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    codeSnippet: '',
    codeLanguage: 'Python',
    tags: [] as string[],
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    platform: 'LeetCode',
  });

  const [newTag, setNewTag] = useState('');

  // Fetch editorial details
  useEffect(() => {
    const fetchEditorial = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/editorials/${editorialId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Unable to load this editorial. Please try again.');
          return;
        }

        if (data.success && data.editorial) {
          const ed = data.editorial;
          setEditorial(ed);
          setFormData({
            title: ed.title,
            summary: ed.summary,
            content: ed.content,
            codeSnippet: ed.codeSnippet,
            codeLanguage: ed.codeLanguage,
            tags: ed.tags || [],
            difficulty: ed.difficulty,
            platform: ed.platform,
          });
        } else {
          setError('Unable to load this editorial. Please try again.');
        }
      } catch (err: any) {
        setError('Connection lost. Please check your internet and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (editorialId) {
      fetchEditorial();
    }
  }, [editorialId]);

  // Check if user is the author
  useEffect(() => {
    if (editorial && editorial.authorId !== CURRENT_USER?.id) {
      setError('You do not have permission to edit this editorial.');
    }
  }, [editorial, CURRENT_USER?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags.length < 10) {
      const tagLower = newTag.trim().toLowerCase();
      if (!formData.tags.includes(tagLower)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagLower],
        }));
        setNewTag('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/editorials/${editorialId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          publisherId: CURRENT_USER?.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage('✨ Editorial updated successfully!');
        setTimeout(() => {
          router.push(`/editorials/${editorialId}`);
        }, 2000);
      } else {
        setError(data.message || 'Unable to update your editorial. Please try again.');
        setIsSaving(false);
      }
    } catch (err: any) {
      setError('Connection lost. Please check your internet and try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <CapybaraLoader />;
  }

  if (error && !editorial) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-tomato-jam mx-auto" />
          <h1 className="text-2xl font-black text-onyx">Error</h1>
          <p className="text-onyx/70">{error}</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-onyx/10 text-onyx transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-onyx">Edit Editorial</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-tomato-jam/10 border border-tomato-jam/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-tomato-jam flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-tomato-jam">{error}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter editorial title"
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam placeholder:text-onyx/40 font-medium"
              required
            />
          </div>

          {/* Summary */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Overview Summary *
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Brief overview of the editorial"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam placeholder:text-onyx/40 font-medium resize-none"
              required
            />
          </div>

          {/* Content */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Full Explanation *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Detailed explanation and approach"
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam placeholder:text-onyx/40 font-medium resize-none"
              required
            />
          </div>

          {/* Code Snippet */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Code Snippet
            </label>
            <textarea
              name="codeSnippet"
              value={formData.codeSnippet}
              onChange={handleInputChange}
              placeholder="Paste optimal solution code here"
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-onyx text-golden-sand focus:outline-none focus:border-tomato-jam placeholder:text-golden-sand/50 font-mono text-sm resize-none"
            />
          </div>

          {/* Code Language */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Code Language
            </label>
            <select
              name="codeLanguage"
              value={formData.codeLanguage}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam font-medium"
            >
              <option>Python</option>
              <option>JavaScript</option>
              <option>Java</option>
              <option>C++</option>
              <option>TypeScript</option>
              <option>Go</option>
              <option>Rust</option>
            </select>
          </div>

          {/* Difficulty & Platform - Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Difficulty */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam font-medium"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            {/* Platform */}
            <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam font-medium"
              >
                <option>LeetCode</option>
                <option>CodeChef</option>
                <option>Codeforces</option>
                <option>HackerRank</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 lg:p-8 shadow-xs space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-onyx block">
              Topics/Tags (Max 10)
            </label>
            
            {/* Add Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a topic tag"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam placeholder:text-onyx/40"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 10}
                className="px-4 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-golden-sand/15 text-onyx border border-onyx/12 text-sm font-bold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-onyx/60 hover:text-onyx transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-xl border border-onyx/12 text-onyx font-bold hover:bg-onyx/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
            <span className="text-lg">✨</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
