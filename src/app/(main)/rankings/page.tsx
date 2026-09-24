/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getLeaderboard } from '@/lib/api';
import { Podium } from '@/features/leaderboard/components/Podium';
import { LeaderboardTable } from '@/features/leaderboard/components/LeaderboardTable';
import { ContestCalendar } from '@/features/calendar/components/ContestCalendar';
import { UserProfile, DepartmentStat } from '@/types';
import { useUser } from '@/components/providers/UserProvider';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import {
  Trophy,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

export default function RankingsPage() {
  const { user: CURRENT_USER } = useUser();
  const router = useRouter();
  const [visualTab] = useState<'podium' | 'battles'>('podium');
  const [selectedDeptYear, setSelectedDeptYear] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [topDeptInfo, setTopDeptInfo] = useState<{ department: string; seasonalMultiplier: number; averageScore: number }>({
    department: 'CSE',
    seasonalMultiplier: 2.0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [users, statsRes] = await Promise.all([
        getLeaderboard(30),
        fetch('/api/dashboard').then((r) => r.json()),
      ]);
      setLeaderboardUsers(users);
      if (statsRes.success && statsRes.summary) {
        if (Array.isArray(statsRes.summary.departmentStats)) {
          setDepartmentStats(
            statsRes.summary.departmentStats.map((d: any, idx: number) => ({
              name: d.department,
              rank: idx + 1,
              averageRating: d.averageScore || 0,
              totalSolved: d.totalSolved || 0,
              topCoderName: d.topCoderName || 'NSEC Student',
              topCoderScore: d.topCoderScore || 0,
              seasonalMultiplier: d.seasonalMultiplier || (idx === 0 ? 2.0 : idx === 1 ? 1.75 : 1.5),
              activeStudentsCount: d.studentCount || 0,
            }))
          );
        }
        if (statsRes.summary.topDepartment) {
          setTopDeptInfo(statsRes.summary.topDepartment);
        }
      }
    } catch (err) {
      console.error('Failed to fetch rankings', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Dynamically sync the logged-in user with live leaderboard data
  const displayLeaderboardUsers = useMemo(() => {
    return leaderboardUsers.map((u) => {
      if (CURRENT_USER.id && u.id === CURRENT_USER.id) {
        return {
          ...u,
          ...CURRENT_USER,
          id: u.id,
          collegeRank: u.collegeRank || CURRENT_USER.collegeRank,
          deptRank: u.deptRank || CURRENT_USER.deptRank,
        };
      }
      return u;
    });
  }, [leaderboardUsers, CURRENT_USER]);

  // Trigger real Live API Sync
  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      // Trigger live sync
      const res = await fetch('/api/student/sync', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Sync failed');
      }
      await loadData();
      setToastMessage('Leaderboard standings synchronized with Codeforces, LeetCode & CodeChef!');
    } catch {
      setToastMessage('Sync failed. Please try again later.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleViewProfile = (user: UserProfile) => {
    router.push(`/rankings/${user.id}`);
  };

  // Filter user's department students dynamically from database records
  const cseUsers = useMemo(() => {
    return displayLeaderboardUsers
      .filter((u) => u.department === (CURRENT_USER.department || 'CSE'))
      .filter((user) => selectedDeptYear === 'ALL' || user.year === selectedDeptYear)
      .sort((a, b) => b.cpScore - a.cpScore);
  }, [displayLeaderboardUsers, CURRENT_USER.department, selectedDeptYear]);

  const userDeptStat = useMemo(() => {
    const found = departmentStats.find((d) => d.name === (CURRENT_USER.department || 'CSE'));
    if (found) return found;
    return {
      name: (CURRENT_USER.department || 'CSE') as any,
      rank: 1,
      averageRating: topDeptInfo.averageScore || 0,
      totalSolved: 0,
      topCoderName: CURRENT_USER.name || 'NSEC Student',
      topCoderScore: CURRENT_USER.cpScore || 0,
      seasonalMultiplier: topDeptInfo.seasonalMultiplier || 2.0,
      activeStudentsCount: 1,
    };
  }, [departmentStats, CURRENT_USER, topDeptInfo]);

  if (isLoading) {
    return <CapybaraLoader />;
  }

  return (
    <div className="space-y-6 pb-14">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight">
            Rankings & Contests
          </h1>
          <p className="text-xs sm:text-sm text-onyx/70 mt-0.5 max-w-2xl">
            Live student leaderboards, seasonal department multipliers, and active contest schedule matching the clean white Bento card aesthetic.
          </p>
        </div>

        {/* Live Sync Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLiveSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-tomato-jam hover:bg-[#E8890C] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Platforms...' : 'Sync CP Standings'}</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: Ranking Visual on Left (7 Cols) + Clean Calendar on Right (5 Cols) with self-start (ZERO stretching) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLUMNS: The Ranking Visual Card */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm relative overflow-hidden self-start">
          {/* Subtle decorative background blur circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-golden-sand/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-tomato-jam/10 blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-tomato-jam">
                🏆 Top Performers &amp; Department Multipliers
              </span>
              <h2 className="text-lg sm:text-xl font-black text-onyx mt-0.5">
                Top 3 Students
              </h2>
            </div>
          </div>

          {/* TOP 3 PODIUM VISUAL */}
          <div className="relative z-10 py-2">
            <Podium users={displayLeaderboardUsers} onSelectUser={handleViewProfile} />
          </div>

          {/* TAB 2: DEPARTMENT BATTLE BUBBLES VISUALIZER */}
          {visualTab === 'battles' && (
            <div className="relative z-10 space-y-3 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departmentStats.map((dept) => (
                  <div
                    key={dept.name}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      dept.rank === 1
                        ? 'bg-[#FFF1D6] text-onyx border-tomato-jam/40 shadow-xs'
                        : 'bg-white text-onyx border-onyx/12'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black">{dept.name}</span>
                        {dept.rank === 1 && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-tomato-jam text-white">
                            #1 Champion
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          dept.rank === 1
                            ? 'bg-golden-sand/25 text-onyx'
                            : 'bg-golden-sand/20 text-tomato-jam'
                        }`}
                      >
                        {dept.seasonalMultiplier}x Bonus
                      </span>
                    </div>

                    <p className="text-[11px] font-bold opacity-80 mb-2">
                      Avg Rating: {dept.averageRating} • {dept.totalSolved.toLocaleString()} Solved
                    </p>

                    {/* Progress Bar comparing department dominance */}
                    <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          dept.rank === 1
                            ? 'bg-tomato-jam'
                            : dept.rank === 2
                            ? 'bg-pine-teal'
                            : 'bg-golden-sand'
                        }`}
                        style={{ width: `${Math.max(100 - (dept.rank - 1) * 20, 30)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* Bottom legend note */}
          <div className="relative z-10 pt-3 mt-3 border-t border-onyx/10 flex items-center justify-between text-[11px] text-onyx/70">
            <span suppressHydrationWarning>{CURRENT_USER.name}: #{CURRENT_USER.collegeRank} Overall College Ranking</span>
            <span className="font-bold text-pine-teal">● Live Sync Active</span>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: Professional White Contest Calendar Component with self-start (ZERO stretching) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm self-start" suppressHydrationWarning>
          <ContestCalendar />
        </div>
      </div>

      {/* BOTTOM ROW: 70% Global All Students List on Left + 30% User's Department (CSE) on Right (both self-start, zero stretch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (8 COLUMNS): Whole List of ALL Students */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm self-start content-visibility-auto">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pine-teal">
                  🌐 College Global Standings
                </span>
                <h2 className="text-xl font-black text-onyx mt-0.5">
                  Ranked Students
                </h2>
                <p className="text-xs text-onyx/70 mt-0.5">
                  Showing top 30 registered programmers across all departments ordered by indexed total score.
                </p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-golden-sand/20 text-onyx font-black text-xs border border-onyx/12 shrink-0">
                Top {leaderboardUsers.length} Students
              </div>
            </div>
          </div>

          {/* LeaderboardTable rendering ALL departments */}
          <LeaderboardTable
            users={displayLeaderboardUsers}
            onSelectUser={handleViewProfile}
            defaultDepartment="ALL"
          />

          {/* Table Footer */}
          <div className="pt-3 mt-3 border-t border-onyx/10 flex items-center justify-between text-xs text-onyx/60">
            <span>Click any student row to inspect multi-platform CP scores and solved problems.</span>
            <span className="font-bold text-onyx">Rankings Updated Live</span>
          </div>
        </div>

        {/* RIGHT (4 COLUMNS): User's Department Standings & Rules */}
        <div className="lg:col-span-4 space-y-6 self-start content-visibility-auto">
          {/* Card 1: Dept Leaderboard with Year Filter */}
          <div className="rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm self-start">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-tomato-jam">
                🏛️ Your Department
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tomato-jam/15 text-tomato-jam text-[10px] font-black border border-tomato-jam/30">
                {CURRENT_USER.department || 'CSE'} ONLY • {userDeptStat.seasonalMultiplier.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-black text-onyx">
                {CURRENT_USER.department || 'CSE'} Dept Leaderboard
              </h3>

              {/* Year Filter Switcher */}
              <select
                value={selectedDeptYear}
                onChange={(e) => setSelectedDeptYear(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-[#FFF1D6] border border-onyx/15 text-xs font-bold text-onyx focus:outline-none focus:ring-1 focus:ring-tomato-jam cursor-pointer"
              >
                <option value="ALL">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <p className="text-xs text-onyx/70 mt-0.5">
              Showing {CURRENT_USER.department || 'Computer Science'} students (30% department view).
            </p>

            {/* Vertical Department Standings List */}
            <div className="mt-4 space-y-2.5">
              {cseUsers.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-onyx/60 bg-[#FFF1D6] rounded-2xl border border-onyx/10">
                  No students found in this year group.
                </div>
              ) : (
                cseUsers.map((user, idx) => {
                  const isCurrentUser = user.id === CURRENT_USER.id;
                  const rankNum = idx + 1;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleViewProfile(user)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrentUser
                          ? 'bg-golden-sand/20 border-2 border-tomato-jam/60 shadow-2xs'
                          : 'bg-[#FFF1D6] border-onyx/10 hover:border-onyx/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Dept Rank Circle */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            rankNum === 1
                              ? 'bg-golden-sand text-onyx'
                              : rankNum === 2
                              ? 'bg-onyx text-white'
                              : 'bg-onyx/10 text-onyx'
                          }`}
                        >
                          #{rankNum}
                        </div>

                        {/* Avatar & Name */}
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-onyx/15 shrink-0"
                          loading="lazy"
                        />

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-onyx">{user.name}</h4>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded bg-tomato-jam text-white text-[9px] font-extrabold">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-onyx/60">
                            {user.year} • {user.solvedByDifficulty.total} solved
                          </p>
                        </div>
                      </div>

                      {/* Score & Streak */}
                      <div className="text-right">
                        <p className="text-xs font-black text-tomato-jam">
                          {user.cpScore.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-onyx/60">
                          🔥 {user.currentStreak}d
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dept Stats Footer */}
            <div className="mt-4 pt-3 border-t border-onyx/10 flex items-center justify-between text-xs font-bold text-onyx/70">
              <span>Avg Rating: {userDeptStat.averageRating.toLocaleString()}</span>
              <span className="text-tomato-jam">#{userDeptStat.rank} in College 🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-golden-sand shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

