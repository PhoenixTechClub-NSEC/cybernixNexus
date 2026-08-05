/* eslint-disable react-hooks/refs */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Trophy,
  BookOpen,
  User,
  Calendar,
  Award,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useUser } from '@/components/providers/UserProvider';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const pathname = usePathname();
  const { user: CURRENT_USER } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const navbarFlameRef = useRef<SVGSVGElement>(null);
  const streakFlameRef = useRef<SVGSVGElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Award },
    { name: 'Rankings', href: '/rankings', icon: Trophy },
    { name: 'Editorials', href: '/editorials', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Contests', href: '/contests', icon: Calendar },
  ];

  // Smooth Mount Entrance Animations (60fps GPU transforms)
  const { contextSafe } = useGSAP(
    () => {
      gsap.from('.navbar-banner', {
        y: -20,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      });

      gsap.from('.navbar-logo', {
        x: -15,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.1,
      });

      gsap.from('.navbar-nav-item', {
        y: -10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out',
        delay: 0.15,
        clearProps: 'transform',
      });

      gsap.from('.navbar-pill', {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'back.out(1.6)',
        delay: 0.25,
        clearProps: 'transform',
      });
    },
    { scope: headerRef }
  );

  // Mobile Menu Entrance Animation
  useGSAP(
    () => {
      if (mobileMenuOpen && mobileMenuRef.current) {
        gsap.fromTo(
          mobileMenuRef.current,
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
        );
      }
    },
    { dependencies: [mobileMenuOpen] }
  );

  // Interactive contextSafe Hover Micro-Animations (Zero lag, no memory leak)
  const handleLogoEnter = contextSafe(() => {
    gsap.to(navbarFlameRef.current, {
      scale: 1.25,
      rotation: -15,
      duration: 0.3,
      ease: 'back.out(3)',
    });
  });

  const handleLogoLeave = contextSafe(() => {
    gsap.to(navbarFlameRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
  });

  const handleNavEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const icon = e.currentTarget.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, {
        y: -2,
        scale: 1.15,
        duration: 0.25,
        ease: 'back.out(2.5)',
      });
    }
  });

  const handleNavLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const icon = e.currentTarget.querySelector('.nav-icon');
    if (icon) {
      gsap.to(icon, {
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  });

  const handleStreakEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.06,
      duration: 0.25,
      ease: 'back.out(2.5)',
    });
    if (streakFlameRef.current) {
      gsap.to(streakFlameRef.current, {
        rotation: 20,
        scale: 1.3,
        duration: 0.3,
        ease: 'back.out(3)',
      });
    }
  });

  const handleStreakLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
    if (streakFlameRef.current) {
      gsap.to(streakFlameRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleCpScoreEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      y: -2,
      duration: 0.25,
      ease: 'back.out(2.5)',
    });
  });

  const handleCpScoreLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.2,
      ease: 'power2.out',
    });
  });

  const handleProfileEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const img = e.currentTarget.querySelector('.avatar-img');
    gsap.to(e.currentTarget, {
      scale: 1.03,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (img) {
      gsap.to(img, {
        scale: 1.15,
        rotation: 8,
        duration: 0.35,
        ease: 'back.out(2.5)',
      });
    }
  });

  const handleProfileLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const img = e.currentTarget.querySelector('.avatar-img');
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
    if (img) {
      gsap.to(img, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-onyx/12 bg-white/90 backdrop-blur-md shadow-2xs"
    >
      {/* Top Banner for NSEC Inter-Department Competition */}
      <div className="navbar-banner bg-gradient-to-r from-tomato-jam via-onyx to-pine-teal text-white text-xs py-1.5 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-golden-sand" />
          <span>
            <strong>NSEC Avahan League 2026:</strong> CSE currently leads Dept Battles with a{' '}
            <span className="underline decoration-golden-sand">2.0x Seasonal Bonus</span>!
          </span>
          <Link
            href="/rankings"
            className="inline-flex items-center gap-0.5 ml-2 font-bold hover:underline text-golden-sand"
          >
            View Rankings <ChevronRight className="w-3 h-3" />
          </Link>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
            className="navbar-logo flex items-center gap-3 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-tomato-jam text-white shadow-md shadow-tomato-jam/20 group-hover:scale-105 transition-transform duration-200">
              <Flame
                ref={navbarFlameRef}
                className="w-6 h-6 fill-current animate-pulse will-change-transform"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-onyx">
                  Cybernix<span className="text-tomato-jam">Nexus</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-golden-sand/20 text-onyx px-1.5 py-0.5 rounded border border-onyx/12">
                  NSEC
                </span>
              </div>
              <p className="text-[11px] text-onyx/70 font-medium -mt-0.5">
                Phoenix Tech Club • CP Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={handleNavEnter}
                  onMouseLeave={handleNavLeave}
                  className={`navbar-nav-item inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 will-change-transform ${
                    isActive
                      ? 'bg-golden-sand/20 text-tomato-jam font-semibold shadow-2xs border border-onyx/12'
                      : 'text-onyx/70 hover:bg-golden-sand/12 hover:text-onyx'
                  }`}
                >
                  <Icon
                    className={`nav-icon w-4 h-4 will-change-transform ${
                      isActive ? 'text-tomato-jam' : 'text-onyx/70'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right section: Streak Pill, CP Score & User Avatar */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Daily Streak Counter Pill */}
            <div
              onMouseEnter={handleStreakEnter}
              onMouseLeave={handleStreakLeave}
              className="navbar-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-golden-sand/15 border border-onyx/12 text-onyx text-xs font-bold shadow-2xs cursor-pointer will-change-transform"
              title="Daily Streak Multiplier: +1.34x (Caps at 1.60x for 60-day streak)"
            >
              <Flame
                ref={streakFlameRef}
                className="w-4 h-4 fill-tomato-jam text-tomato-jam animate-bounce will-change-transform"
              />
              <span>{CURRENT_USER.currentStreak}-Day Streak</span>
              <span className="text-[10px] bg-tomato-jam text-white px-1.5 py-0.2 rounded-full">
                1.34x
              </span>
            </div>

            {/* CP Score */}
            <div
              onMouseEnter={handleCpScoreEnter}
              onMouseLeave={handleCpScoreLeave}
              className="navbar-pill flex flex-col items-end px-3 py-1 rounded-lg bg-golden-sand/10 border border-onyx/12 cursor-pointer will-change-transform"
              title="Formula: Σ Bq × Wp × Mdept × Mstreak"
            >
              <span className="text-[10px] text-onyx/70 font-medium uppercase tracking-wider">
                CP Score
              </span>
              <span className="text-sm font-extrabold text-onyx">
                {CURRENT_USER.cpScore.toLocaleString()}
              </span>
            </div>

            {/* Profile Pill */}
            <Link
              href="/profile"
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
              suppressHydrationWarning
              className="navbar-pill flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-onyx/12 hover:border-tomato-jam/50 hover:bg-golden-sand/10 transition-colors duration-200 will-change-transform"
            >
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="avatar-img w-8 h-8 rounded-full object-cover ring-2 ring-tomato-jam/40 will-change-transform"
              />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-onyx leading-none">
                    {CURRENT_USER.name}
                  </span>
                  <span className="text-[10px] font-semibold text-tomato-jam bg-golden-sand/20 px-1 rounded">
                    {CURRENT_USER.department}
                  </span>
                </div>
                <div className="mt-0.5">
                  <LevelBadge level={CURRENT_USER.level} tier={CURRENT_USER.tier} size="sm" />
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-golden-sand/15 border border-onyx/12 text-onyx text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 fill-tomato-jam text-tomato-jam" />
              <span>{CURRENT_USER.currentStreak}d</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-onyx hover:bg-golden-sand/15 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-onyx/12 bg-white px-4 pt-2 pb-6 space-y-3 will-change-transform"
        >
          <div className="flex items-center justify-between py-2 border-b border-pine-teal/15" suppressHydrationWarning>
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-onyx">{CURRENT_USER.name}</p>
                <p className="text-xs text-onyx/70">
                  {CURRENT_USER.department} • Level {CURRENT_USER.level} ({CURRENT_USER.tier})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-onyx/70">CP Score</p>
              <p className="text-sm font-bold text-tomato-jam">
                {CURRENT_USER.cpScore.toLocaleString()}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-golden-sand/20 text-tomato-jam font-semibold'
                      : 'text-onyx/70 hover:bg-golden-sand/12'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-tomato-jam' : 'text-onyx/70'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

