'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  GraduationCap,
  Code2,
  Globe,
  Briefcase,
  ImageIcon,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';
import CodeforcesVerificationModal from '@/components/profile/CodeforcesVerificationModal';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const { data: session, status } = useSession();

  // User & Identity Fields (pre-filled from Google)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // College & Academic Details (Student model)
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Social & Developer Profiles
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [codechef, setCodechef] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [error, setError] = useState('');

  // Codeforces verification
  const [isCfVerifyModalOpen, setIsCfVerifyModalOpen] = useState(false);
  const [cfVerified, setCfVerified] = useState(false);
  const [cfVerifiedHandle, setCfVerifiedHandle] = useState('');

  // Initialize from session and check if student already exists
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = session.user;
      if (u.name && !name) setName(u.name);
      if (u.email && !email) setEmail(u.email);
      if (u.image && !avatarUrl) setAvatarUrl(u.image);

      setIsCheckingProfile(true);
      // Check if student profile is already registered in DB
      fetch('/api/student')
        .then((res) => res.json())
        .then((data) => {
          if (data.student && data.student.profileComplete) {
            router.replace('/dashboard');
          } else if (data.student) {
            // Pre-fill existing student fields if partially filled
            if (data.student.name) setName(data.student.name);
            if (data.student.rollNumber) setRollNumber(data.student.rollNumber);
            if (data.student.department) setDepartment(data.student.department);
            if (data.student.graduationYear) setGraduationYear(String(data.student.graduationYear));
            if (data.student.github) setGithub(data.student.github);
            if (data.student.linkedin) setLinkedin(data.student.linkedin);
            if (data.student.leetcode) setLeetcode(data.student.leetcode);
            if (data.student.codeforces) setCodeforces(data.student.codeforces);
            if (data.student.codechef) setCodechef(data.student.codechef);
            if (data.student.username) setUsername(data.student.username);
            if (data.student.bio) setBio(data.student.bio);
          }
          setIsCheckingProfile(false);
        })
        .catch(() => {
          setIsCheckingProfile(false);
        });
    } else if (status === 'unauthenticated') {
      setIsCheckingProfile(false);
    }
  }, [status, session, router, name, email, avatarUrl]);

  // Sanitizer helper for handles (strips URLs and @ prefixes)
  const sanitizeHandle = (input: string) => {
    return input
      .trim()
      .replace(/^https?:\/\/[^\/]+\/(?:in\/|u\/|profile\/)?/i, '')
      .replace(/^@+/, '')
      .replace(/\/+$/, '');
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      setIsLoading(false);
      return;
    }

    // Validate username if provided
    if (username.trim()) {
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters long.');
        setIsLoading(false);
        return;
      }
      if (username.trim().length > 20) {
        setError('Username must not exceed 20 characters.');
        setIsLoading(false);
        return;
      }
      // Check for valid username characters
      if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
        setError('Username can only contain letters, numbers, underscores, and hyphens.');
        setIsLoading(false);
        return;
      }
    }

    // Require Codeforces handle to be verified before form submission
    const cleanLeetcode = sanitizeHandle(leetcode);
    const rawCodeforces = cfVerified ? cfVerifiedHandle : sanitizeHandle(codeforces);
    if (rawCodeforces && !cfVerified) {
      setError('Please verify your Codeforces handle ownership before submitting.');
      setIsLoading(false);
      return;
    }
    const cleanCodeforces = rawCodeforces;
    const cleanCodechef = sanitizeHandle(codechef);
    const cleanGithub = sanitizeHandle(github);
    const cleanLinkedin = sanitizeHandle(linkedin);
    const cleanAvatarUrl = avatarUrl.trim();

    try {
      // Call Student Profile Save Endpoint
      const response = await fetch('/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          image: cleanAvatarUrl || null,
          rollNumber: rollNumber.trim(),
          department: department.trim(),
          graduationYear: Number(graduationYear),
          leetcode: cleanLeetcode || null,
          codeforces: cleanCodeforces || null,
          codechef: cleanCodechef || null,
          github: cleanGithub || null,
          linkedin: cleanLinkedin || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to save your profile. Please check your information and try again.');
        setIsLoading(false);
        return;
      }

      // Update avatar if customized
      if (cleanAvatarUrl && cleanAvatarUrl !== session?.user?.image) {
        // Can be stored in User record
      }

      // Refresh global user state immediately
      await refreshUser();

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError('Connection lost. Please check your internet and try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignInFirst = async () => {
    try {
      await signIn('google', { callbackUrl: '/signup' });
    } catch {
      setError('Unable to sign in. Please try again.');
    }
  };

  // If not signed in yet with Google, prompt to connect Google account
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-tomato-jam text-white shadow-xl shadow-tomato-jam/25 group-hover:scale-105 transition-transform">
              <Flame className="w-8 h-8 fill-current animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-black text-3xl tracking-tight text-onyx">
                Cybernix<span className="text-tomato-jam">Nexus</span>
              </span>
              <p className="text-xs text-onyx/70 -mt-1 font-semibold">
                NSEC Phoenix Tech Club
              </p>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-black text-onyx tracking-tight">
            Create your Student CP Profile
          </h2>
          <p className="mt-2 text-sm text-onyx/75 max-w-sm mx-auto">
            Please connect your Google account to get started on the NSEC leaderboard.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-xl shadow-onyx/5 rounded-3xl border border-onyx/12 sm:px-10 text-center space-y-5">
            <button
              type="button"
              onClick={handleGoogleSignInFirst}
              className="w-full py-4 px-5 rounded-2xl border-2 border-onyx/15 bg-white hover:bg-golden-sand/20 text-onyx font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3.5 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-xs text-onyx/60">
              Already connected?{' '}
              <Link href="/login" className="font-bold text-tomato-jam hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-tomato-jam text-white shadow-lg shadow-tomato-jam/20 group-hover:scale-105 transition-transform">
            <Flame className="w-7 h-7 fill-current animate-pulse" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-onyx">
              Cybernix<span className="text-tomato-jam">Nexus</span>
            </span>
            <p className="text-xs text-onyx/70 -mt-1 font-medium">
              NSEC Phoenix Tech Club
            </p>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-onyx tracking-tight">
          Complete Your Student CP Profile
        </h2>
        <p className="mt-2 text-sm text-onyx/70 max-w-lg mx-auto">
          Connected via <span className="font-bold text-onyx">{email || session?.user?.email}</span>. Fill in your college details &amp; coding handles to join the live leaderboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-onyx/12 sm:px-10">
          {isCheckingProfile ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-tomato-jam" />
              <p className="text-sm font-semibold text-onyx/60">Checking profile status...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleCompleteProfile}>
            {/* 1. Identity & PFP */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <User className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">1. Personal Details &amp; Profile Picture</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">
                <div className="shrink-0">
                  <img
                    src={avatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="PFP Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-golden-sand/30 shadow-md"
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label htmlFor="signup-avatar" className="block text-xs font-bold uppercase tracking-wider text-onyx/70">
                    Profile Picture URL (PFP)
                  </label>
                  <div className="relative">
                    <input
                      id="signup-avatar"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/your-photo.jpg (Pre-filled from Google)"
                      className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-onyx/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="signup-full-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                  Full Name *
                </label>
                <input
                  id="signup-full-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Satyaki Paul"
                  className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                />
              </div>

              <div>
                <label htmlFor="signup-username" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. your_username"
                  className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                />
              </div>
            </div>

            {/* 2. Academic Info (Student model) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <GraduationCap className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">2. College Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="signup-rollNumber" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    College Roll Number
                  </label>
                  <input
                    id="signup-rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 10800121001"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                <div>
                  <label htmlFor="signup-department" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Department *
                  </label>
                  <select
                    id="signup-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  >
                    <option value="AEIE">Applied Electronics & Instrumentation Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="CSE-AIML">Computer Science and Engineering (AIML)</option>
                    <option value="CSE-CyberSecurity">Computer Science and Engineering (Cyber Security)</option>
                    <option value="CSE-DataScience">Computer Science and Engineering (Data Science)</option>
                    <option value="CSE-IoT">Computer Science and Engineering (IoT)</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="BTech-ECE">B.Tech in Electrical & Computer Engineering</option>
                    <option value="CSIT">Computer Science and Information Technology</option>
                    <option value="MCA-BCA">Computer Application (MCA & BCA)</option>
                    <option value="BCA">Bachelor of Computer Application (BCA)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="signup-graduationYear" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Graduation Year *
                  </label>
                  <select
                    id="signup-graduationYear"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Social & Developer Profiles (github, linkedin) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <Globe className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">3. Developer &amp; Social Profiles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-github" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    <Globe className="w-3.5 h-3.5 text-onyx" /> GitHub Username
                  </label>
                  <input
                    id="signup-github"
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. octocat"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                <div>
                  <label htmlFor="signup-linkedin" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn Username
                  </label>
                  <input
                    id="signup-linkedin"
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. your-profile-id"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
              </div>
            </div>

            {/* 4. Platform Handles (leetcode, codeforces, codechef) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <Code2 className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">4. Coding Handles (Auto-Synced)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-leetcode" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    LeetCode Username
                  </label>
                  <input
                    id="signup-leetcode"
                    type="text"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    placeholder="e.g. neal_wu"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                  {/* Codeforces - requires verification */}
                  <div>
                    <label htmlFor="signup-codeforces" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                      Codeforces Handle
                    </label>
                    {cfVerified ? (
                      // Verified state: locked display + re-verify option
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              readOnly
                              value={cfVerifiedHandle}
                              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-emerald-400/60 bg-emerald-50/50 text-sm text-emerald-800 font-semibold cursor-default select-none"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsCfVerifyModalOpen(true)}
                            className="px-3 py-2.5 rounded-xl text-xs font-bold text-pine-teal bg-pine-teal/10 hover:bg-pine-teal/20 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Re-verify
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ownership verified — handle locked in
                        </p>
                      </div>
                    ) : (
                      // Unverified state: input + verify button
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            id="signup-codeforces"
                            type="text"
                            value={codeforces}
                            onChange={(e) => {
                              setCodeforces(e.target.value);
                              if (cfVerified) setCfVerified(false);
                            }}
                            placeholder="e.g. tourist"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                          />
                          <button
                            type="button"
                            disabled={!codeforces.trim()}
                            onClick={() => setIsCfVerifyModalOpen(true)}
                            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-tomato-jam bg-tomato-jam/10 hover:bg-tomato-jam/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        </div>
                        {codeforces.trim() && (
                          <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            You must verify ownership before submitting
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                <div>
                  <label htmlFor="signup-codechef" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    CodeChef Handle
                  </label>
                  <input
                    id="signup-codechef"
                    type="text"
                    value={codechef}
                    onChange={(e) => setCodechef(e.target.value)}
                    placeholder="e.g. chef_student"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
              </div>
            </div>

            {/* 5. About You (Bio) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <Sparkles className="w-4 h-4 text-golden-sand" />
                <h3 className="text-sm font-bold text-onyx">5. About You</h3>
              </div>
              <div>
                <label htmlFor="signup-bio" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                  Short Bio / Description
                </label>
                <textarea
                  id="signup-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam resize-none placeholder:text-onyx/30"
                  placeholder="Tell us about your competitive programming goals and interests..."
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-bold text-onyx/50">{bio.length} / 160 chars</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-xl bg-tomato-jam hover:bg-[#E8890C] disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-tomato-jam/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Profile &amp; Syncing Stats...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Complete Profile &amp; Go to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-onyx/60 border-t border-onyx/10 pt-6 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-tomato-jam" />
            <span>You can update handles anytime in your Profile Settings</span>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Codeforces Ownership Verification Modal */}
      <CodeforcesVerificationModal
        isOpen={isCfVerifyModalOpen}
        onClose={() => setIsCfVerifyModalOpen(false)}
        initialHandle={codeforces.trim()}
        onSuccess={(verifiedHandle) => {
          setCfVerified(true);
          setCfVerifiedHandle(verifiedHandle);
          setCodeforces(verifiedHandle);
          setIsCfVerifyModalOpen(false);
        }}
      />
    </div>
  );
}
