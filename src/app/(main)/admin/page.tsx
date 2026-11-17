'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUser } from '@/components/providers/UserProvider';
import {
  LayoutDashboard,
  Users,
  Trophy,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminContests } from '@/components/admin/AdminContests';
import { AdminAttendance } from '@/components/admin/AdminAttendance';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { user: CURRENT_USER } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contests' | 'attendance'>('overview');
  const [selectedContestForAttendance, setSelectedContestForAttendance] = useState<string | null>(null);

  // Stats for the Overview tab
  const [statsData, setStatsData] = useState<{
    stats: {
      totalUsers: number;
      totalStudents: number;
      totalAdmins: number;
      totalSuperAdmins: number;
      totalContests: number;
      upcomingContests: number;
      liveContests: number;
      endedContests: number;
      totalRegistrations: number;
    } | null;
    recentRegistrations: Array<{
      id: string;
      participantId: string | null;
      fullName: string | null;
      email: string | null;
      status: string;
      createdAt: string;
      contest: { id: string; title: string; platform: string };
      student: { name: string; username: string | null; rollNumber: string | null; department: string };
    }>;
    recentContests: Array<{
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
    }>;
  } | null>(null);

  // Global Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Determine user's role from session or database profile
  const userRole = (session?.user as { role?: 'STUDENT' | 'ADMIN' | 'SUPERADMIN' } | undefined)?.role || CURRENT_USER.role || 'STUDENT';
  const isSuperAdmin = userRole === 'SUPERADMIN';
  const isAdmin = userRole === 'ADMIN' || isSuperAdmin;

  // Load Overview statistics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatsData({
            stats: data.stats,
            recentRegistrations: data.recentRegistrations || [],
            recentContests: data.recentContests || [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  // Loading Session / User State
  if (status === 'loading') {
    return <CapybaraLoader />;
  }

  // Strictly Block Regular Users from Accessing Admin Dashboard
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-onyx/10 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-tomato-jam mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-onyx">Administrative Privileges Required</h2>
            <p className="text-xs text-onyx/60 font-medium leading-relaxed">
              The Admin Dashboard is accessible exclusively to authorized members with the{' '}
              <strong className="text-onyx font-bold">Admin</strong> or{' '}
              <strong className="text-onyx font-bold">Superadmin</strong> role. Regular students cannot access these management controls.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-2xl bg-onyx hover:bg-onyx/90 text-golden-sand font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Notification Pill */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : 'bg-red-950 text-red-100 border-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tomato-jam animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight">
              Administration Hub
            </h1>
          </div>
          <p className="text-xs text-onyx/60 font-semibold">
            Centralized role management, contest scheduling &amp; participant attendance
          </p>
        </div>

        {/* Current Admin Role Pill */}
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-dark-amethyst to-onyx text-golden-sand border border-golden-sand/30 shadow-sm text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-golden-sand" />
              <span>Superadmin</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-pine-teal/15 text-pine-teal border border-pine-teal/30 shadow-xs text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-pine-teal" />
              <span>Admin Staff</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 rounded-2xl border border-onyx/10 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-onyx text-golden-sand shadow-sm'
              : 'text-onyx/70 hover:bg-black/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-onyx text-golden-sand shadow-sm'
              : 'text-onyx/70 hover:bg-black/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'contests'
              ? 'bg-onyx text-golden-sand shadow-sm'
              : 'text-onyx/70 hover:bg-black/5'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Contest Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-onyx text-golden-sand shadow-sm'
              : 'text-onyx/70 hover:bg-black/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Attendance &amp; Rosters</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <AdminOverview
          stats={statsData?.stats ?? null}
          recentRegistrations={statsData?.recentRegistrations || []}
          recentContests={statsData?.recentContests || []}
          isSuperAdmin={isSuperAdmin}
          onNavigateTab={(tab, contestId) => {
            if (tab === 'attendance' && contestId) {
              setSelectedContestForAttendance(contestId);
            }
            setActiveTab(tab);
          }}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsers
          currentUserId={(session?.user as { id?: string })?.id || CURRENT_USER.id}
          viewerRole={userRole}
          isSuperAdmin={isSuperAdmin}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'contests' && (
        <AdminContests
          onSelectContestForAttendance={(contestId) => {
            setSelectedContestForAttendance(contestId);
            setActiveTab('attendance');
          }}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'attendance' && (
        <AdminAttendance
          initialContestId={selectedContestForAttendance}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
