'use client';

import React, { useState } from 'react';
import { FAKE_CONTESTS } from '@/lib/constants';
import { ContestCalendar } from '@/features/calendar/components/ContestCalendar';
import {
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';

export default function ContestsPage() {
  const [filter, setFilter] = useState<'ALL' | 'Internal' | 'Codeforces' | 'LeetCode' | 'CodeChef'>('ALL');

  const filteredContests = FAKE_CONTESTS.filter((cnt) => {
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
          <p className="text-sm text-onyx/70 mt-1 max-w-2xl">
            Live schedule of algorithmic challenges across Codeforces, LeetCode, CodeChef, and internal NSEC inter-department cups.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {(['ALL', 'Internal', 'Codeforces', 'LeetCode', 'CodeChef'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === item
                  ? 'bg-tomato-jam text-white shadow-sm'
                  : 'bg-white text-onyx border border-onyx/12 hover:border-pine-teal/50'
              }`}
            >
              {item === 'Internal' ? '🏆 NSEC Avahan Cup' : item}
            </button>
          ))}
        </div>
      </div>

      {/* Featured NSEC Flagship Contest Card */}
      <div className="relative overflow-hidden rounded-3xl bg-onyx text-white p-6 sm:p-8 shadow-md border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-golden-sand" />
              <span>NSEC Flagship Algorithmic Championship</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              NSEC Avahan Cup 2026 — Inter-Department Battle
            </h2>
            <p className="text-sm sm:text-base text-golden-sand mt-2 leading-relaxed">
              Represent your department (CSE, IT, ECE, AI&DS, EE, ME) in our 3-hour live coding match! The winning department unlocks an exclusive{' '}
              <span className="underline decoration-golden-sand font-bold text-white">
                2.0x seasonal CP score multiplier
              </span>{' '}
              for the entire month.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-5 text-xs font-bold text-golden-sand">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-golden-sand" />
                August 10, 2026 @ 14:00 IST
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-golden-sand" />
                218 NSEC students registered
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center shrink-0 w-full md:w-64">
            <p className="text-xs text-golden-sand uppercase font-bold">Registration Closes In</p>
            <div className="text-3xl font-black mt-2 tracking-tight text-golden-sand">
              2d : 14h : 22m
            </div>
            <button
              onClick={() => alert('Successfully registered for NSEC Avahan Cup 2026!')}
              className="mt-4 w-full py-2.5 rounded-xl bg-tomato-jam text-white font-extrabold text-sm shadow-md hover:bg-[#E8890C] transition-colors cursor-pointer"
            >
              Register Now (Free)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Monthly Contest Calendar Bento Card */}
      <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm content-visibility-auto">
        <ContestCalendar />
      </div>

      {/* Contests Grid with deferred off-screen rendering */}
      <div className="grid grid-cols-1 gap-4 content-visibility-auto">
        {filteredContests.map((cnt) => (
          <div
            key={cnt.id}
            className={`rounded-2xl border p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 gpu-accelerated ${
              cnt.isInternal
                ? 'bg-golden-sand/10 border-onyx/12 shadow-sm'
                : 'bg-white border-onyx/12 hover:border-pine-teal/40 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    cnt.isInternal
                      ? 'bg-tomato-jam text-white shadow-2xs'
                      : 'bg-golden-sand/20 text-onyx'
                  }`}
                >
                  {cnt.platform}
                </span>
                {cnt.isInternal && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-golden-sand/20 text-tomato-jam border border-onyx/12">
                    🔥 2.0x Dept Multiplier Prize
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-onyx">{cnt.title}</h3>
              <p className="text-sm text-onyx/70 max-w-2xl">{cnt.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="text-left sm:text-right">
                <p className="text-xs text-onyx/70 font-bold uppercase">Date & Duration</p>
                <p className="text-sm font-bold text-onyx mt-0.5">
                  {new Date(cnt.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-onyx/70">{cnt.duration} • {cnt.registeredCount} enrolled</p>
              </div>

              <a
                href={cnt.url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-xs shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <span>Register</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
