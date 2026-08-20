/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import { MascotRenderer } from '@/features/gamification/components/MascotRenderer';
import { Heatmap } from '@/features/profile/components/Heatmap';
import { StatsGrid } from '@/features/profile/components/StatsGrid';
import {
  Flame,
  Trophy,
} from 'lucide-react';

export default function ProfilePage() {
  const { user: CURRENT_USER } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'activities'>('overview');

  return (
    <div className="space-y-8 pb-12">
      {/* Student Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-onyx text-white p-6 sm:p-8 shadow-md border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User main info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-tomato-jam/40 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-1 bg-tomato-jam text-white p-1.5 rounded-full shadow-md" title="NSEC CSE Champion">
                <Trophy className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {CURRENT_USER.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-golden-sand border border-white/15">
                  {CURRENT_USER.department} • {CURRENT_USER.year}
                </span>
                {CURRENT_USER.rollNumber && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                    Roll: {CURRENT_USER.rollNumber}
                  </span>
                )}
                {CURRENT_USER.graduationYear && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                    Class of {CURRENT_USER.graduationYear}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 font-medium">
                {CURRENT_USER.email} • Netaji Subhash Engineering College
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <LevelBadge
                  level={CURRENT_USER.level}
                  tier={CURRENT_USER.tier}
                  size="md"
                  showMascotName={true}
                />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/15">
                  <Flame className="w-3.5 h-3.5 text-tomato-jam fill-current" />
                  <span>{CURRENT_USER.currentStreak}-Day Active Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CP Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-white/50">CP Score</p>
              <p className="text-lg sm:text-xl font-black text-golden-sand">
                {CURRENT_USER.cpScore.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40">Tier: {CURRENT_USER.tier}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-white/50">College Rank</p>
              <p className="text-lg sm:text-xl font-black text-white">
                #{CURRENT_USER.collegeRank}
              </p>
              <p className="text-[10px] text-golden-sand">Top 0.5%</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-white/50">Dept Position</p>
              <p className="text-lg sm:text-xl font-black text-golden-sand">
                #{CURRENT_USER.deptRank}
              </p>
              <p className="text-[10px] text-white/40">{CURRENT_USER.department} Champion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-onyx/12 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-tomato-jam text-white shadow-xs'
              : 'text-onyx/70 hover:bg-golden-sand/12 hover:text-onyx'
          }`}
        >
          Overview & Codolio Stats
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-tomato-jam text-white shadow-xs'
              : 'text-onyx/70 hover:bg-golden-sand/12 hover:text-onyx'
          }`}
        >
          Achievement Badges ({CURRENT_USER.badges.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-tomato-jam text-white shadow-xs'
              : 'text-onyx/70 hover:bg-golden-sand/12 hover:text-onyx'
          }`}
        >
          Recent Activity & Write-ups
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Mascot Evolution Card */}
          <div className="rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-tomato-jam">
                  Current Tier Companion
                </span>
                <h3 className="text-xl font-black text-onyx">
                  Level {CURRENT_USER.level} Mascot: FLAMIRO (The Flame Bird)
                </h3>
                <p className="text-xs sm:text-sm text-onyx/70">
                  Your mascot evolves as you solve problems and maintain consistency! Reaching{' '}
                  <strong>26,500 points (Level 51)</strong> will evolve FLAMIRO into{' '}
                  <span className="text-tomato-jam font-bold">PYRAVIAN (The Inferno Phoenix)</span>.
                </p>
              </div>
              <div className="w-full md:w-80">
                <MascotRenderer tier={CURRENT_USER.tier} size="md" showCard={true} />
              </div>
            </div>
          </div>

          {/* ACTIVITY HEATMAP */}
          <Heatmap
            studentId={CURRENT_USER.id}
            currentStreak={CURRENT_USER.currentStreak}
            maxStreak={CURRENT_USER.maxStreak}
            totalSolved={CURRENT_USER.solvedByDifficulty.total}
          />

          {/* CODOLIO INSPIRED STATS & DSA BREAKDOWN */}
          <StatsGrid user={CURRENT_USER} />
        </div>
      )}

      {/* TAB CONTENT: BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-onyx">
              Unlocked Achievement Badges
            </h3>
            <p className="text-xs text-onyx/70 mt-0.5">
              Awards for milestones like unlocking tiers, winning contests, or maintaining long solving streaks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURRENT_USER.badges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-2xl bg-white border border-onyx/12 p-5 shadow-sm hover:border-tomato-jam/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-golden-sand/15 border border-onyx/12 flex items-center justify-center text-2xl mb-3 shadow-2xs">
                    {badge.icon}
                  </div>
                  <h4 className="font-bold text-onyx">{badge.title}</h4>
                  <p className="text-xs text-onyx/70 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-onyx/12 flex items-center justify-between text-[11px] text-onyx/70">
                  <span>Category: {badge.category}</span>
                  <span className="text-tomato-jam font-semibold">{badge.unlockedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVITIES & WRITE-UPS */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-onyx">
              Recent Solution Submissions & Write-ups
            </h3>
            <p className="text-xs text-onyx/70 mt-0.5">
              History of accepted algorithmic solutions across synced platforms.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-onyx/12 p-6 shadow-sm divide-y divide-pine-teal/15">
            {CURRENT_USER.recentActivities.map((act) => (
              <div
                key={act.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-golden-sand/20 text-tomato-jam border border-onyx/12 uppercase">
                      {act.type}
                    </span>
                    {act.platform && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-golden-sand/20 text-onyx">
                        {act.platform}
                      </span>
                    )}
                    <span className="text-xs text-onyx/70">{act.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-onyx text-sm">{act.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-tomato-jam">
                    +{act.pointsEarned} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
