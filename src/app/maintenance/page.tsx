/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  RotateCw,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export default function MaintenancePage() {
  // Target: September 25, 2026, 00:00:00 IST (48 hours from announcement)
  const targetDate = new Date('2026-09-25T00:00:00+05:30').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isComplete: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 1,
    hours: 23,
    minutes: 7,
    seconds: 14,
    isComplete: false,
  });
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setCheckMessage(null);

    setTimeout(() => {
      setIsChecking(false);
      setCheckMessage('Maintenance is still ongoing. Our team is actively deploying upgrades!');
      setTimeout(() => setCheckMessage(null), 5000);
    }, 1200);
  };

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col items-center justify-between px-4 sm:px-6 py-8 relative overflow-hidden select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-tomato-jam/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-golden-sand/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Branding Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2.5">
          <img
            src="/phoenix_logo-removebg-preview.png"
            alt="Cybernix Phoenix Logo"
            className="w-9 h-9 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-onyx leading-none">
              Cybernix <span className="text-tomato-jam">Nexus</span>
            </span>
            <span className="text-[10px] font-bold text-onyx/60 uppercase tracking-widest leading-tight">
              Phoenix Tech Club • NSEC
            </span>
          </div>
        </div>

        {/* Static Status Pill Indicator (no looped animation) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-onyx/10 shadow-2xs backdrop-blur-sm">
          <span className="inline-flex rounded-full h-2 w-2 bg-tomato-jam"></span>
          <span className="text-xs font-black text-onyx tracking-wide">
            Under Maintenance
          </span>
        </div>
      </header>

      {/* Center Main Content Container (Centered layout without 404 image) */}
      <main className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 my-auto py-8 z-10">


        {/* Main Headline */}
        <div className="space-y-4 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-onyx tracking-tight leading-tight">
            Phoenix will <span className="text-tomato-jam">rise from its ashes </span>
          </h1>

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 my-1">
            <img
              src="/lvl-5.png"
              alt="Phoenix Mascot"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <p className="text-base sm:text-lg text-onyx/75 max-w-xl mx-auto leading-relaxed">
            Cybernix Nexus is temporarily offline for scheduled system upgrades, database tuning, and platform reliability enhancements.
          </p>
        </div>

        {/* Target Return Highlight Card */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 border border-onyx/10 shadow-sm backdrop-blur-sm">
          <div className="w-9 h-9 rounded-xl bg-tomato-jam/15 flex items-center justify-center text-tomato-jam shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-onyx/60 uppercase tracking-wider">
              Target Return Date
            </p>
            <p className="text-sm sm:text-base font-black text-onyx">
              September 25th, 2026 <span className="text-tomato-jam font-bold">(~48 Hours Left)</span>
            </p>
          </div>
        </div>

        {/* Live Countdown Counter Grid */}
        <div className="space-y-3 w-full max-w-lg mx-auto pt-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-onyx/70 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-tomato-jam" />
            <span>Time Remaining</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Days Tile */}
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/90 border border-onyx/10 shadow-sm backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-black text-onyx tracking-tight font-mono">
                {mounted ? formatNumber(timeLeft.days) : '01'}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-onyx/60 uppercase tracking-wider mt-1">
                Days
              </span>
            </div>

            {/* Hours Tile */}
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/90 border border-onyx/10 shadow-sm backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-black text-onyx tracking-tight font-mono">
                {mounted ? formatNumber(timeLeft.hours) : '23'}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-onyx/60 uppercase tracking-wider mt-1">
                Hours
              </span>
            </div>

            {/* Minutes Tile */}
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/90 border border-onyx/10 shadow-sm backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-black text-onyx tracking-tight font-mono">
                {mounted ? formatNumber(timeLeft.minutes) : '48'}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-onyx/60 uppercase tracking-wider mt-1">
                Mins
              </span>
            </div>

            {/* Seconds Tile */}
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/90 border border-onyx/10 shadow-sm backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-black text-tomato-jam tracking-tight font-mono">
                {mounted ? formatNumber(timeLeft.seconds) : '00'}
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-onyx/60 uppercase tracking-wider mt-1">
                Secs
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Community Link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-onyx hover:bg-onyx/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Status...' : 'Reload'}
          </button>

          <a
            href="https://github.com/PhoenixTechClub-NSEC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-golden-sand/30 border-2 border-onyx/15 text-onyx font-bold text-sm transition-all cursor-pointer"
          >
            <span>Github</span>
            <ExternalLink className="w-3.5 h-3.5 text-onyx/60" />
          </a>
        </div>

        {/* Dynamic Check Status Message Toast */}
        {checkMessage && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-onyx text-white text-xs font-bold shadow-lg border border-tomato-jam/30">
            <ShieldAlert className="w-4 h-4 text-tomato-jam shrink-0" />
            <span>{checkMessage}</span>
          </div>
        )}

        {/* Tagline Footer Note (Static flame icon) */}
        <div className="flex items-center justify-center gap-2 text-xs text-onyx/60 font-semibold pt-1">
          <Flame className="w-4 h-4 text-tomato-jam shrink-0" />
          <p>Our phoenix always rises stronger from the ashes. See you on the 25th!</p>
        </div>
      </main>

      {/* Bottom Footer Credits */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-[11px] text-onyx/50 font-bold border-t border-onyx/10 pt-4 z-10">
        <span>© 2026 Phoenix Tech Club • Netaji Subhash Engineering College</span>
        <span className="hidden sm:inline">Cybernix Nexus Core System Upgrade</span>
      </footer>
    </div>
  );
}
