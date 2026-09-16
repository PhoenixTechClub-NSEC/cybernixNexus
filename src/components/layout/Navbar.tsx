/* eslint-disable react-hooks/refs */
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  Settings,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useUser } from '@/components/providers/UserProvider';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const pathname = usePathname();
  const { user: CURRENT_USER, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [topDept, setTopDept] = useState({ name: 'CSE', multiplier: 2.0 });
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.summary?.topDepartment) {
          setTopDept({
            name: data.summary.topDepartment.department || 'CSE',
            multiplier: data.summary.topDepartment.seasonalMultiplier || 2.0,
          });
        }
      })
      .catch(() => { });
  }, []);

  const streakMultiplier = (1 + (CURRENT_USER.currentStreak || 1) * 0.01).toFixed(2);

  const headerRef = useRef<HTMLElement>(null);
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

  const handleProfileEnter = contextSafe((e: React.MouseEvent<HTMLElement>) => {
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

  const handleProfileLeave = contextSafe((e: React.MouseEvent<HTMLElement>) => {
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
      <div className="navbar-banner bg-gradient-to-r from-tomato-jam via-onyx to-pine-teal text-white text-xs py-1.5 px-2 sm:px-4 text-center font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-golden-sand shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            <strong className="hidden sm:inline">NSEC College 2026: </strong>
            <span className="hidden sm:inline">{topDept.name} currently leads with a </span>
            <span className="sm:hidden">{topDept.name} leads with </span>
            <span className="underline decoration-golden-sand">{topDept.multiplier.toFixed(1)}x Bonus</span>!
          </span>
          <Link
            href="/rankings"
            className="inline-flex items-center gap-0.5 ml-1 sm:ml-2 font-bold hover:underline text-golden-sand shrink-0"
          >
            <span className="hidden sm:inline">View Rankings</span>
            <span className="sm:hidden">Rankings</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="navbar-logo flex items-center gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <img
                src="/pheonix_mod1.png"
                alt="Phoenix Logo"
                className="w-10 h-10 object-contain drop-shadow-sm scale-[3]"
                width="40"
                height="40"
                fetchPriority="high"
              />
            </div>
            <div className="pr-3">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-onyx">
                  Cybernix <span className="text-tomato-jam">Nexus</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-golden-sand/20 text-onyx px-1.5 py-0.5 rounded border border-onyx/12">
                  NSEC
                </span>
              </div>
              <p className="text-[9px] text-onyx/70 font-bold uppercase tracking-wider -mt-0.5">
                NSEC PHOENIX CLUB . cybernix
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
                  className={`navbar-nav-item inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 will-change-transform ${isActive
                    ? 'bg-golden-sand/20 text-tomato-jam font-semibold shadow-2xs border border-onyx/12'
                    : 'text-onyx/70 hover:bg-golden-sand/12 hover:text-onyx'
                    }`}
                >
                  <Icon
                    className={`nav-icon w-4 h-4 will-change-transform ${isActive ? 'text-tomato-jam' : 'text-onyx/70'
                      }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Streak & CP Score Pills (compact, visible only on sm-lg) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Streak Pill */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-golden-sand/15 border border-onyx/12 text-onyx text-[10px] font-bold shadow-2xs">
              <Flame className="w-3 h-3 fill-tomato-jam text-tomato-jam" />
              <span>{CURRENT_USER.currentStreak}d</span>
            </div>

            {/* Mobile CP Score Pill */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-golden-sand/10 border border-onyx/12 text-onyx text-[10px] font-bold shadow-2xs">
              <span>⭐</span>
              <span>{(CURRENT_USER.cpScore / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Right section: Streak Pill, CP Score & User Avatar */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Daily Streak Counter Pill */}
            <div
              onMouseEnter={handleStreakEnter}
              onMouseLeave={handleStreakLeave}
              className="navbar-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-golden-sand/15 border border-onyx/12 text-onyx text-xs font-bold shadow-2xs cursor-pointer will-change-transform"
              title={`Daily Streak Multiplier: +${streakMultiplier}x (Caps at 1.60x for 60-day streak)`}
            >
              <Flame
                ref={streakFlameRef}
                className="w-4 h-4 fill-tomato-jam text-tomato-jam will-change-transform"
              />
              <span>{CURRENT_USER.currentStreak}-Day Streak</span>
              <span className="text-[10px] bg-tomato-jam text-white px-1.5 py-0.2 rounded-full">
                {streakMultiplier}x
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

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
                suppressHydrationWarning
                className="relative rounded-full border border-onyx/12 hover:border-tomato-jam/50 hover:bg-golden-sand/10 transition-colors duration-200 will-change-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-tomato-jam/50"
              >
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  className="avatar-img w-9 h-9 rounded-full object-cover ring-2 ring-tomato-jam/40 will-change-transform"
                  fetchPriority="high"
                />
              </button>

              {/* Desktop Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-onyx/12 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-onyx/10">
                    <p className="text-xs font-black text-onyx truncate">{CURRENT_USER.name}</p>
                    <p className="text-[11px] text-onyx/60 truncate">{CURRENT_USER.email || `${CURRENT_USER.department} Student`}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-onyx hover:bg-golden-sand/20 transition-colors"
                    >
                      <User className="w-4 h-4 text-tomato-jam" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-onyx hover:bg-golden-sand/20 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-onyx/70" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-onyx/10">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-black text-tomato-jam hover:bg-tomato-jam/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive
                    ? 'bg-golden-sand/20 text-tomato-jam font-semibold'
                    : 'text-onyx/70 hover:bg-golden-sand/12'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-tomato-jam' : 'text-onyx/70'}`} />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-onyx/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-tomato-jam hover:bg-tomato-jam/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

