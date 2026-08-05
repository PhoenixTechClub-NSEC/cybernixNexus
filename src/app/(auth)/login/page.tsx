'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, ArrowRight } from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('test@nsec.ac.in');
  const [password, setPassword] = useState('password');

  const { updateUser } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse name from email (e.g. test@nsec.ac.in -> Test)
    const namePart = email.split('@')[0];
    const derivedName = namePart.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    
    updateUser({ name: derivedName, email: email });
    router.push('/dashboard');
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
          {/* Spark Tier instant unlock info */}
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

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-onyx/70">
                College Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  pattern="^[a-zA-Z0-9._%+\-]+@nsec\.ac\.in$"
                  aria-describedby="email-error email-hint"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                />
                <div id="email-hint" className="hint-msg text-xs text-onyx/50 mt-1">
                  Format: your.name@nsec.ac.in
                </div>
                <div id="email-error" className="error-msg">
                  <span aria-hidden="true">❌</span> Please enter a valid @nsec.ac.in email address.
                </div>
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
              className="w-full py-3 px-4 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-extrabold text-sm shadow-md shadow-tomato-jam/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In & Sync Profiles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login CTA */}
          <div className="mt-6 pt-6 border-t border-pine-teal/15">
            <p className="text-xs text-center font-bold uppercase tracking-wider text-onyx/70 mb-3">
              Frontend Preview Mode
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-golden-sand/15 hover:bg-golden-sand/40 text-onyx font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Demo Login</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-onyx/70">
            Don&apos;t have an NSEC account yet?{' '}
            <Link href="/signup" className="font-bold text-tomato-jam hover:underline">
              Create student profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
