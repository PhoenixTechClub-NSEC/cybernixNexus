'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  BookOpen,
  User,
  Calendar,
  Plus,
  Settings,
  Flame,
  X,
  CheckCircle2,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const ACTIVE_BG_COLOR = "#FFF1D6";

export function Sidebar() {
  const pathname = usePathname();
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformName, setPlatformName] = useState('Codeforces');
  const [platformHandle, setPlatformHandle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const logoFlameRef = useRef<SVGSVGElement>(null);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rankings', href: '/rankings', icon: Trophy },
    { name: 'Editorials', href: '/editorials', icon: BookOpen },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Contests', href: '/contests', icon: Calendar },
  ];

  const [integrations, setIntegrations] = useState([
    { name: 'Codeforces', handle: 'rudra_nsec', dot: 'bg-tomato-jam' },
    { name: 'LeetCode', handle: 'rudra_pratap', dot: 'bg-golden-sand' },
    { name: 'CodeChef', handle: 'rudra_nsec', dot: 'bg-pine-teal' },
  ]);

  // Initial Staggered Mount Animations (60fps, GPU transform-only)
  const { contextSafe } = useGSAP(
    () => {
      // Animate Logo Entrance
      gsap.from('.sidebar-logo', {
        y: -15,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      });

      // Staggered Nav Items Entrance
      gsap.from('.nav-item-wrapper', {
        x: -20,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      // Integrations & League section staggered entrance
      gsap.from('.sidebar-section', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.15,
        clearProps: 'transform',
      });
    },
    { scope: sidebarRef }
  );

  // Modal Open Animation
  useGSAP(
    () => {
      if (isPlatformModalOpen && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.88, y: 28, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' }
        );
      }
    },
    { dependencies: [isPlatformModalOpen] }
  );

  // Toast Notification Entrance
  useGSAP(
    () => {
      if (toastMessage && toastRef.current) {
        gsap.fromTo(
          toastRef.current,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'back.out(1.8)',
          }
        );
      }
    },
    { dependencies: [toastMessage] }
  );

  // Interactive contextSafe Hover Micro-Animations (Zero lag, no memory leak)
  const handleLogoEnter = contextSafe(() => {
    gsap.to(logoFlameRef.current, {
      scale: 1.25,
      rotation: 15,
      duration: 0.35,
      ease: 'back.out(3)',
    });
  });

  const handleLogoLeave = contextSafe(() => {
    gsap.to(logoFlameRef.current, {
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
        x: 4,
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
        x: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleIntegrationEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const dot = e.currentTarget.querySelector('.integration-dot');
    gsap.to(e.currentTarget, {
      x: 5,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (dot) {
      gsap.to(dot, {
        scale: 1.8,
        duration: 0.35,
        ease: 'back.out(3)',
      });
    }
  });

  const handleIntegrationLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const dot = e.currentTarget.querySelector('.integration-dot');
    gsap.to(e.currentTarget, {
      x: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (dot) {
      gsap.to(dot, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handlePlusEnter = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    const icon = e.currentTarget.querySelector('.plus-icon');
    gsap.to(e.currentTarget, { x: 3, duration: 0.2, ease: 'power2.out' });
    if (icon) {
      gsap.to(icon, {
        rotation: 90,
        scale: 1.25,
        duration: 0.3,
        ease: 'back.out(2.5)',
      });
    }
  });

  const handlePlusLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    const icon = e.currentTarget.querySelector('.plus-icon');
    gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' });
    if (icon) {
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleDeptEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const badge = e.currentTarget.querySelector('.dept-badge');
    if (badge) {
      gsap.to(badge, {
        scale: 1.15,
        y: -2,
        duration: 0.3,
        ease: 'back.out(3)',
      });
    }
  });

  const handleDeptLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const badge = e.currentTarget.querySelector('.dept-badge');
    if (badge) {
      gsap.to(badge, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleSettingsEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const cog = e.currentTarget.querySelector('.settings-cog');
    if (cog) {
      gsap.to(cog, {
        rotation: '+=90',
        scale: 1.15,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  });

  const handleSettingsLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const cog = e.currentTarget.querySelector('.settings-cog');
    if (cog) {
      gsap.to(cog, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformHandle.trim()) return;

    const dotColor =
      platformName === 'Codeforces'
        ? 'bg-tomato-jam'
        : platformName === 'LeetCode'
        ? 'bg-golden-sand'
        : 'bg-pine-teal';

    setIntegrations([
      ...integrations,
      { name: platformName, handle: platformHandle.trim(), dot: dotColor },
    ]);
    setIsPlatformModalOpen(false);
    setPlatformHandle('');
    setToastMessage(`Connected ${platformName} (@${platformHandle.trim()}) successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-dark-amethyst text-white py-8 pr-0 pl-4 h-screen sticky top-0 z-30"
      >
        <div className="space-y-8">
          {/* Brand Logo with Interactive GSAP Micro-Animation */}
          <Link
            href="/dashboard"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
            className="sidebar-logo flex items-center gap-3 px-3 mb-6 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-tomato-jam text-white shadow-md shadow-tomato-jam/30 shrink-0">
              <Flame
                ref={logoFlameRef}
                className="w-6 h-6 fill-current will-change-transform"
              />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Cybernix<span className="text-golden-sand">Nexus</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-golden-sand/60 block -mt-1">
                NSEC Phoenix Club
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <div
                  key={item.name}
                  className={`nav-item-wrapper relative w-full ${
                    isActive ? 'translate-x-[1px]' : ''
                  }`}
                >
                  {isActive && (
                    <svg
                      className="absolute -top-6 right-0 w-6 h-6 pointer-events-none z-20"
                      viewBox="0 0 24 24"
                      style={{ color: ACTIVE_BG_COLOR }}
                      fill="currentColor"
                    >
                      <path d="M 0 24 A 24 24 0 0 0 24 0 L 24 24 Z" />
                    </svg>
                  )}

                  <Link
                    href={item.href}
                    onMouseEnter={handleNavEnter}
                    onMouseLeave={handleNavLeave}
                    className={`flex items-center gap-3.5 text-sm relative z-10 py-3.5 pl-5 ${
                      isActive
                        ? 'bg-[#FFF1D6] text-onyx font-black rounded-l-[1.5rem] pr-0'
                        : 'text-white/60 font-bold hover:text-white hover:bg-white/5 rounded-[1.5rem] mr-5 pr-4 transition-colors duration-200'
                    }`}
                  >
                    <Icon
                      className={`nav-icon w-5 h-5 shrink-0 will-change-transform ${
                        isActive
                          ? 'text-tomato-jam stroke-[2.5]'
                          : 'text-golden-sand/60 transition-colors duration-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>

                  {isActive && (
                    <svg
                      className="absolute -bottom-6 right-0 w-6 h-6 pointer-events-none z-20"
                      viewBox="0 0 24 24"
                      style={{ color: ACTIVE_BG_COLOR }}
                      fill="currentColor"
                    >
                      <path d="M 0 0 A 24 24 0 0 1 24 24 L 24 0 Z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </nav>

          {/* INTEGRATIONS SECTION */}
          <div className="sidebar-section pt-4 border-t border-white/10 pr-5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-golden-sand/60 px-4 block mb-3">
              Integrations
            </span>
            <div className="space-y-1">
              {integrations.map((plat) => (
                <div
                  key={plat.name}
                  onMouseEnter={handleIntegrationEnter}
                  onMouseLeave={handleIntegrationLeave}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer will-change-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`integration-dot w-2 h-2 rounded-full will-change-transform ${plat.dot}`}
                    ></span>
                    <span>{plat.name}</span>
                  </div>
                  <span className="text-[10px] text-golden-sand/50">Synced</span>
                </div>
              ))}
              <button
                onClick={() => setIsPlatformModalOpen(true)}
                onMouseEnter={handlePlusEnter}
                onMouseLeave={handlePlusLeave}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-golden-sand hover:bg-white/10 transition-colors cursor-pointer mt-1 will-change-transform"
              >
                <Plus className="plus-icon w-3.5 h-3.5 will-change-transform" />
                <span>Add new platform</span>
              </button>
            </div>
          </div>

          {/* TEAMS SECTION */}
          <div className="sidebar-section pt-4 border-t border-white/10 pr-5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-golden-sand/60 px-4 block mb-3">
              Teams &amp; League
            </span>
            <div className="space-y-1">
              <div
                onMouseEnter={handleDeptEnter}
                onMouseLeave={handleDeptLeave}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-white bg-tomato-jam/20 border border-tomato-jam/30 cursor-pointer transition-colors hover:bg-tomato-jam/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tomato-jam animate-pulse"></span>
                  <span>CSE Dept</span>
                </div>
                <span className="dept-badge text-[10px] font-black text-golden-sand bg-onyx px-2 py-0.5 rounded-md border border-golden-sand/30 will-change-transform">
                  2.0x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Bottom Item */}
        <div className="sidebar-section pt-4 border-t border-white/10 pr-5">
          <Link
            href="/profile"
            onMouseEnter={handleSettingsEnter}
            onMouseLeave={handleSettingsLeave}
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings className="settings-cog w-4 h-4 shrink-0 will-change-transform" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* CONNECT NEW PLATFORM MODAL */}
      {isPlatformModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl p-8 relative will-change-transform"
          >
            <button
              onClick={() => setIsPlatformModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1.5">
              Connect CP Platform
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Sync your problem-solving statistics and automatic department multipliers.
            </p>

            <form onSubmit={handleAddPlatform} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Platform Name
                </label>
                <select
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tomato-jam transition-shadow"
                >
                  <option value="Codeforces">Codeforces</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="CodeChef">CodeChef</option>
                  <option value="AtCoder">AtCoder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={platformHandle}
                  onChange={(e) => setPlatformHandle(e.target.value)}
                  placeholder="e.g. rudra_pratap"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tomato-jam transition-shadow"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPlatformModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm shadow-md shadow-tomato-jam/20 transition-colors cursor-pointer"
                >
                  Connect &amp; Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          ref={toastRef}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white text-sm font-extrabold shadow-2xl border border-white/10 will-change-transform"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}