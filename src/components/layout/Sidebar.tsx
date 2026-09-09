/* eslint-disable react-hooks/refs */
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  BookOpen,
  User,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useUser } from '@/components/providers/UserProvider';

gsap.registerPlugin(useGSAP);

const ACTIVE_BG_COLOR = "#FFF1D6";

export function Sidebar() {
  const pathname = usePathname();
  const { user: CURRENT_USER, logout } = useUser();

  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Active Tab Bubble Sliding Animation
  useGSAP(
    () => {
      if (!sidebarRef.current) return;

      const activeWrapper = sidebarRef.current.querySelector('.nav-item-wrapper[data-active="true"]') as HTMLElement;
      const selector = sidebarRef.current.querySelector('.selector-active') as HTMLElement;

      if (selector) {
        if (activeWrapper) {
          gsap.to(selector, {
            top: activeWrapper.offsetTop,
            height: activeWrapper.offsetHeight,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(1.5)',
          });
        } else {
          gsap.to(selector, { opacity: 0, duration: 0.3 });
        }
      }
    },
    { dependencies: [pathname], scope: sidebarRef }
  );

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Rankings', href: '/rankings', icon: Trophy },
    { name: 'Editorials', href: '/editorials', icon: BookOpen },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Contests', href: '/contests', icon: Calendar },
  ];



  // Initial Staggered Mount Animations (60fps, GPU transform-only)
  const { contextSafe } = useGSAP(
    () => {
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



  const handleDeptEnter = contextSafe((e: React.MouseEvent<HTMLElement>) => {
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

  const handleDeptLeave = contextSafe((e: React.MouseEvent<HTMLElement>) => {
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
        x: 4,
        rotation: '+=90',
        scale: 1.15,
        duration: 0.25,
        ease: 'back.out(2.5)',
      });
    }
  });

  const handleSettingsLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const cog = e.currentTarget.querySelector('.settings-cog');
    if (cog) {
      gsap.to(cog, {
        x: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });



  return (
    <>
      <aside
        ref={sidebarRef}
        className="w-72 shrink-0 hidden lg:flex flex-col justify-between bg-dark-amethyst text-white py-8 pr-0 pl-4 h-screen sticky top-0 z-30 relative"
      >
        {/* The Dynamic Sliding Bubble */}
        <div
          className="selector-active absolute right-0 w-full bg-[#FFF1D6] rounded-l-[1.5rem] pointer-events-none z-0"
          style={{ top: 0, height: 48, opacity: 0 }}
        >
          <svg
            className="absolute -top-6 right-0 w-6 h-6"
            viewBox="0 0 24 24"
            style={{ color: ACTIVE_BG_COLOR }}
            fill="currentColor"
          >
            <path d="M 0 24 A 24 24 0 0 0 24 0 L 24 24 Z" />
          </svg>
          <svg
            className="absolute -bottom-6 right-0 w-6 h-6"
            viewBox="0 0 24 24"
            style={{ color: ACTIVE_BG_COLOR }}
            fill="currentColor"
          >
            <path d="M 0 0 A 24 24 0 0 1 24 24 L 24 0 Z" />
          </svg>
        </div>

        <div className="space-y-8">
          {/* Brand Logo */}
          <Link
            href="/dashboard"
            className="sidebar-logo flex items-center gap-3 px-3 pr-6 mb-6 cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <img
                src="/pheonix_mod1.png"
                alt="Phoenix Logo"
                className="w-10 h-10 object-contain drop-shadow-md scale-[3] brightness-0 invert"
              />
            </div>
            <div className="pr-4">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
                Cybernix <span className="text-golden-sand">Nexus</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-golden-sand/60 block mt-0.5">
                NSEC PHOENIX CLUB . cybernix
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5" ref={navRef}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <div
                  key={item.name}
                  data-active={isActive}
                  className={`nav-item-wrapper relative w-full ${isActive ? 'translate-x-[1px]' : ''
                    }`}
                >
                  <Link
                    href={item.href}
                    onMouseEnter={handleNavEnter}
                    onMouseLeave={handleNavLeave}
                    className={`flex items-center gap-3.5 text-base relative z-10 py-3.5 pl-5 ${isActive
                        ? 'text-onyx font-black pr-0'
                        : 'text-white/60 font-bold hover:text-white hover:bg-white/5 rounded-[1.5rem] mr-5 pr-4 transition-colors duration-200'
                      }`}
                  >
                    <Icon
                      className={`nav-icon w-5 h-5 shrink-0 will-change-transform ${isActive
                          ? 'text-tomato-jam stroke-[2.5]'
                          : 'text-golden-sand/60 transition-colors duration-200'
                        }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </nav>



          {/* TEAMS SECTION */}
          <div className="sidebar-section pt-4 border-t border-white/10 pr-5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-golden-sand/60 px-4 block mb-3">
              Teams &amp; League
            </span>
            <div className="space-y-1">
              <Link
                href="/rankings"
                onMouseEnter={handleDeptEnter}
                onMouseLeave={handleDeptLeave}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-white bg-tomato-jam/20 border border-tomato-jam/30 cursor-pointer transition-colors hover:bg-tomato-jam/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tomato-jam"></span>
                  <span>{CURRENT_USER.department || 'CSE'} Dept</span>
                </div>
                <span className="dept-badge text-xs font-black text-golden-sand bg-onyx px-2 py-0.5 rounded-md border border-golden-sand/30 will-change-transform">
                  #{CURRENT_USER.deptRank || 1}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Settings & Sign Out Bottom Items */}
        <div className="sidebar-section pt-4 border-t border-white/10 space-y-1">
          <div data-active={pathname === '/settings'} className={`nav-item-wrapper relative w-full ${pathname === '/settings' ? 'translate-x-[1px]' : ''}`}>
            <Link
              href="/settings"
              onMouseEnter={handleSettingsEnter}
              onMouseLeave={handleSettingsLeave}
              className={`flex items-center gap-3.5 text-base relative z-10 py-3 pl-5 ${pathname === '/settings'
                  ? 'text-onyx font-black pr-0'
                  : 'text-white/50 font-bold hover:text-white hover:bg-white/5 rounded-[1.5rem] mr-5 pr-4 transition-colors duration-200'
                }`}
            >
              <Settings className={`settings-cog w-5 h-5 shrink-0 will-change-transform ${pathname === '/settings' ? 'text-tomato-jam stroke-[2.5]' : ''}`} />
              <span>Settings</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-3.5 text-base relative z-10 py-3 pl-5 text-white/50 font-bold hover:text-tomato-jam hover:bg-white/5 rounded-[1.5rem] mr-5 pr-4 transition-colors duration-200 cursor-pointer"
            title="Sign out and clear session"
          >
            <LogOut className="w-5 h-5 shrink-0 text-tomato-jam/80" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>


    </>
  );
}