'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Flame, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('test@nsec.ac.in');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { updateUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Update client context state for responsive UI
      const namePart = email.split('@')[0];
      const derivedName = namePart
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      updateUser({ name: derivedName, email });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setError('Failed to initiate Google sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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
          Sign in to your NSEC CP Account
        </h2>
        <p className="mt-2 text-sm text-onyx/70">
          Sync your Codeforces, LeetCode, CodeChef, and GFG ratings into a single unified college leaderboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-onyx/12 sm:px-10">
          {/* Instant Unlock Info */}
          <div className="mb-6 p-3 rounded-xl bg-golden-sand/15 border border-onyx/12 flex items-center gap-3">
            <div className="text-2xl">✨</div>
            <div className="text-left">
              <p className="text-xs font-bold text-onyx">
                Instant Level 1 (Spark Tier) Unlock!
              </p>
              <p className="text-[11px] text-onyx/70">
                New NSEC students get instant Spark badge & mascot on signup.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl border border-onyx/20 bg-white hover:bg-golden-sand/15 text-onyx font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer mb-5"
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
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-onyx/12"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-onyx/40 uppercase">Or email</span>
            <div className="flex-grow border-t border-onyx/12"></div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  placeholder="your.email@nsec.ac.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-tomato-jam hover:bg-[#E8890C] disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-tomato-jam/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Sync Profiles</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>



          <div className="mt-6 text-center text-xs text-onyx/70">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="font-bold text-tomato-jam hover:underline">
              Create student profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
