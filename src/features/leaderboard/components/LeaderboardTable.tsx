/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, Department } from '@/types';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import {
  Search,
  Flame,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface LeaderboardTableProps {
  users: UserProfile[];
  onSelectUser?: (user: UserProfile) => void;
  defaultDepartment?: Department | 'ALL';
}

export function LeaderboardTable({
  users,
  onSelectUser,
  defaultDepartment = 'ALL',
}: LeaderboardTableProps) {
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>(defaultDepartment);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'cpScore' | 'solved' | 'streak'>('cpScore');

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const departments: (Department | 'ALL')[] = [
    'ALL',
    'CSE',
    'IT',
    'ECE',
    'AI&DS',
    'EE',
    'ME',
  ];

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesDept = selectedDept === 'ALL' || user.department === selectedDept;
        const matchesSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.tier.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'cpScore') return b.cpScore - a.cpScore;
        if (sortBy === 'solved')
          return b.solvedByDifficulty.total - a.solvedByDifficulty.total;
        if (sortBy === 'streak') return b.currentStreak - a.currentStreak;
        return 0;
      });
  }, [users, selectedDept, searchQuery, sortBy]);

  // Smooth entrance of table rows when filtered or rendered (GPU transforms)
  useGSAP(
    () => {
      gsap.fromTo('.leaderboard-row', 
        {
          x: -15,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    },
    { dependencies: [selectedDept, sortBy, searchQuery], scope: tableContainerRef, revertOnUpdate: true }
  );

  const { contextSafe } = useGSAP({ scope: tableContainerRef });

  const handleRowEnter = contextSafe((e: React.MouseEvent<HTMLTableRowElement>) => {
    const avatar = e.currentTarget.querySelector('.row-avatar');
    const score = e.currentTarget.querySelector('.row-score');
    gsap.to(e.currentTarget, {
      x: 6,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (avatar) {
      gsap.to(avatar, {
        scale: 1.15,
        rotation: 6,
        duration: 0.3,
        ease: 'back.out(2.5)',
      });
    }
    if (score) {
      gsap.to(score, {
        scale: 1.08,
        duration: 0.25,
        ease: 'back.out(2)',
      });
    }
  });

  const handleRowLeave = contextSafe((e: React.MouseEvent<HTMLTableRowElement>) => {
    const avatar = e.currentTarget.querySelector('.row-avatar');
    const score = e.currentTarget.querySelector('.row-score');
    gsap.to(e.currentTarget, {
      x: 0,
      duration: 0.2,
      ease: 'power2.out',
    });
    if (avatar) {
      gsap.to(avatar, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
    if (score) {
      gsap.to(score, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  });

  const handlePillEnter = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      y: -2,
      scale: 1.06,
      duration: 0.25,
      ease: 'back.out(3)',
    });
  });

  const handlePillLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  });

  return (
    <div
      ref={tableContainerRef}
      className="w-full rounded-2xl bg-white border border-onyx/12 shadow-sm overflow-hidden"
    >
      {/* Header Filters */}
      <div className="p-5 border-b border-onyx/12 bg-golden-sand/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Department filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {departments.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                onMouseEnter={handlePillEnter}
                onMouseLeave={handlePillLeave}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer will-change-transform ${
                  isSelected
                    ? 'bg-dark-amethyst text-white shadow-xs'
                    : 'bg-white text-onyx/70 hover:bg-golden-sand/15 border border-onyx/12'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onyx/70" />
            <input
              type="text"
              placeholder="Search student, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-onyx/12 bg-white text-xs font-medium focus:outline-none focus:border-tomato-jam w-full sm:w-56"
            />
          </div>

          {/* Simple Sort Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-white border border-onyx/12 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setSortBy('cpScore')}
              onMouseEnter={handlePillEnter}
              onMouseLeave={handlePillLeave}
              className={`px-2 py-1 rounded transition-colors cursor-pointer will-change-transform ${
                sortBy === 'cpScore'
                  ? 'bg-golden-sand/15 text-dark-amethyst font-bold'
                  : 'text-onyx/70'
              }`}
            >
              C Score
            </button>
            <button
              onClick={() => setSortBy('solved')}
              onMouseEnter={handlePillEnter}
              onMouseLeave={handlePillLeave}
              className={`px-2 py-1 rounded transition-colors cursor-pointer will-change-transform ${
                sortBy === 'solved'
                  ? 'bg-golden-sand/15 text-dark-amethyst font-bold'
                  : 'text-onyx/70'
              }`}
            >
              Solved
            </button>
            <button
              onClick={() => setSortBy('streak')}
              onMouseEnter={handlePillEnter}
              onMouseLeave={handlePillLeave}
              className={`px-2 py-1 rounded transition-colors cursor-pointer will-change-transform ${
                sortBy === 'streak'
                  ? 'bg-golden-sand/15 text-dark-amethyst font-bold'
                  : 'text-onyx/70'
              }`}
            >
              Streak
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-onyx/12 bg-golden-sand/5 text-[11px] font-bold uppercase tracking-wider text-onyx/70">
              <th className="py-3 px-4 text-center w-14">Rank</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Level & Tier</th>
              <th className="py-3 px-4 text-center">Streak</th>
              <th className="py-3 px-4 text-right">Problems Solved</th>
              <th className="py-3 px-6 text-right">CP Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pine-teal/8 text-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-onyx/70 text-sm">
                  No students found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser && onSelectUser(user)}
                    onMouseEnter={handleRowEnter}
                    onMouseLeave={handleRowLeave}
                    className="leaderboard-row hover:bg-golden-sand/5 transition-colors cursor-pointer group will-change-transform"
                  >
                    {/* Rank column */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-golden-sand text-onyx shadow-sm font-black text-xs">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pine-teal text-white shadow-sm font-black text-xs">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-onyx text-white shadow-sm font-black text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-onyx/70 font-semibold text-xs">
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="row-avatar w-9 h-9 rounded-full object-cover ring-1 ring-pine-teal/20 will-change-transform"
                        />
                        <div>
                          <p className="font-bold text-onyx group-hover:text-tomato-jam transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-onyx/70 font-medium">
                            {user.year} • NSEC College
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Dept */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-golden-sand/20 text-dark-amethyst">
                        {user.department}
                      </span>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4">
                      <LevelBadge level={user.level} tier={user.tier} size="sm" />
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-golden-sand/10 text-dark-amethyst border border-golden-sand/30 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 fill-tomato-jam text-tomato-jam" />
                        <span>{user.currentStreak}d</span>
                      </div>
                    </td>

                    {/* Solved Problems */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-onyx">
                          {user.solvedByDifficulty.total}
                        </span>
                        <span className="text-[10px] text-onyx/70">
                          {user.solvedByDifficulty.hard} Hard • {user.solvedByDifficulty.medium} Med
                        </span>
                      </div>
                    </td>

                    {/* CP Score */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="row-score inline-block text-base font-black text-tomato-jam group-hover:underline will-change-transform">
                        {user.cpScore.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
