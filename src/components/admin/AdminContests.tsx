'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Award,
} from 'lucide-react';

interface ContestItem {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED' | 'ARCHIVED';
  registeredCount: number;
  maxParticipants: number | null;
  venue: string | null;
  prize: string | null;
  url: string | null;
  description: string | null;
  isInternal: boolean;
  hostedInternal: boolean;
  enableProctoring: boolean;
  isLinkPublished: boolean;
  displayRegisteredUsers: boolean;
  accessCode: string | null;
  registrationDeadline: string | null;
  _count?: {
    registrations: number;
    ContestInfringement?: number;
  };
}

interface ContestCounts {
  all: number;
  upcoming: number;
  live: number;
  ended: number;
  archived: number;
}

interface AdminContestsProps {
  onSelectContestForAttendance: (contestId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

const INITIAL_FORM_STATE = {
  title: '',
  platform: 'NSEC Internal',
  startTime: '',
  duration: '2 hours',
  status: 'UPCOMING' as 'UPCOMING' | 'LIVE' | 'ENDED' | 'ARCHIVED',
  venue: '',
  prize: '',
  maxParticipants: 50,
  url: '',
  accessCode: '',
  registrationDeadline: '',
  description: '',
  isInternal: false,
  hostedInternal: false,
  enableProctoring: true,
  isLinkPublished: false,
  displayRegisteredUsers: true,
};

export function AdminContests({
  onSelectContestForAttendance,
  onShowToast,
}: AdminContestsProps) {
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [counts, setCounts] = useState<ContestCounts>({ all: 0, upcoming: 0, live: 0, ended: 0, archived: 0 });
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'ENDED' | 'ARCHIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContests, setTotalContests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Modal State
  const [contestModal, setContestModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    contestId: string | null;
    form: typeof INITIAL_FORM_STATE;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    contestId: null,
    form: INITIAL_FORM_STATE,
    isSubmitting: false,
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    contest: ContestItem | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    contest: null,
    isSubmitting: false,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchContests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatusTab !== 'ALL') params.set('status', selectedStatusTab);
      if (debouncedSearch) params.set('q', debouncedSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/contests?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch contests: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setContests(data.contests);
        setCounts(data.counts);
        setTotalPages(data.pagination.totalPages);
        setTotalContests(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      onShowToast('Could not load contest list from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatusTab, debouncedSearch, currentPage, onShowToast]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleOpenCreateModal = () => {
    const now = new Date();
    // Default to tomorrow 5:00 PM local ISO string for datetime-local
    now.setDate(now.getDate() + 1);
    now.setHours(17, 0, 0, 0);
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    setContestModal({
      isOpen: true,
      mode: 'create',
      contestId: null,
      form: {
        ...INITIAL_FORM_STATE,
        startTime: localIso,
      },
      isSubmitting: false,
    });
  };

  const handleOpenEditModal = (c: ContestItem) => {
    const startIso = c.startTime
      ? new Date(new Date(c.startTime).getTime() - new Date(c.startTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '';
    const deadlineIso = c.registrationDeadline
      ? new Date(new Date(c.registrationDeadline).getTime() - new Date(c.registrationDeadline).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '';

    setContestModal({
      isOpen: true,
      mode: 'edit',
      contestId: c.id,
      form: {
        title: c.title,
        platform: c.platform,
        startTime: startIso,
        duration: c.duration,
        status: c.status,
        venue: c.venue || '',
        prize: c.prize || '',
        maxParticipants: c.maxParticipants ?? 50,
        url: c.url || '',
        accessCode: c.accessCode || '',
        registrationDeadline: deadlineIso,
        description: c.description || '',
        isInternal: Boolean(c.isInternal),
        hostedInternal: Boolean(c.hostedInternal),
        enableProctoring: c.enableProctoring !== false,
        isLinkPublished: Boolean(c.isLinkPublished),
        displayRegisteredUsers: c.displayRegisteredUsers !== false,
      },
      isSubmitting: false,
    });
  };

  const handleSubmitContestForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setContestModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const isEdit = contestModal.mode === 'edit';
      const endpoint = isEdit
        ? `/api/admin/contests/${contestModal.contestId}`
        : '/api/admin/contests';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestModal.form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save contest');
      }

      onShowToast(data.message || (isEdit ? 'Contest updated!' : 'Contest created!'), 'success');
      setContestModal({ isOpen: false, mode: 'create', contestId: null, form: INITIAL_FORM_STATE, isSubmitting: false });
      fetchContests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting contest';
      onShowToast(msg, 'error');
      setContestModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.contest) return;
    setDeleteModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch(`/api/admin/contests/${deleteModal.contest.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete contest');
      }

      onShowToast(data.message || 'Contest deleted successfully', 'success');
      setDeleteModal({ isOpen: false, contest: null, isSubmitting: false });
      fetchContests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting contest';
      onShowToast(msg, 'error');
      setDeleteModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 rounded-2xl border border-onyx/10 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedStatusTab('ALL');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatusTab === 'ALL'
                ? 'bg-onyx text-golden-sand shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>All Contests</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedStatusTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-onyx/10 text-onyx'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatusTab('UPCOMING');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatusTab === 'UPCOMING'
                ? 'bg-golden-sand text-onyx shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>Upcoming</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-onyx/10 text-onyx">
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatusTab('LIVE');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatusTab === 'LIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Live</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
              {counts.live}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStatusTab('ENDED');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatusTab === 'ENDED'
                ? 'bg-onyx text-white shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>Ended</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
              {counts.ended}
            </span>
          </button>
        </div>

        {/* Right Search & Create Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contest, venue..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-onyx/10 text-xs font-bold text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx/40 hover:text-onyx cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-tomato-jam hover:bg-tomato-jam/90 text-white font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Contest</span>
          </button>
        </div>
      </div>

      {/* Contests Table */}
      <div className="bg-white rounded-3xl border border-onyx/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF8] border-b border-onyx/10 text-onyx/60 font-black uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6">Contest Details</th>
                <th className="py-4 px-6">Platform &amp; Type</th>
                <th className="py-4 px-6">Schedule &amp; Duration</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Registrations</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-onyx/50 font-bold">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-tomato-jam" />
                      <span>Loading contests from database...</span>
                    </div>
                  </td>
                </tr>
              ) : contests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-onyx/50 font-bold">
                    No contests matching filter criteria.
                  </td>
                </tr>
              ) : (
                contests.map((c) => {
                  const regCount = c._count?.registrations ?? c.registeredCount;
                  const maxCap = c.maxParticipants ?? 50;

                  return (
                    <tr key={c.id} className="hover:bg-golden-sand/5 transition-colors">
                      {/* Contest Details */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="font-extrabold text-sm text-onyx hover:text-tomato-jam transition-colors">
                            {c.title}
                          </div>
                          {c.venue && (
                            <div className="flex items-center gap-1 text-[11px] text-onyx/60 font-medium">
                              <MapPin className="w-3 h-3 text-tomato-jam shrink-0" />
                              <span>{c.venue}</span>
                            </div>
                          )}
                          {c.prize && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                              <Award className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{c.prize}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Platform & Type */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-onyx block">{c.platform}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-onyx/50">
                          {c.hostedInternal ? 'Nexus Hosted' : c.isInternal ? 'Internal Club' : 'External Arena'}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-onyx flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-onyx/50" />
                          <span>{new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="text-[11px] text-onyx/60 font-medium flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-onyx/40" />
                          <span>{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {c.duration}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {c.status === 'LIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 animate-pulse border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Live
                          </span>
                        ) : c.status === 'UPCOMING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-golden-sand/40 text-amber-900 border border-golden-sand">
                            Upcoming
                          </span>
                        ) : c.status === 'ENDED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-onyx/10 text-onyx/70">
                            Ended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gray-100 text-gray-500">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Registered count */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="font-extrabold text-sm text-onyx">
                            {regCount} <span className="text-onyx/40 font-normal">/ {maxCap}</span>
                          </div>
                        </div>
                        <div className="w-24 bg-onyx/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.round((regCount / maxCap) * 100))}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Manage Attendance / Participants Button */}
                          <button
                            type="button"
                            onClick={() => onSelectContestForAttendance(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-golden-sand/40 hover:bg-golden-sand text-onyx font-extrabold text-xs transition-all border border-golden-sand/60 cursor-pointer flex items-center gap-1.5"
                            title="Manage contest participants & mark attendance"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-800" />
                            <span>Roster</span>
                          </button>

                          {/* Edit Contest Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/70 hover:text-onyx transition-colors cursor-pointer"
                            title="Edit contest details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Contest Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ isOpen: true, contest: c, isSubmitting: false })}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                            title="Delete contest"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3 px-6 bg-[#FFFDF8] border-t border-onyx/10 flex items-center justify-between text-xs font-bold text-onyx/60">
          <div>
            Showing {contests.length} of {totalContests} contests
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-onyx/10 bg-white hover:bg-onyx/5 text-onyx font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 text-onyx font-black">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-onyx/10 bg-white hover:bg-onyx/5 text-onyx font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Contest Modal */}
      {contestModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-onyx/15 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-tomato-jam/10 text-tomato-jam flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">
                    {contestModal.mode === 'create' ? 'Create New Contest' : 'Edit Contest Details'}
                  </h3>
                  <p className="text-xs text-onyx/50 font-medium">Event schedule &amp; registration configuration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContestModal({ ...contestModal, isOpen: false })}
                className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/50 hover:text-onyx cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitContestForm} className="space-y-4 text-xs">
              {/* Title & Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-extrabold text-onyx">Contest Title *</label>
                  <input
                    type="text"
                    value={contestModal.form.title}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, title: e.target.value } })}
                    required
                    placeholder="e.g. CodeCraft Sprint 2026 #1"
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Platform *</label>
                  <select
                    value={contestModal.form.platform}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, platform: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  >
                    <option value="NSEC Internal">NSEC Internal</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="External">External Platform</option>
                  </select>
                </div>
              </div>

              {/* Start Time, Duration & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Start Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={contestModal.form.startTime}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, startTime: e.target.value } })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Duration *</label>
                  <input
                    type="text"
                    value={contestModal.form.duration}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, duration: e.target.value } })}
                    required
                    placeholder="e.g. 2 hours"
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Contest Status</label>
                  <select
                    value={contestModal.form.status}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, status: e.target.value as 'UPCOMING' | 'LIVE' | 'ENDED' | 'ARCHIVED' } })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="ENDED">Ended</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Venue, Prize & Max Participants */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Venue / Location</label>
                  <input
                    type="text"
                    value={contestModal.form.venue}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, venue: e.target.value } })}
                    placeholder="e.g. Lab 3, Campus Tech Block"
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Prize / Awards</label>
                  <input
                    type="text"
                    value={contestModal.form.prize}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, prize: e.target.value } })}
                    placeholder="e.g. Swag Kits + Certificate"
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Max Capacity</label>
                  <input
                    type="number"
                    value={contestModal.form.maxParticipants}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, maxParticipants: parseInt(e.target.value, 10) || 50 } })}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>
              </div>

              {/* URL & Access Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Contest Arena URL</label>
                  <input
                    type="url"
                    value={contestModal.form.url}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, url: e.target.value } })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={contestModal.form.registrationDeadline}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, registrationDeadline: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-extrabold text-onyx">Contest Description</label>
                <textarea
                  rows={2}
                  value={contestModal.form.description}
                  onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, description: e.target.value } })}
                  placeholder="Rules, scoring format, problem counts..."
                  className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-medium text-onyx focus:outline-none resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-onyx/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contestModal.form.hostedInternal}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, hostedInternal: e.target.checked } })}
                    className="w-4 h-4 rounded text-tomato-jam"
                  />
                  <span className="font-bold text-onyx">Hosted on Nexus Portal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contestModal.form.enableProctoring}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, enableProctoring: e.target.checked } })}
                    className="w-4 h-4 rounded text-tomato-jam"
                  />
                  <span className="font-bold text-onyx">Enable Anti-Cheat Proctoring</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contestModal.form.isLinkPublished}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, isLinkPublished: e.target.checked } })}
                    className="w-4 h-4 rounded text-tomato-jam"
                  />
                  <span className="font-bold text-onyx">Publish Arena Link to Registered Users</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contestModal.form.displayRegisteredUsers}
                    onChange={(e) => setContestModal({ ...contestModal, form: { ...contestModal.form, displayRegisteredUsers: e.target.checked } })}
                    className="w-4 h-4 rounded text-tomato-jam"
                  />
                  <span className="font-bold text-onyx">Public Participant Roster</span>
                </label>
              </div>

              <div className="pt-3 border-t border-onyx/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={contestModal.isSubmitting}
                  onClick={() => setContestModal({ ...contestModal, isOpen: false })}
                  className="px-4 py-2.5 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contestModal.isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-tomato-jam hover:bg-tomato-jam/90 font-black text-xs text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {contestModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{contestModal.mode === 'create' ? 'Create Contest' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.contest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-onyx/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">Delete Contest</h3>
                  <p className="text-xs text-onyx/50 font-medium">Permanent event removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, contest: null, isSubmitting: false })}
                className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/50 hover:text-onyx cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-onyx/80">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-onyx font-black">{deleteModal.contest.title}</strong>?
              </p>
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-medium space-y-1">
                <p className="font-bold">Database relationships affected:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>All associated participant registrations will be removed</li>
                  <li>Proctoring infringements and contest submissions will be cleaned up</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleteModal.isSubmitting}
                onClick={() => setDeleteModal({ isOpen: false, contest: null, isSubmitting: false })}
                className="px-4 py-2.5 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.isSubmitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-2xl bg-tomato-jam hover:bg-tomato-jam/90 font-black text-xs text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {deleteModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Contest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
