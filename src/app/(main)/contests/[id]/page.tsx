'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Ticket,
  Lock,
  RotateCw,
} from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

interface ContestDetails {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  registeredCount: number;
  maxParticipants: number;
  spotsLeft: number;
  isInternal: boolean;
  hostedInternal: boolean;
  url?: string | null;
  linkUnlockTime?: string;
  isLinkUnlocked?: boolean;
  isEventStarted?: boolean;
  isContestEnded?: boolean;
  description?: string;
  badge?: string;
  venue?: string;
  prize?: string;
  registrationDeadline?: string;
  isRegistrationClosed?: boolean;
  displayRegisteredUsers: boolean;
  status: string;
}

interface UserRegistration {
  participantId: string;
  fullName: string;
  studentIdNumber: string;
  academicYear: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}

interface CurrentUserProfile {
  username: string;
  fullName: string;
  email: string;
  studentIdNumber: string;
  academicYear: string;
}

interface RegisteredUser {
  username: string;
  fullName: string;
  image: string | null;
  registeredAgo: string;
  createdAt: string;
}

function useCountdown(targetDateStr?: string | null) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
    totalSeconds: 0,
  });

  useEffect(() => {
    if (!targetDateStr) return;
    const target = new Date(targetDateStr).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const totalSeconds = Math.floor(diff / 1000);

      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isCompleted: totalSeconds <= 0,
        totalSeconds,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

export default function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contestId = resolvedParams.id;
  const { data: session, status: authStatus } = useSession();

  const [contest, setContest] = useState<ContestDetails | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Registration Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const fetchContestData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/contests/${contestId}`);
      if (!res.ok) {
        console.error('Failed to fetch contest:', res.status);
        return;
      }
      const data = await res.json();
      if (data.success && data.contest) {
        setContest(data.contest);
        setIsRegistered(Boolean(data.isRegistered));
        setUserRegistration(data.userRegistration || null);
        setCurrentUserProfile(data.currentUserProfile || null);
        setRegisteredUsers(data.registeredUsers || []);
      }
    } catch (err) {
      console.error('Error loading contest details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    if (contestId) {
      fetchContestData();
    }
  }, [contestId, authStatus, fetchContestData]);

  // Timers
  const startCountdown = useCountdown(contest?.startTime);
  const linkCountdown = useCountdown(contest?.linkUnlockTime);

  // Pre-fill modal fields freely when user data is available
  useEffect(() => {
    if (isModalOpen) {
      if (currentUserProfile) {
        setUsername((prev) => prev || currentUserProfile.username || '');
        setFullName((prev) => prev || currentUserProfile.fullName || '');
        setEmail((prev) => prev || currentUserProfile.email || '');
        if (currentUserProfile.studentIdNumber) {
          setStudentIdNumber((prev) => prev || currentUserProfile.studentIdNumber || '');
        }
        if (currentUserProfile.academicYear) {
          setAcademicYear((prev) => prev || currentUserProfile.academicYear || '1st Year');
        }
      } else if (session?.user) {
        const emailPrefix = session.user.email ? session.user.email.split('@')[0] : '';
        setUsername((prev) => prev || emailPrefix);
        setFullName((prev) => prev || session.user?.name || '');
        setEmail((prev) => prev || session.user?.email || '');
      }
    }
  }, [session, isModalOpen, currentUserProfile]);

  const handleCopyId = () => {
    if (userRegistration?.participantId) {
      navigator.clipboard.writeText(userRegistration.participantId);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim() || !fullName.trim() || !studentIdNumber.trim() || !academicYear.trim() || !email.trim() || !phoneNumber.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/contests/${contestId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          fullName,
          studentIdNumber,
          academicYear,
          email,
          phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to submit registration. Please try again.');
        return;
      }

      setIsModalOpen(false);
      await fetchContestData();
    } catch (err) {
      console.error('Registration failed:', err);
      setFormError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CapybaraLoader />;
  }

  if (!contest) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-onyx">Contest Not Found</h2>
        <p className="text-sm text-onyx/70">The requested event could not be found or has been removed.</p>
        <Link
          href="/contests"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-tomato-jam text-white font-bold text-sm shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contests Calendar</span>
        </Link>
      </div>
    );
  }

  const spotsTotal = contest.maxParticipants || 50;
  const spotsLeft = contest.spotsLeft;
  const fillPercentage = Math.min(100, Math.round(((spotsTotal - spotsLeft) / spotsTotal) * 100));

  const isLinkUnlocked = Boolean(contest.isLinkUnlocked || linkCountdown.isCompleted);
  const isEventStarted = Boolean(contest.isEventStarted || startCountdown.isCompleted);
  const isContestEnded = Boolean(contest.isContestEnded);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-5xl mx-auto w-full min-w-0 px-1 sm:px-2 md:px-0">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/contests"
          className="inline-flex items-center gap-2 text-xs font-bold text-onyx/70 hover:text-tomato-jam transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Contests Schedule</span>
        </Link>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-onyx text-white p-4 sm:p-6 md:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tomato-jam text-white text-[11px] sm:text-xs font-black uppercase tracking-wider max-w-full">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>{contest.badge || 'NSEC Flagship Contest'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold">
              {contest.platform}
            </span>
            {!contest.hostedInternal && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-golden-sand/20 text-golden-sand text-xs font-bold">
                External Arena: HackerRank
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight break-words">
              {contest.title}
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/75 max-w-2xl leading-relaxed break-words">
              {contest.description || 'Welcome to Cybernix Nexus premier internal contest. Test your speed, logic, and problem-solving skills against peers.'}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5 pt-1 sm:pt-2">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-white/50 flex items-center gap-1 sm:gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-tomato-jam shrink-0" />
                Date
              </span>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                {new Date(contest.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-white/50 flex items-center gap-1 sm:gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-golden-sand shrink-0" />
                Duration
              </span>
              <p className="text-xs sm:text-sm font-black text-white truncate">{contest.duration}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-white/50 flex items-center gap-1 sm:gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Venue
              </span>
              <p className="text-xs sm:text-sm font-black text-white truncate">{contest.venue || 'APC Hall'}</p>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-white/50 flex items-center gap-1 sm:gap-1.5 truncate">
                <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                Prizes
              </span>
              <p className="text-xs sm:text-sm font-black text-golden-sand truncate">{contest.prize || 'TBD'}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-white/50 flex items-center gap-1 sm:gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                Reg Deadline
              </span>
              <p className={`text-xs sm:text-sm font-black truncate ${contest.isRegistrationClosed ? 'text-rose-400' : 'text-emerald-300'}`}>
                {contest.registrationDeadline
                  ? new Date(contest.registrationDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'Open'}
              </p>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="pt-1 sm:pt-2 space-y-1.5 sm:space-y-2">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-bold">
              <span className="text-white/70 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-golden-sand shrink-0" />
                Seat Capacity
              </span>
              <span className="text-golden-sand font-black text-[11px] sm:text-xs">
                {spotsLeft} spots left ({contest.registeredCount}/{spotsTotal} filled)
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tomato-jam to-golden-sand transition-all duration-500 rounded-full"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timer 1: Big "Event Starts In" Countdown */}
      <div className="rounded-2xl sm:rounded-3xl bg-onyx text-white p-4 sm:p-6 md:p-8 shadow-xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isContestEnded ? 'bg-white/40' : isEventStarted ? 'bg-emerald-400 animate-pulse' : 'bg-tomato-jam animate-ping'}`} />
            <span className="text-xs font-black tracking-widest uppercase text-golden-sand">
              {isContestEnded
                ? 'Contest Status: Concluded'
                : isEventStarted
                ? 'Contest Status: Live & Active'
                : 'Countdown to Kickoff'}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-white/60">
            {new Date(contest.startTime).toLocaleString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {isContestEnded ? (
          <div className="py-4 sm:py-6 text-center space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-golden-sand">
              Event Concluded
            </h2>
            <p className="text-xs text-white/60">
              This round has ended. Stay tuned for standings and post-contest editorials.
            </p>
          </div>
        ) : isEventStarted ? (
          <div className="py-4 sm:py-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Event Started • Round In Progress</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {contest.title} is Live!
            </h2>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/70 text-center sm:text-left">
              Event Starts In
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 max-w-xl mx-auto sm:mx-0">
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 text-center border border-white/10 shadow-inner min-w-0">
                <span className="block text-xl xs:text-2xl sm:text-4xl md:text-5xl font-mono font-black text-golden-sand truncate">
                  {String(startCountdown.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-xs font-extrabold tracking-wider uppercase text-white/60 mt-0.5 sm:mt-1 block truncate">
                  Days
                </span>
              </div>

              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 text-center border border-white/10 shadow-inner min-w-0">
                <span className="block text-xl xs:text-2xl sm:text-4xl md:text-5xl font-mono font-black text-golden-sand truncate">
                  {String(startCountdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-xs font-extrabold tracking-wider uppercase text-white/60 mt-0.5 sm:mt-1 block truncate">
                  Hours
                </span>
              </div>

              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 text-center border border-white/10 shadow-inner min-w-0">
                <span className="block text-xl xs:text-2xl sm:text-4xl md:text-5xl font-mono font-black text-golden-sand truncate">
                  {String(startCountdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-xs font-extrabold tracking-wider uppercase text-white/60 mt-0.5 sm:mt-1 block truncate">
                  Minutes
                </span>
              </div>

              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 text-center border border-white/10 shadow-inner min-w-0">
                <span className="block text-xl xs:text-2xl sm:text-4xl md:text-5xl font-mono font-black text-tomato-jam truncate">
                  {String(startCountdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-xs font-extrabold tracking-wider uppercase text-white/60 mt-0.5 sm:mt-1 block truncate">
                  Seconds
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Section: Registration Pass OR Register CTA */}
      {isRegistered && userRegistration ? (
        /* Persistent Participant Pass Card */
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-[#FFF8EE] border-2 border-emerald-600/30 p-4 sm:p-6 md:p-8 shadow-md space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-onyx/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Confirmed Registration
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-onyx mt-1 truncate">
                  Official Participant Pass
                </h2>
              </div>
            </div>

            {/* Arena Link in Pass (Only if unlocked and not ended) */}
            {contest.url && !isContestEnded ? (
              <a
                href={contest.url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-tomato-jam text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-transform text-center"
              >
                <span>Enter Contest Arena</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            ) : isLinkUnlocked && !isContestEnded ? (
              <button
                type="button"
                onClick={() => fetchContestData()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-transform cursor-pointer text-center"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <span>Timer completed - Access Arena</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-onyx/5 border border-onyx/10 text-onyx/60 text-xs font-bold text-center">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Link Unlocks 1h Prior</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Participant ID Code Box */}
            <div className="md:col-span-6 bg-onyx text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-golden-sand shrink-0" />
                  Participant ID
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-golden-sand">
                  12-Char Unique
                </span>
              </div>

              <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-mono font-black text-golden-sand tracking-normal sm:tracking-widest break-all select-all text-center sm:text-left py-1">
                {userRegistration.participantId}
              </div>

              <button
                type="button"
                onClick={handleCopyId}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedPass ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy Participant ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Registered Student Info */}
            <div className="md:col-span-6 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-onyx/8 min-w-0">
                  <span className="text-onyx/50 font-bold block text-[11px]">Participant</span>
                  <span className="font-black text-onyx text-xs sm:text-sm break-words">{userRegistration.fullName}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-onyx/8 min-w-0">
                  <span className="text-onyx/50 font-bold block text-[11px]">Student ID / Roll</span>
                  <span className="font-black text-onyx text-xs sm:text-sm break-words">{userRegistration.studentIdNumber}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-onyx/8 min-w-0">
                  <span className="text-onyx/50 font-bold block text-[11px]">Academic Year</span>
                  <span className="font-black text-onyx text-xs sm:text-sm break-words">{userRegistration.academicYear}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-onyx/8 min-w-0">
                  <span className="text-onyx/50 font-bold block text-[11px]">Venue Check-in</span>
                  <span className="font-black text-onyx text-xs sm:text-sm break-words">{contest.venue || 'APC Hall'}</span>
                </div>
              </div>

              <p className="text-[11px] text-onyx/60 italic pt-1">
                Important: Keep this Participant ID ready. It will be required for physical verification at {contest.venue || 'APC Hall'}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Not Registered: Registration Action Banner */
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                contest.isRegistrationClosed
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-golden-sand/30 text-onyx'
              }`}
            >
              {contest.isRegistrationClosed ? 'Registration Closed' : 'Registration Open'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-onyx">
              {contest.isRegistrationClosed
                ? 'Registration Deadline Passed'
                : `Ready to take on ${contest.title}?`}
            </h2>
            <p className="text-xs sm:text-sm text-onyx/70 max-w-lg">
              {contest.isRegistrationClosed
                ? `The registration window for ${contest.title} closed on ${
                    contest.registrationDeadline
                      ? new Date(contest.registrationDeadline).toLocaleString()
                      : 'the scheduled deadline'
                  }. Contact an event admin or coordinator for queries.`
                : `Register now to claim your Participant ID. Seats are limited to ${spotsTotal} coders on a first-come, first-served basis.`}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {contest.isRegistrationClosed ? (
              <div className="w-full md:w-auto text-center px-6 py-3.5 rounded-2xl bg-rose-50 text-rose-700 font-black text-sm border border-rose-200">
                Registrations Closed
              </div>
            ) : spotsLeft <= 0 ? (
              <div className="w-full md:w-auto text-center px-6 py-3.5 rounded-2xl bg-onyx/10 text-onyx/60 font-black text-sm">
                Registrations Full ({spotsTotal}/{spotsTotal})
              </div>
            ) : !session?.user ? (
              <Link
                href="/login"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-tomato-jam text-white font-black text-sm shadow-lg shadow-tomato-jam/25 hover:scale-105 transition-transform text-center"
              >
                <span>Sign in to Register</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-tomato-jam text-white font-black text-sm shadow-lg shadow-tomato-jam/25 hover:scale-105 transition-transform cursor-pointer text-center"
              >
                Register for Contest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timer 2: Participation Link & Contest Arena Access */}
      {!contest.hostedInternal && (
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-onyx/10 text-onyx">
                  Contest Arena
                </span>
                {isContestEnded ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-onyx/15 text-onyx/70">
                    Concluded
                  </span>
                ) : isLinkUnlocked ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 shrink-0" />
                    <span>Link Unlocked</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>Locked (Unlocks 1h Prior)</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-onyx mt-1 break-words">
                Official Match Arena: HackerRank Platform
              </h3>
            </div>

            {/* Action or Refresh Button */}
            <div className="w-full sm:w-auto">
              {isContestEnded ? (
                <div className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-onyx/10 text-onyx/60 font-bold text-xs">
                  Event Concluded
                </div>
              ) : isLinkUnlocked ? (
                isRegistered ? (
                  contest.url ? (
                    <a
                      href={contest.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-tomato-jam text-white font-black text-xs shadow-md hover:scale-105 transition-transform text-center"
                    >
                      <span>Enter Contest Arena</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fetchContestData()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-md hover:scale-105 transition-transform cursor-pointer text-center"
                    >
                      <RotateCw className="w-3.5 h-3.5 shrink-0" />
                      <span>Timer completed - Access Arena</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-2xl bg-tomato-jam text-white font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-transform text-center"
                  >
                    <span>Register to Unlock Arena</span>
                  </button>
                )
              ) : (
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-onyx/5 border border-onyx/10 text-onyx/60 text-xs font-bold text-center">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Hidden Until 1h Prior</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Countdown Timer 2 */}
          {!isLinkUnlocked && !isContestEnded && (
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-golden-sand/25 via-golden-sand/10 to-transparent border border-golden-sand/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-wider text-onyx flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-tomato-jam shrink-0" />
                    <span>Participation Link Displayed In</span>
                  </p>
                  <p className="text-[11px] text-onyx/70 leading-relaxed">
                    To maintain contest integrity, the HackerRank arena URL is revealed strictly to registered coders exactly 1 hour prior to kickoff.
                  </p>
                </div>

                <div className="self-center sm:self-auto shrink-0 flex items-center gap-1.5 font-mono font-black text-base sm:text-xl text-onyx bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-onyx/10 shadow-2xs">
                  <span>{String(linkCountdown.hours + linkCountdown.days * 24).padStart(2, '0')}</span>
                  <span className="text-tomato-jam">:</span>
                  <span>{String(linkCountdown.minutes).padStart(2, '0')}</span>
                  <span className="text-tomato-jam">:</span>
                  <span>{String(linkCountdown.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {linkCountdown.isCompleted && (
                <button
                  type="button"
                  onClick={() => fetchContestData()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-emerald-700"
                >
                  <RotateCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Timer completed - Click here to refresh and access arena</span>
                </button>
              )}
            </div>
          )}

          {/* Status Note */}
          <div className="text-xs text-onyx/70 space-y-1 leading-relaxed">
            {isContestEnded ? (
              <p>The contest round has concluded. Arena link is now closed.</p>
            ) : isLinkUnlocked ? (
              isRegistered ? (
                <p>
                  The arena is unlocked. Click <strong>Enter Contest Arena</strong> above to enter HackerRank. Make sure your Participant ID ({userRegistration?.participantId}) is handy.
                </p>
              ) : (
                <p className="text-tomato-jam font-bold">
                  The participation link is currently unlocked for registered students only. Complete your registration above to gain access.
                </p>
              )
            ) : (
              <p>
                The contest arena link is locked. Registered coders can view and access the arena on this page once the countdown timer above reaches 00:00:00.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Registered Participants Showcase */}
      {contest.displayRegisteredUsers && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-onyx/12 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-tomato-jam font-mono">
                Live Cohort
              </span>
              <h2 className="text-lg sm:text-xl font-black text-onyx">
                Registered Coders ({registeredUsers.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-onyx/60">
              Sorted by registration order • {spotsLeft} spots remaining
            </span>
          </div>

          {registeredUsers.length === 0 ? (
            <div className="p-6 sm:p-8 text-center rounded-2xl bg-golden-sand/10 border border-onyx/8 text-xs font-bold text-onyx/60">
              No coders registered yet. Be the first to register for {contest.title}!
            </div>
          ) : (
            <div className="divide-y divide-onyx/8 rounded-2xl border border-onyx/10 overflow-hidden bg-white shadow-2xs">
              {registeredUsers.map((user, idx) => (
                <div
                  key={`${user.username}-${idx}`}
                  className="flex items-center justify-between gap-3 p-3 sm:p-4 hover:bg-golden-sand/10 transition-colors"
                >
                  {/* Left: Rank/Order + Profile Pic + Full Name + Username */}
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <span className="w-6 text-center text-xs font-mono font-bold text-onyx/40 shrink-0">
                      #{idx + 1}
                    </span>

                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.fullName}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-onyx/10 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-golden-sand text-onyx flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                        {user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-onyx truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] sm:text-xs font-bold text-onyx/50 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {/* Right: Registration Relative Timestamp */}
                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-onyx/60 bg-onyx/5 px-2.5 sm:px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-tomato-jam shrink-0" />
                    <span>{user.registeredAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-onyx/10 space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-tomato-jam">
                  Contest Registration
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-onyx truncate">{contest.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-onyx/5 hover:bg-onyx/10 flex items-center justify-center text-onyx/60 font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-tomato-jam/10 border border-tomato-jam/20 text-tomato-jam text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-onyx mb-1">
                  Username <span className="text-tomato-jam">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-onyx/40">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-onyx mb-1">
                  Full Name <span className="text-tomato-jam">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Niladri Ghosh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Student ID / Roll Number <span className="text-tomato-jam">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18200122045"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Academic Year <span className="text-tomato-jam">*</span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="MCA / PG">MCA / PG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Email Address <span className="text-tomato-jam">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@nsec.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Phone Number <span className="text-tomato-jam">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-onyx/15 focus:border-tomato-jam text-xs sm:text-sm font-bold text-onyx outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-onyx/12 text-xs font-bold text-onyx/70 hover:bg-onyx/5 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-tomato-jam text-white text-xs font-black shadow-md hover:scale-105 transition-transform cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Confirm Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
