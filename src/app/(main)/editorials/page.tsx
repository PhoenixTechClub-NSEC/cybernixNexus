/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/UserProvider';
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
} from 'lucide-react';

export default function EditorialsPage() {
  const { user: CURRENT_USER } = useUser();
  const [editorialsList, setEditorialsList] = useState<Editorial[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'ALL'>('ALL');
  const [selectedDiff, setSelectedDiff] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEditorial, setSelectedEditorial] = useState<Editorial | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, EditorialComment[]>>({});

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (isPublishModalOpen || selectedEditorial) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPublishModalOpen, selectedEditorial]);

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
    'GFG',
  ];

  const handleToggleTag = (tag: string) => {
    if (postTags.includes(tag)) {
      setPostTags(postTags.filter((t) => t !== tag));
    } else {
      setPostTags([...postTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && postTagInput.trim()) {
      e.preventDefault();
      const newTag = postTagInput.trim();
      if (!postTags.includes(newTag)) {
        setPostTags([...postTags, newTag]);
      }
      setPostTagInput('');
    }
  };

  const handleCreateEditorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      return;
    }
    const newId = `ed-custom-${Date.now()}`;
    const newEditorial: Editorial = {
      id: newId,
      title: postTitle.trim(),
      problemUrl: postProblemName.trim() || 'https://codeforces.com',
      platform: postPlatform,
      difficulty: postDifficulty,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      authorDept: CURRENT_USER.department,
      authorLevel: CURRENT_USER.level,
      authorTier: CURRENT_USER.tier,
      tags: postTags.length > 0 ? postTags : ['Algorithms'],
      summary:
        postSummary.trim() ||
        postContent.slice(0, 150) + (postContent.length > 150 ? '...' : ''),
      content: postContent.trim(),
      codeSnippet: postCodeSnippet.trim() || '// Solution approach',
      codeLanguage: 'C++',
      likesCount: 1,
      commentsCount: 0,
      comments: [],
      publishedAt: 'Just now',
    };

    setEditorialsList([newEditorial, ...editorialsList]);
    setLikesMap({ ...likesMap, [newId]: 1 });
    setLikedIds({ ...likedIds, [newId]: true });
    setCommentsMap({ ...commentsMap, [newId]: [] });
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
  };

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedIds[id]) {
      setLikedIds({ ...likedIds, [id]: false });
      setLikesMap({ ...likesMap, [id]: (likesMap[id] || 1) - 1 });
    } else {
      setLikedIds({ ...likedIds, [id]: true });
      setLikesMap({ ...likesMap, [id]: (likesMap[id] || 0) + 1 });
    }
  };

  const handleAddComment = (editorialId: string) => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      authorDept: CURRENT_USER.department,
      content: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 0,
    };
    setCommentsMap({
      ...commentsMap,
      [editorialId]: [newComment, ...(commentsMap[editorialId] || [])],
    });
    setNewCommentText('');
  };

  const filteredEditorials = editorialsList.filter((item) => {
    const matchesPlatform = selectedPlatform === 'ALL' || item.platform === selectedPlatform;
    const matchesDiff = selectedDiff === 'ALL' || item.difficulty === selectedDiff;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlatform && matchesDiff && matchesSearch;
  });

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
          onClick={() => setIsPublishModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm shadow-md shadow-tomato-jam/20 cursor-pointer transition-all"
        >
          <Code2 className="w-4 h-4" />
          Publish New Editorial
        </button>
      </div>

      {/* Filter Bar */}
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

      {/* Editorials List with deferred off-screen rendering */}
      <div className="grid grid-cols-1 gap-6 content-visibility-auto">
        {filteredEditorials.length === 0 ? (
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
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-xs shadow-md shadow-tomato-jam/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish First Solution</span>
            </button>
          </div>
        ) : (
          filteredEditorials.map((editorial) => {
            const likes = likesMap[editorial.id] || editorial.likesCount;
            const isLiked = likedIds[editorial.id];
            const commentsCount = (commentsMap[editorial.id] || editorial.comments).length;

            return (
              <div
                key={editorial.id}
                onClick={() => setSelectedEditorial(editorial)}
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

                {/* Footer bar: Likes, Comments, Read Tutorial CTA */}
                <div className="mt-6 pt-4 border-t border-onyx/12 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLike(editorial.id, e)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-golden-sand/20 text-tomato-jam border border-onyx/12'
                          : 'bg-golden-sand/10 text-onyx/70 hover:bg-golden-sand/15'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current text-tomato-jam' : ''}`} />
                      <span>{likes}</span>
                    </button>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-onyx/70">
                      <MessageSquare className="w-4 h-4 text-onyx/70" />
                      <span>{commentsCount} comments</span>
                    </div>

                    <span className="text-xs text-onyx/70">{editorial.publishedAt}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-tomato-jam group-hover:underline">
                    Read Complete Tutorial <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          }))}
      </div>

      {/* FULL TUTORIAL MODAL / DRAWER */}
      {selectedEditorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-onyx/12 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-onyx p-6 text-white relative shrink-0 border-b border-tomato-jam/40">
              <button
                onClick={() => setSelectedEditorial(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-golden-sand mb-1">
                <span>{selectedEditorial.platform}</span>
                <span>•</span>
                <span>{selectedEditorial.difficulty}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{selectedEditorial.title}</h2>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <img
                  src={selectedEditorial.authorAvatar}
                  alt={selectedEditorial.authorName}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-tomato-jam/40"
                />
                <span className="font-bold">{selectedEditorial.authorName}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-golden-sand">
                  {selectedEditorial.authorDept}
                </span>
                <LevelBadge
                  level={selectedEditorial.authorLevel}
                  tier={selectedEditorial.authorTier}
                  size="sm"
                />
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar" data-lenis-prevent="true">
              {/* Markdown Content */}
              <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
                <div className="whitespace-pre-line text-onyx">
                  {selectedEditorial.content}
                </div>
              </div>

              {/* Complete Code Block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-onyx/70">
                    Optimal C++ Solution Code
                  </span>
                  <span className="text-xs text-onyx/70">Time: O(N) | Space: O(N)</span>
                </div>
                <div className="rounded-2xl bg-onyx text-golden-sand p-5 font-mono text-xs overflow-x-auto border border-onyx/12">
                  <pre>{selectedEditorial.codeSnippet}</pre>
                </div>
              </div>

              {/* Likes & Comment Section */}
              <div className="pt-6 border-t border-onyx/12 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-onyx text-base">
                    Discussion & Doubts (
                    {(commentsMap[selectedEditorial.id] || selectedEditorial.comments).length})
                  </h4>
                  <button
                    onClick={() => handleLike(selectedEditorial.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      likedIds[selectedEditorial.id]
                        ? 'bg-golden-sand/20 text-tomato-jam border border-onyx/12'
                        : 'bg-golden-sand/10 text-onyx/70 hover:bg-golden-sand/15'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${
                        likedIds[selectedEditorial.id] ? 'fill-current text-tomato-jam' : ''
                      }`}
                    />
                    <span>{likesMap[selectedEditorial.id] || selectedEditorial.likesCount}</span>
                  </button>
                </div>

                {/* Add Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a doubt or share your alternative approach..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleAddComment(selectedEditorial.id)
                    }
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-onyx/12 bg-golden-sand/8 text-onyx focus:outline-none focus:border-tomato-jam"
                  />
                  <button
                    onClick={() => handleAddComment(selectedEditorial.id)}
                    className="px-4 py-2 rounded-xl bg-tomato-jam text-white font-bold text-xs hover:bg-[#E8890C] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  {(
                    commentsMap[selectedEditorial.id] || selectedEditorial.comments
                  ).map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-xl bg-golden-sand/8 border border-onyx/12 flex items-start gap-3"
                    >
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-tomato-jam/30"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-onyx">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-golden-sand/20 text-tomato-jam">
                              {comment.authorDept}
                            </span>
                          </div>
                          <span className="text-[10px] text-onyx/70">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-onyx mt-1 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => setIsPublishModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-onyx/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl bg-white border border-onyx/12 shadow-2xl flex flex-col"
            data-lenis-prevent="true"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-onyx/12 flex items-start justify-between gap-4 bg-gradient-to-r from-golden-sand/15 via-white to-white sticky top-0 z-10 backdrop-blur-md">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-golden-sand/30 text-tomato-jam border border-onyx/12 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-tomato-jam" />
                  Peer Knowledge Sharing
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight">
                  Publish New Editorial
                </h2>
                <p className="text-xs sm:text-sm text-onyx/70 mt-1">
                  Share problem intuition, algorithm approach, and clean code with junior students at NSEC.
                </p>
              </div>

              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-2 rounded-full hover:bg-onyx/5 text-onyx/70 hover:text-onyx transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEditorial} className="p-6 sm:p-8 space-y-6">
              {/* Author Preview Box */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-onyx/5 border border-onyx/10">
                <div className="flex items-center gap-3">
                  <img
                    src={CURRENT_USER.avatar}
                    alt={CURRENT_USER.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-tomato-jam/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-onyx">{CURRENT_USER.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-golden-sand/20 text-tomato-jam">
                        {CURRENT_USER.department}
                      </span>
                    </div>
                    <p className="text-xs text-onyx/70">
                      Posting as Verified NSEC Mentor • Level {CURRENT_USER.level}
                    </p>
                  </div>
                </div>
                <LevelBadge
                  level={CURRENT_USER.level}
                  tier={CURRENT_USER.tier}
                  size="sm"
                />
              </div>

              {/* Title and Problem Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-1.5">
                    Editorial Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder='e.g., "Optimal O(N log N) Tree DP Solution"'
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/20 bg-white text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-1.5">
                    Problem Name or Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={postProblemName}
                    onChange={(e) => setPostProblemName(e.target.value)}
                    placeholder='e.g., "CF 1890D - Trees and Segments"'
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/20 bg-white text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 transition-all"
                  />
                </div>
              </div>

              {/* Platform and Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-2">
                    Platform *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Codeforces', 'LeetCode', 'CodeChef', 'HackerRank', 'AtCoder', 'GFG'] as PlatformName[]).map(
                      (plat) => {
                        const isSelected = postPlatform === plat;
                        return (
                          <button
                            type="button"
                            key={plat}
                            onClick={() => setPostPlatform(plat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-onyx text-white shadow-sm'
                                : 'bg-golden-sand/15 text-onyx hover:bg-golden-sand/30 border border-onyx/10'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-2">
                    Difficulty Level *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                      const isSelected = postDifficulty === diff;
                      const activeColor =
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
                          className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                            isSelected
                              ? `${activeColor} shadow-sm border-transparent`
                              : 'bg-onyx/5 text-onyx/70 hover:bg-onyx/10 border-onyx/10'
                          }`}
                        >
                          {diff}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Algorithm Topics & Tags */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-1.5">
                  Algorithm Topics & Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestedTags.map((tag) => {
                    const isSelected = postTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-tomato-jam text-white shadow-xs'
                            : 'bg-golden-sand/20 text-onyx/80 hover:bg-golden-sand/40 border border-onyx/12'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>#{tag}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={postTagInput}
                  onChange={(e) => setPostTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="Type a custom tag and press Enter to add..."
                  className="w-full px-4 py-2 rounded-xl border border-onyx/20 bg-white text-xs font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 transition-all"
                />
              </div>

              {/* TL;DR Summary */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-1.5">
                  Summary / TL;DR (Displayed on Hub Card)
                </label>
                <input
                  type="text"
                  value={postSummary}
                  onChange={(e) => setPostSummary(e.target.value)}
                  placeholder='e.g., "Greedy line sweep + Segment Tree query in O(N log N) time space complexity."'
                  className="w-full px-4 py-2.5 rounded-xl border border-onyx/20 bg-white text-sm font-medium text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 transition-all"
                />
              </div>

              {/* Write vs Live Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx">
                    Editorial Explanation & Intuition *
                  </label>
                  <div className="flex items-center gap-1 bg-onyx/5 p-1 rounded-xl border border-onyx/10">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('write')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'write'
                          ? 'bg-onyx text-white shadow-xs'
                          : 'text-onyx/70 hover:text-onyx'
                      }`}
                    >
                      Write Tutorial
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'preview'
                          ? 'bg-onyx text-white shadow-xs'
                          : 'text-onyx/70 hover:text-onyx'
                      }`}
                    >
                      Live Card Preview
                    </button>
                  </div>
                </div>

                {previewTab === 'write' ? (
                  <div className="space-y-4">
                    <textarea
                      rows={6}
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder={`### Intuition & Observation\nExplain why the greedy choice works...\n\n### Step-by-Step Algorithm\n1. Sort array in ascending order\n2. Use two pointers...`}
                      className="w-full px-4 py-3 rounded-2xl border border-onyx/20 bg-white text-sm font-mono text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 transition-all leading-relaxed"
                    />

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-onyx mb-1.5">
                        Key Solution Code Snippet (C++)
                      </label>
                      <textarea
                        rows={4}
                        value={postCodeSnippet}
                        onChange={(e) => setPostCodeSnippet(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-onyx/20 bg-onyx text-golden-sand text-xs font-mono focus:outline-none focus:ring-2 focus:ring-golden-sand/30 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-onyx/20 bg-white/50 space-y-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-tomato-jam">
                      Live Feed Card Preview
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-onyx/12 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-golden-sand/20 text-onyx">
                          {postPlatform}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            postDifficulty === 'Easy'
                              ? 'bg-pine-teal/20 text-pine-teal'
                              : postDifficulty === 'Medium'
                              ? 'bg-golden-sand/40 text-onyx'
                              : 'bg-tomato-jam/20 text-tomato-jam'
                          }`}
                        >
                          {postDifficulty}
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-onyx">
                        {postTitle || 'Your Editorial Title Here...'}
                      </h4>
                      <p className="text-sm text-onyx/70">
                        {postSummary || 'Your summary description will appear here on the community feed.'}
                      </p>

                      <div className="rounded-xl bg-onyx text-golden-sand p-3 font-mono text-xs overflow-x-auto">
                        <pre>{postCodeSnippet || '// Key code snippet will be shown here'}</pre>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {postTags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-golden-sand/15 text-onyx border border-onyx/12"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-4 border-t border-onyx/12 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm shadow-md shadow-tomato-jam/25 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Editorial Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
