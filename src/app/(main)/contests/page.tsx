'use client';

import React, { useState, useEffect } from 'react';
import { ContestCalendar } from '@/features/calendar/components/ContestCalendar';
import {
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';

interface ContestItem {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  registeredCount: number;
  isInternal: boolean;
  isRegisteredByMe?: boolean;
  url?: string;
  badge?: string;
  ratedFor?: string;
  description?: string;
}

const DEFAULT_FLAGSHIP_START = '2026-08-30T18:00:00.000Z';

export default function ContestsPage() {
  const [filter, setFilter] = useState<'ALL' | 'Internal' | 'Codeforces' | 'LeetCode' | 'CodeChef'>('ALL');
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchContestsList = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.contests)) {
          setContests(data.contests);
          const regMap: Record<string, boolean> = {};
          data.contests.forEach((c: ContestItem) => {
            if (c.isRegisteredByMe) regMap[c.id] = true;
          });
          setRegisteredMap(regMap);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContestsList();
  }, []);

  const handleRegisterContest = async (contestId: string, title: string) => {
    try {
      const res = await fetch('/api/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId }),
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredMap((prev) => ({ ...prev, [contestId]: true }));
        setToastMessage(`Enrolled successfully in ${title}!`);
        setTimeout(() => setToastMessage(null), 4000);
        fetchContestsList();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const flagshipContest = contests.find((c) => c.isInternal) || {
    id: 'flagship-default',
    title: 'NSEC Avahan Cup 2026 — Inter-Department Battle',
    platform: 'NSEC Internal',
    startTime: DEFAULT_FLAGSHIP_START,
    registeredCount: 218,
    duration: '3 hours',
    isInternal: true,
  };

  const filteredContests = contests.filter((cnt) => {
    if (filter === 'ALL') return true;
    if (filter === 'Internal') return cnt.isInternal;
    return cnt.platform === filter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-golden-sand/20 text-tomato-jam border border-onyx/12 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-tomato-jam" />
            Live Synced Match Schedule
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-onyx tracking-tight">
            Upcoming Contest Calendar
          </h1>
          <p className="text-sm text-onyx/70 mt-1 max-w-xl">
            Live auto-synced schedules from Codeforces, LeetCode, CodeChef, and internal NSEC coding rounds.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-white border border-onyx/12 text-onyx font-bold text-sm shadow-md flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-tomato-jam" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Flagship Championship Highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-onyx text-white p-6 sm:p-8 shadow-md border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tomato-jam text-white text-xs font-black uppercase tracking-wider">
              <span>🏆 College Major</span>
              <span>•</span>
              <span>2.0x Seasonal Multiplier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {flagshipContest.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Solve algorithmic challenges curated by Phoenix Tech Club seniors. Scores count 2.0x toward the inter-department seasonal championship trophy.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-golden-sand pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-tomato-jam" />
                {new Date(flagshipContest.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} ({flagshipContest.duration})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-golden-sand" />
                {flagshipContest.registeredCount} Registered Students
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              disabled={registeredMap[flagshipContest.id]}
              onClick={() => handleRegisterContest(flagshipContest.id, flagshipContest.title)}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-transform cursor-pointer ${
                registeredMap[flagshipContest.id]
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-tomato-jam text-white hover:scale-105 shadow-tomato-jam/30'
              }`}
            >
              {registeredMap[flagshipContest.id] ? 'Enrolled in Championship ✓' : 'Register for Championship'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Multi-Platform Calendar on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-onyx/12 shadow-sm">
          <ContestCalendar />
        </div>

        {/* Filterable Contest List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'Internal', 'Codeforces', 'LeetCode', 'CodeChef'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-tomato-jam text-white shadow-xs'
                    : 'bg-white border border-onyx/12 text-onyx/70 hover:bg-golden-sand/15'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-onyx/12 text-xs font-bold text-onyx/50">
                Loading live contests...
              </div>
            ) : filteredContests.length > 0 ? (
              filteredContests.map((c) => {
                const isReg = registeredMap[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white border border-onyx/12 shadow-2xs space-y-2 hover:border-onyx/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-golden-sand/25 text-onyx">
                        {c.platform}
                      </span>
                      <span className="text-[10px] font-bold text-onyx/60">
                        {new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {c.duration}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-onyx leading-snug">
                      {c.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-onyx/8">
                      <span className="text-[11px] font-semibold text-onyx/70">
                        {c.registeredCount || 0} registered
                      </span>

                      {c.url && c.url.startsWith('http') ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-tomato-jam hover:underline"
                        >
                          <span>Open Round</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled={isReg}
                          onClick={() => handleRegisterContest(c.id, c.title)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            isReg
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-tomato-jam text-white hover:bg-[#E8890C]'
                          }`}
                        >
                          {isReg ? 'Enrolled ✓' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-onyx/12 text-xs font-bold text-onyx/50">
                No contests found for this filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
