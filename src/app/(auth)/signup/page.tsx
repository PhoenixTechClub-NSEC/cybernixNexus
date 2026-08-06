'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Flame, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function SignupPage() {
  const router = useRouter();
  const { updateUser } = useUser();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Platform Handles
  const [codeforces, setCodeforces] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [gfg, setGfg] = useState('');
  const [codechef, setCodechef] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const fullNameParts = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean);
    const fullName = fullNameParts.join(' ');

    try {
      // 1. Call Backend Signup API Endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
          password,
          rollNumber: rollNumber.trim() || `ROLL-${Date.now().toString().slice(-6)}`,
          department,
          graduationYear: Number(graduationYear),
          leetcode: leetcode.trim() || null,
          codeforces: codeforces.trim() || null,
          gfg: gfg.trim() || null,
          codechef: codechef.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account');
      }

      // 2. Sign in immediately with NextAuth credentials
      const loginRes = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        throw new Error('Account created, but sign-in failed. Please login manually.');
      }

      // 3. Update global state and navigate to dashboard
      updateUser({
        name: fullName,
        email: email.trim(),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setError('Failed to initiate Google sign up.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Create your CP Profile
        </h2>
        <p className="mt-2 text-sm text-onyx/70">
          Join the NSEC leaderboard and sync your competitive programming ratings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-onyx/12 sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
            <span className="flex-shrink mx-4 text-xs font-bold text-onyx/40 uppercase">Or fill form</span>
            <div className="flex-grow border-t border-onyx/12"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            {/* 1. Identity Section */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">1. Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="middle-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Middle Name</label>
                  <input
                    id="middle-name"
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
              </div>
            </div>

            {/* 2. Account Credentials */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">2. Account Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                    placeholder="your.email@nsec.ac.in"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Password *
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
              </div>
            </div>

            {/* 3. Academic Info */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">3. Academic Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="rollNumber" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Roll Number</label>
                  <input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 10900121001"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Department</label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="AI&DS">AI & DS</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="graduationYear" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Graduation Year</label>
                  <select
                    id="graduationYear"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Platform Handles */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">4. Coding Handles (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="leetcode" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">LeetCode Handle</label>
                  <input
                    id="leetcode"
                    type="text"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    placeholder="e.g. lee215"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="codeforces" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Codeforces Handle</label>
                  <input
                    id="codeforces"
                    type="text"
                    value={codeforces}
                    onChange={(e) => setCodeforces(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="gfg" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">GeeksforGeeks Handle</label>
                  <input
                    id="gfg"
                    type="text"
                    value={gfg}
                    onChange={(e) => setGfg(e.target.value)}
                    placeholder="e.g. gfg_username"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="codechef" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">CodeChef Handle</label>
                  <input
                    id="codechef"
                    type="text"
                    value={codechef}
                    onChange={(e) => setCodechef(e.target.value)}
                    placeholder="e.g. cc_username"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
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
                  <span>Complete Registration</span>
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
