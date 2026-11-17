'use client';

import React from 'react';
import {
  Users,
  Shield,
  Trophy,
  UserCheck,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  totalContests: number;
  upcomingContests: number;
  liveContests: number;
  endedContests: number;
  totalRegistrations: number;
}

interface RecentRegistration {
  id: string;
  participantId: string | null;
  fullName: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  contest: {
    id: string;
    title: string;
    platform: string;
  };
  student: {
    name: string;
    username: string | null;
    rollNumber: string | null;
    department: string;
  };
}

interface RecentContest {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  status: string;
  registeredCount: number;
  maxParticipants: number | null;
  venue: string | null;
  isInternal: boolean;
}

interface AdminOverviewProps {
  stats: AdminStats | null;
  recentRegistrations: RecentRegistration[];
  recentContests: RecentContest[];
  isSuperAdmin: boolean;
  onNavigateTab: (tab: 'users' | 'contests' | 'attendance', contestId?: string) => void;
}

export function AdminOverview({
  stats,
  recentRegistrations,
  recentContests,
  isSuperAdmin,
  onNavigateTab,
}: AdminOverviewProps) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Privileges Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-amethyst via-[#2B1B3D] to-onyx p-6 md:p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-golden-sand/20 text-golden-sand border border-golden-sand/30">
              <Sparkles className="w-3.5 h-3.5" />
              {isSuperAdmin ? 'Superadmin Headquarters' : 'Admin Control Center'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              System &amp; Event Operations
            </h2>
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              Monitor campus competitive programming activity, curate upcoming contests, oversee participants, and maintain student attendance rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('contests')}
              className="px-4 py-2.5 rounded-2xl bg-tomato-jam hover:bg-tomato-jam/90 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Manage Contests</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-golden-sand font-extrabold text-sm border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-tomato-jam/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="group relative bg-white rounded-3xl p-5 border border-onyx/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-tomato-jam/10 text-tomato-jam flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-onyx/50 flex items-center gap-1 group-hover:text-tomato-jam transition-colors">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-onyx">{stats.totalUsers}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-onyx/60">Registered Users</div>
          </div>
          <div className="mt-3 pt-3 border-t border-onyx/5 flex items-center justify-between text-xs font-semibold text-onyx/70">
            <span>Students: <strong className="text-onyx">{stats.totalStudents}</strong></span>
            <span>Admins: <strong className="text-tomato-jam">{stats.totalAdmins}</strong></span>
          </div>
        </div>

        {/* Administrative Roles */}
        <div
          onClick={() => onNavigateTab('users')}
          className="group relative bg-white rounded-3xl p-5 border border-onyx/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-pine-teal/10 text-pine-teal flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-onyx/50 flex items-center gap-1 group-hover:text-pine-teal transition-colors">
              RBAC <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-onyx">{stats.totalAdmins + stats.totalSuperAdmins}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-onyx/60">Privileged Staff</div>
          </div>
          <div className="mt-3 pt-3 border-t border-onyx/5 flex items-center justify-between text-xs font-semibold text-onyx/70">
            <span>Superadmins: <strong className="text-onyx">{stats.totalSuperAdmins}</strong></span>
            <span>Admins: <strong className="text-pine-teal">{stats.totalAdmins}</strong></span>
          </div>
        </div>

        {/* Contests */}
        <div
          onClick={() => onNavigateTab('contests')}
          className="group relative bg-white rounded-3xl p-5 border border-onyx/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-golden-sand/40 text-onyx flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-onyx/50 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-onyx">{stats.totalContests}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-onyx/60">Total Contests</div>
          </div>
          <div className="mt-3 pt-3 border-t border-onyx/5 flex items-center justify-between text-xs font-semibold text-onyx/70">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live: <strong className="text-emerald-600">{stats.liveContests}</strong>
            </span>
            <span>Upcoming: <strong className="text-onyx">{stats.upcomingContests}</strong></span>
          </div>
        </div>

        {/* Total Contest Registrations */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="group relative bg-white rounded-3xl p-5 border border-onyx/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-onyx/50 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
              Roster <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-onyx">{stats.totalRegistrations}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-onyx/60">Total Registrations</div>
          </div>
          <div className="mt-3 pt-3 border-t border-onyx/5 flex items-center justify-between text-xs font-semibold text-onyx/70">
            <span>Ended Events: <strong className="text-onyx">{stats.endedContests}</strong></span>
            <span className="text-emerald-700 font-bold">Active Attendance</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contests Card */}
        <div className="bg-white rounded-3xl p-6 border border-onyx/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-onyx/5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-golden-sand/30 flex items-center justify-center text-onyx">
                  <Calendar className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">Contest Schedules</h3>
                  <p className="text-xs text-onyx/50 font-medium">Recent and upcoming campus events</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('contests')}
                className="text-xs font-bold text-tomato-jam hover:underline cursor-pointer"
              >
                View Contests
              </button>
            </div>

            {recentContests.length === 0 ? (
              <div className="py-10 text-center text-xs text-onyx/50 font-bold">
                No contests created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentContests.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onNavigateTab('attendance', c.id)}
                    className="p-3.5 rounded-2xl bg-[#FFFDF8] hover:bg-golden-sand/15 border border-onyx/5 hover:border-golden-sand/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-onyx truncate group-hover:text-tomato-jam transition-colors">
                          {c.title}
                        </span>
                        {c.status === 'LIVE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 animate-pulse">
                            Live
                          </span>
                        )}
                        {c.status === 'UPCOMING' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-golden-sand/40 text-onyx">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-onyx/60 font-medium">
                        <span>{c.platform}</span>
                        <span>•</span>
                        <span>{new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{c.venue || 'TBD'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-onyx block">
                        {c.registeredCount}/{c.maxParticipants || 50}
                      </span>
                      <span className="text-[10px] font-bold text-onyx/50 uppercase">Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-onyx/5 flex items-center justify-between text-xs">
            <span className="text-onyx/60 font-medium">Click any contest to open attendance management</span>
            <button
              type="button"
              onClick={() => onNavigateTab('contests')}
              className="font-bold text-tomato-jam hover:underline cursor-pointer"
            >
              All Contests →
            </button>
          </div>
        </div>

        {/* Recent Registrations Card */}
        <div className="bg-white rounded-3xl p-6 border border-onyx/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-onyx/5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">Recent Registrations</h3>
                  <p className="text-xs text-onyx/50 font-medium">Latest participant signups</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View Roster
              </button>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="py-10 text-center text-xs text-onyx/50 font-bold">
                No registrations found.
              </div>
            ) : (
              <div className="space-y-3">
                {recentRegistrations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-onyx/5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-onyx truncate">
                          {r.fullName || r.student.name}
                        </span>
                        {r.participantId && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-onyx/5 text-onyx/80">
                            {r.participantId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-onyx/60 font-medium">
                        <span className="truncate">{r.contest.title}</span>
                        <span>•</span>
                        <span>{r.student.department || 'CSE'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        r.status === 'ACTIVE' || r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : r.status === 'DISQUALIFIED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-golden-sand/40 text-onyx'
                      }`}>
                        {r.status === 'ACTIVE' ? 'Present' : r.status === 'DISQUALIFIED' ? 'Absent' : 'Pending'}
                      </span>
                      <span className="text-[10px] text-onyx/40 block mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-onyx/5 flex items-center justify-between text-xs">
            <span className="text-onyx/60 font-medium">Attendance records persist per contest</span>
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Full Roster →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
