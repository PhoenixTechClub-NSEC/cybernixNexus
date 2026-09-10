'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
  Flame,
  AlertCircle,
  Loader2,
  Trophy,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';
import ParticlesBackground from '@/components/ui/ParticlesBackground';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically route authenticated users
  useEffect(() => {
    if (status === 'authenticated') {
      const isComplete = (session?.user as any)?.profileComplete;
      if (isComplete) {
        router.replace('/dashboard');
      } else {
        // Double check student endpoint
        fetch('/api/student')
          .then((res) => res.json())
          .then((data) => {
            if (data.student && data.student.profileComplete) {
              router.replace('/dashboard');
            } else {
              router.replace('/signup');
            }
          })
          .catch(() => router.replace('/signup'));
      }
    }
  }, [status, session, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const callbackUrl = new URL(window.location.href).searchParams.get('callbackUrl') || '/dashboard';
      const result = await signIn('google', { callbackUrl, redirect: false });

      if (result?.error) {
        setError('Google sign in failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError('Failed to initiate Google sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Particles.js Interactive Background */}
      <ParticlesBackground />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tomato-jam/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-golden-sand/40 rounded-full blur-2xl pointer-events-none z-0" />

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
          Welcome to CP Hub
        </h2>
        <p className="mt-2 text-sm text-onyx/75 max-w-sm mx-auto">
          Unified Competitive Programming tracker &amp; departmental leaderboards for Netaji Subhash Engineering College.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/20 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-onyx/10 rounded-3xl border border-white/50 sm:px-10 space-y-6">

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="p-2.5 rounded-2xl bg-golden-sand/15 border border-onyx/8 flex flex-col items-center gap-1">
              <Activity className="w-4 h-4 text-tomato-jam" />
              <span className="text-[11px] font-black text-onyx">Live Sync</span>
              <span className="text-[9px] text-onyx/60 font-medium">CF &amp; LeetCode</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-golden-sand/15 border border-onyx/8 flex flex-col items-center gap-1">
              <Trophy className="w-4 h-4 text-tomato-jam" />
              <span className="text-[11px] font-black text-onyx">Rankings</span>
              <span className="text-[9px] text-onyx/60 font-medium">Dept Battles</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-golden-sand/15 border border-onyx/8 flex flex-col items-center gap-1">
              <Award className="w-4 h-4 text-tomato-jam" />
              <span className="text-[11px] font-black text-onyx">Mascots</span>
              <span className="text-[9px] text-onyx/60 font-medium">Tier Evolution</span>
            </div>
          </div>

          {/* Single Google OAuth Button */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isLoading || status === 'loading'}
              onClick={handleGoogleLogin}
              className="w-full py-4 px-5 rounded-2xl border-2 border-onyx/15 bg-white hover:bg-golden-sand/20 text-onyx font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {isLoading || status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-tomato-jam" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
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
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-onyx/60 font-medium">
              Use your college or personal Google account. First-time coders will be guided through a quick 1-minute profile setup.
            </p>
          </div>

          <div className="pt-4 border-t border-onyx/10 flex items-center justify-center gap-1.5 text-xs text-onyx/70 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-tomato-jam" />
            <span>Avahan Cup 2026 Inter-Department Battles Live</span>
          </div>

        </div>
      </div>
    </div>
  );
}
