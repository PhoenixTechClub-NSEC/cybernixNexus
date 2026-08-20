'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  User,
  KeyRound,
  GraduationCap,
  Code2,
  Globe,
  Briefcase,
  ImageIcon,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  // User & Identity Fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Account Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // College & Academic Details (Student model)
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Social & Developer Profiles
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Coding Platform Handles
  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [gfg, setGfg] = useState('');
  const [codechef, setCodechef] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sanitizer helper for handles (strips URLs and @ prefixes)
  const sanitizeHandle = (input: string) => {
    return input
      .trim()
      .replace(/^https?:\/\/[^\/]+\/(?:in\/|u\/|profile\/)?/i, '')
      .replace(/^@+/, '')
      .replace(/\/+$/, '');
  };

  // Password strength score (0 to 3)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const fullNameParts = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean);
    const fullName = fullNameParts.join(' ');

    if (!fullName) {
      setError('Please provide your first and last name.');
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      setIsLoading(false);
      return;
    }

    if (!rollNumber.trim()) {
      setError('Please enter your college roll number.');
      setIsLoading(false);
      return;
    }

    const cleanLeetcode = sanitizeHandle(leetcode);
    const cleanCodeforces = sanitizeHandle(codeforces);
    const cleanGfg = sanitizeHandle(gfg);
    const cleanCodechef = sanitizeHandle(codechef);
    const cleanGithub = sanitizeHandle(github);
    const cleanLinkedin = sanitizeHandle(linkedin);
    const cleanAvatarUrl = avatarUrl.trim();

    try {
      // 1. Call Backend Signup API Endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.trim().toLowerCase(),
          password,
          image: cleanAvatarUrl || null,
          rollNumber: rollNumber.trim(),
          department,
          graduationYear: Number(graduationYear),
          leetcode: cleanLeetcode || null,
          codeforces: cleanCodeforces || null,
          gfg: cleanGfg || null,
          codechef: cleanCodechef || null,
          github: cleanGithub || null,
          linkedin: cleanLinkedin || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account');
      }

      // Save email for remember me persistence
      try {
        localStorage.setItem('cybernix_saved_email', email.trim().toLowerCase());
        localStorage.setItem('cybernix_remember_me', 'true');
      } catch { }

      // 2. Sign in immediately with NextAuth credentials
      const loginRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        throw new Error('Account created! Please sign in manually.');
      }

      // 3. Refresh user state and smoothly navigate to dashboard
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Failed to initiate Google sign up.');
    }
  };

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
          Create your Student CP Profile
        </h2>
        <p className="mt-2 text-sm text-onyx/70 max-w-lg mx-auto">
          Join the NSEC leaderboard and automatically synchronize your solved problems across all platforms.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-onyx/12 sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full py-3 px-4 rounded-xl border border-onyx/20 bg-white hover:bg-golden-sand/15 text-onyx font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-onyx/12"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-onyx/40 uppercase tracking-wider">
              Or complete registration
            </span>
            <div className="flex-grow border-t border-onyx/12"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            {/* 1. Identity & PFP (URL only) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <User className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">1. Personal Details & Profile Picture</h3>
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
                      placeholder="https://example.com/your-photo.jpg (Optional URL)"
                      className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-onyx/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="signup-first-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">First Name *</label>
                  <input
                    id="signup-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Name"
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                <div>
                  <label htmlFor="signup-middle-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Middle Name</label>
                  <input
                    id="signup-middle-name"
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Optional"
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                <div>
                  <label htmlFor="signup-last-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Last Name *</label>
                  <input
                    id="signup-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Surname"
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
              </div>
            </div>

            {/* 2. Account Credentials */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <KeyRound className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">2. Account Credentials</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Institutional Email Address *
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                    placeholder="your.email@nsec.ac.in"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="modern-input w-full px-4 py-2.5 pr-10 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-onyx/40 hover:text-onyx transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="modern-input w-full px-4 py-2.5 pr-10 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-onyx/40 hover:text-onyx transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-onyx/10 overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all ${strength >= 1 ? 'bg-rose-500 w-1/3' : 'w-0'
                          }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all ${strength >= 2 ? 'bg-amber-500 w-1/3' : 'w-0'
                          }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all ${strength >= 3 ? 'bg-emerald-500 w-1/3' : 'w-0'
                          }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-onyx/60">
                      {strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : strength === 3 ? 'Strong' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Academic Info (Student model) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <GraduationCap className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">3. College Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="signup-rollNumber" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    College Roll Number *
                  </label>
                  <input
                    id="signup-rollNumber"
                    type="text"
                    required
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
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ECE">ECE (Electronics & Comm.)</option>
                    <option value="AI&DS">AI & DS (AI & Data Science)</option>
                    <option value="EE">EE (Electrical Eng.)</option>
                    <option value="ME">ME (Mechanical Eng.)</option>
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

            {/* 4. Social & Developer Profiles (github, linkedin) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <Globe className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">4. Developer & Social Profiles</h3>
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

            {/* 5. Platform Handles (leetcode, codeforces, gfg, codechef) */}
            <div>
              <div className="flex items-center gap-2 border-b border-onyx/10 pb-2 mb-4">
                <Code2 className="w-4 h-4 text-tomato-jam" />
                <h3 className="text-sm font-bold text-onyx">5. Coding Handles (Auto-Synced)</h3>
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
                <div>
                  <label htmlFor="signup-codeforces" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Codeforces Handle
                  </label>
                  <input
                    id="signup-codeforces"
                    type="text"
                    value={codeforces}
                    onChange={(e) => setCodeforces(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
                </div>
                <div>
                  <label htmlFor="signup-gfg" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    GeeksforGeeks Handle
                  </label>
                  <input
                    id="signup-gfg"
                    type="text"
                    value={gfg}
                    onChange={(e) => setGfg(e.target.value)}
                    placeholder="e.g. coder_nsec"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam placeholder:text-onyx/30"
                  />
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-xl bg-tomato-jam hover:bg-[#E8890C] disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-tomato-jam/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account & Syncing Stats...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Create Account & Join Leaderboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-onyx/70 border-t border-onyx/10 pt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-tomato-jam hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
