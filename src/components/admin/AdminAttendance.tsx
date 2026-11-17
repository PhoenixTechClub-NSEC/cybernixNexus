'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Trophy,
  Copy,
  Check,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ParticipantItem {
  id: string;
  participantId: string | null;
  contestId: string;
  studentId: string;
  fullName: string;
  email: string | null;
  studentIdNumber: string | null;
  academicYear: string | null;
  phoneNumber: string | null;
  score: number;
  tabSwitches: number;
  dqReason: string | null;
  otpVerified: boolean;
  createdAt: string;
  status: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'PENDING';
  student: {
    id: string;
    name: string;
    username: string | null;
    department: string;
    avatar: string | null;
  };
}

interface ContestOption {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  status: string;
  registeredCount: number;
  maxParticipants: number | null;
  venue: string | null;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  pending: number;
}

interface AdminAttendanceProps {
  initialContestId?: string | null;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export function AdminAttendance({
  initialContestId,
  onShowToast,
}: AdminAttendanceProps) {
  const [contests, setContests] = useState<ContestOption[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>(initialContestId || '');
  const [selectedContest, setSelectedContest] = useState<ContestOption | null>(null);

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({ total: 0, present: 0, absent: 0, pending: 0 });
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const [isLoadingContests, setIsLoadingContests] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Remove participant confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    participant: ParticipantItem | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    participant: null,
    isSubmitting: false,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch available contests for the dropdown selector
  useEffect(() => {
    async function loadContests() {
      setIsLoadingContests(true);
      try {
        const res = await fetch('/api/admin/contests?limit=50');
        const data = await res.json();
        if (data.success && data.contests) {
          setContests(data.contests);
          // If no contest selected yet or initialContestId provided
          if (initialContestId) {
            setSelectedContestId(initialContestId);
            const found = data.contests.find((c: ContestOption) => c.id === initialContestId);
            if (found) setSelectedContest(found);
          } else if (data.contests.length > 0) {
            setSelectedContestId((prev) => prev || data.contests[0].id);
            setSelectedContest((prev) => prev || data.contests[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingContests(false);
      }
    }
    loadContests();
  }, [initialContestId]);

  // Fetch participants whenever selected contest, filter, search, or page changes
  const fetchParticipants = useCallback(async () => {
    if (!selectedContestId) return;
    setIsLoadingParticipants(true);
    setSelectedIds([]); // reset selection on query change

    try {
      const params = new URLSearchParams();
      if (attendanceFilter !== 'ALL') params.set('attendance', attendanceFilter);
      if (debouncedSearch) params.set('q', debouncedSearch);
      params.set('page', String(currentPage));
      params.set('limit', '25');

      const res = await fetch(`/api/admin/contests/${selectedContestId}/participants?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load participants');
      }
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants);
        setSummary(data.summary);
        setSelectedContest(data.contest);
        setTotalPages(data.pagination.totalPages);
        setTotalParticipants(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      onShowToast('Could not load participants for this contest', 'error');
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [selectedContestId, attendanceFilter, debouncedSearch, currentPage, onShowToast]);

  useEffect(() => {
    if (selectedContestId) {
      fetchParticipants();
    }
  }, [fetchParticipants, selectedContestId]);

  // Update Individual Attendance
  const handleUpdateStatus = async (registrationId: string, newStatus: 'PRESENT' | 'ABSENT' | 'PENDING') => {
    try {
      const res = await fetch(`/api/admin/contests/${selectedContestId}/participants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update attendance');
      }

      onShowToast(`Attendance marked as ${newStatus}`, 'success');
      fetchParticipants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating attendance';
      onShowToast(msg, 'error');
    }
  };

  // Bulk Update Attendance
  const handleBulkUpdateStatus = async (newStatus: 'PRESENT' | 'ABSENT' | 'PENDING') => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`/api/admin/contests/${selectedContestId}/participants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationIds: selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update attendance in bulk');
      }

      onShowToast(`Marked ${selectedIds.length} participant(s) as ${newStatus}!`, 'success');
      setSelectedIds([]);
      fetchParticipants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating bulk attendance';
      onShowToast(msg, 'error');
    }
  };

  // Remove Participant from Contest
  const handleConfirmRemoveParticipant = async () => {
    if (!deleteModal.participant) return;
    setDeleteModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch(
        `/api/admin/contests/${selectedContestId}/participants?registrationId=${deleteModal.participant.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove participant');
      }

      onShowToast('Participant removed from contest roster', 'success');
      setDeleteModal({ isOpen: false, participant: null, isSubmitting: false });
      fetchParticipants();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing participant';
      onShowToast(msg, 'error');
      setDeleteModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Toggle selection for bulk actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === participants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(participants.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyParticipantId = (pId: string) => {
    navigator.clipboard.writeText(pId);
    setCopiedId(pId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Contest Selector & Event Info Header */}
      <div className="p-5 md:p-6 bg-white rounded-3xl border border-onyx/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-golden-sand bg-onyx px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-golden-sand" />
              <span>Contest Roster Management</span>
            </div>
            <h3 className="text-xl font-black text-onyx">
              {selectedContest?.title || 'Select a Contest to View Participants'}
            </h3>
            {selectedContest && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-onyx/60 font-medium">
                <span className="font-bold text-onyx">{selectedContest.platform}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedContest.startTime).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {selectedContest.venue && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-tomato-jam" />
                      {selectedContest.venue}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selector Dropdown */}
          <div className="w-full lg:w-80 space-y-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-onyx/50">
              Active Contest
            </label>
            <select
              value={selectedContestId}
              onChange={(e) => {
                setSelectedContestId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isLoadingContests || contests.length === 0}
              className="w-full px-4 py-2.5 rounded-2xl bg-onyx/5 border border-onyx/10 text-xs font-black text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 cursor-pointer"
            >
              {isLoadingContests ? (
                <option>Loading contests...</option>
              ) : contests.length === 0 ? (
                <option>No contests available</option>
              ) : (
                contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Attendance Summary Stat Badges */}
        <div className="pt-4 border-t border-onyx/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-onyx/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-onyx/50 block">Registered</span>
              <span className="text-2xl font-black text-onyx">{summary.total}</span>
            </div>
            <UserCheck className="w-6 h-6 text-onyx/20" />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Present</span>
              <span className="text-2xl font-black text-emerald-700">{summary.present}</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">Absent</span>
              <span className="text-2xl font-black text-red-700">{summary.absent}</span>
            </div>
            <XCircle className="w-6 h-6 text-red-500/40" />
          </div>

          <div className="p-3.5 rounded-2xl bg-golden-sand/30 border border-golden-sand/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">Pending</span>
              <span className="text-2xl font-black text-amber-900">{summary.pending}</span>
            </div>
            <Clock className="w-6 h-6 text-amber-700/30" />
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search & Bulk Operations Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 rounded-2xl border border-onyx/10 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setAttendanceFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              attendanceFilter === 'ALL'
                ? 'bg-onyx text-golden-sand shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>All Participants</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              attendanceFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-onyx/10 text-onyx'
            }`}>
              {summary.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAttendanceFilter('PRESENT');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              attendanceFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Present</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
              {summary.present}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAttendanceFilter('ABSENT');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              attendanceFilter === 'ABSENT'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Absent</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white">
              {summary.absent}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAttendanceFilter('PENDING');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              attendanceFilter === 'PENDING'
                ? 'bg-golden-sand text-onyx shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-onyx/10 text-onyx">
              {summary.pending}
            </span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, roll, email..."
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
      </div>

      {/* Floating Bulk Actions Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-dark-amethyst text-white border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-extrabold text-golden-sand">
            <span className="w-2 h-2 rounded-full bg-golden-sand animate-ping" />
            <span>{selectedIds.length} participant(s) selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('PRESENT')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Present</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('ABSENT')}
              className="px-3.5 py-1.5 rounded-xl bg-tomato-jam hover:bg-tomato-jam/90 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Absent</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('PENDING')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-golden-sand" />
              <span>Reset to Pending</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Participant Table */}
      <div className="bg-white rounded-3xl border border-onyx/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF8] border-b border-onyx/10 text-onyx/60 font-black uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={participants.length > 0 && selectedIds.length === participants.length}
                    onChange={handleToggleSelectAll}
                    disabled={participants.length === 0}
                    className="w-4 h-4 rounded text-tomato-jam focus:ring-tomato-jam cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Participant</th>
                <th className="py-4 px-4">Participant ID</th>
                <th className="py-4 px-4">Academic Details</th>
                <th className="py-4 px-4">Attendance Status</th>
                <th className="py-4 px-4">Proctoring Info</th>
                <th className="py-4 px-6 text-right">Quick Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx/5">
              {isLoadingParticipants ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-onyx/50 font-bold">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-tomato-jam" />
                      <span>Loading participant roster...</span>
                    </div>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-onyx/50 font-bold">
                    No participants found for this contest filter.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-golden-sand/5 transition-colors ${
                        isSelected ? 'bg-golden-sand/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded text-tomato-jam focus:ring-tomato-jam cursor-pointer"
                        />
                      </td>

                      {/* Participant Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={p.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-onyx/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-onyx truncate">
                              {p.fullName}
                            </div>
                            <div className="text-[11px] text-onyx/60 font-medium truncate">
                              {p.email || 'No email registered'}
                            </div>
                            {p.phoneNumber && (
                              <div className="text-[10px] text-onyx/40 font-mono">
                                📞 {p.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Participant ID with copy button */}
                      <td className="py-4 px-4">
                        {p.participantId ? (
                          <button
                            type="button"
                            onClick={() => handleCopyParticipantId(p.participantId!)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-onyx/5 hover:bg-onyx/10 text-onyx/80 font-mono font-bold text-xs transition-colors cursor-pointer group"
                            title="Click to copy participant ID"
                          >
                            <span>{p.participantId}</span>
                            {copiedId === p.participantId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-onyx/40 group-hover:text-onyx" />
                            )}
                          </button>
                        ) : (
                          <span className="text-onyx/30 font-mono text-xs">Unassigned</span>
                        )}
                      </td>

                      {/* Academic Details */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-onyx">
                          {p.student.department || 'CSE'} • {p.academicYear || '1st Year'}
                        </div>
                        <div className="text-[11px] text-onyx/60 font-mono">
                          Roll: {p.studentIdNumber || 'N/A'}
                        </div>
                      </td>

                      {/* Attendance Status Badge */}
                      <td className="py-4 px-4">
                        {p.attendanceStatus === 'PRESENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Present
                          </span>
                        ) : p.attendanceStatus === 'ABSENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-golden-sand/40 text-amber-900 border border-golden-sand">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Proctoring & Infringements */}
                      <td className="py-4 px-4">
                        {p.tabSwitches > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black text-red-700 bg-red-100">
                            ⚠️ {p.tabSwitches} switch{p.tabSwitches > 1 ? 'es' : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-bold">
                            ✓ Clean
                          </span>
                        )}
                        <div className="text-[10px] text-onyx/40 mt-0.5">
                          Score: {p.score} pts
                        </div>
                      </td>

                      {/* Quick Attendance Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(p.id, 'PRESENT')}
                            disabled={p.attendanceStatus === 'PRESENT'}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              p.attendanceStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'hover:bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(p.id, 'ABSENT')}
                            disabled={p.attendanceStatus === 'ABSENT'}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              p.attendanceStatus === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'hover:bg-red-50 text-red-600 border border-red-200'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          {/* Pending Reset Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(p.id, 'PENDING')}
                            disabled={p.attendanceStatus === 'PENDING'}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              p.attendanceStatus === 'PENDING'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'hover:bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                            title="Reset to Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {/* Delete from roster */}
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ isOpen: true, participant: p, isSubmitting: false })}
                            className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/40 hover:text-red-600 transition-colors cursor-pointer ml-1"
                            title="Remove registration from contest"
                          >
                            <Trash2 className="w-4 h-4" />
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
            Showing {participants.length} of {totalParticipants} participants
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoadingParticipants}
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
              disabled={currentPage >= totalPages || isLoadingParticipants}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-onyx/10 bg-white hover:bg-onyx/5 text-onyx font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Participant Modal */}
      {deleteModal.isOpen && deleteModal.participant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-onyx/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">Remove Participant</h3>
                  <p className="text-xs text-onyx/50 font-medium">Contest roster deletion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, participant: null, isSubmitting: false })}
                className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/50 hover:text-onyx cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-onyx/80">
              <p>
                Are you sure you want to remove{' '}
                <strong className="text-onyx font-black">
                  {deleteModal.participant.fullName} ({deleteModal.participant.participantId || deleteModal.participant.studentIdNumber})
                </strong>{' '}
                from this contest?
              </p>
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-medium space-y-1">
                <p className="font-bold">Database effect:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Participant record will be deleted from this contest</li>
                  <li>Contest registeredCount will be automatically decremented</li>
                  <li>Attendance in other contests is unaffected</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleteModal.isSubmitting}
                onClick={() => setDeleteModal({ isOpen: false, participant: null, isSubmitting: false })}
                className="px-4 py-2.5 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.isSubmitting}
                onClick={handleConfirmRemoveParticipant}
                className="px-5 py-2.5 rounded-2xl bg-tomato-jam hover:bg-tomato-jam/90 font-black text-xs text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {deleteModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
