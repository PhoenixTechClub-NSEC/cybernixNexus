/* eslint-disable react-hooks/refs */
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Flame, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FORMULA_INFO } from '@/lib/constants';

gsap.registerPlugin(useGSAP);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const flameRef = useRef<SVGSVGElement>(null);

  const { contextSafe } = useGSAP({ scope: footerRef });

  const handleLogoEnter = contextSafe(() => {
    if (flameRef.current) {
      gsap.to(flameRef.current, {
        rotation: -15,
        scale: 1.25,
        duration: 0.3,
        ease: 'back.out(3)',
      });
    }
  });

  const handleLogoLeave = contextSafe(() => {
    if (flameRef.current) {
      gsap.to(flameRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const handleBadgeEnter = contextSafe((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, {
      y: -3,
      scale: 1.15,
      duration: 0.25,
      ease: 'back.out(3)',
    });
  });

  const handleBadgeLeave = contextSafe((e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  });

  const handleLinkEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      x: 5,
      duration: 0.25,
      ease: 'back.out(2)',
    });
  });

  const handleLinkLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      duration: 0.2,
      ease: 'power2.out',
    });
  });

  const handlePlatformEnter = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const icon = e.currentTarget.querySelector('.ext-icon');
    gsap.to(e.currentTarget, {
      y: -3,
      scale: 1.07,
      duration: 0.25,
      ease: 'back.out(2.5)',
    });
    if (icon) {
      gsap.to(icon, {
        rotation: 45,
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(3)',
      });
    }
  });

  const handlePlatformLeave = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    const icon = e.currentTarget.querySelector('.ext-icon');
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    });
    if (icon) {
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  return (
    <footer
      ref={footerRef}
      className="border-t border-onyx/12 bg-white/80 backdrop-blur-md mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Club info */}
          <div className="space-y-3 md:col-span-1">
            <div
              onMouseEnter={handleLogoEnter}
              onMouseLeave={handleLogoLeave}
              className="flex items-center gap-2 cursor-pointer w-max"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-tomato-jam text-white shadow-sm">
                <Flame ref={flameRef} className="w-5 h-5 fill-current will-change-transform" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-onyx">
                Cybernix<span className="text-tomato-jam">Nexus</span>
              </span>
            </div>
            <p className="text-xs text-onyx/70 leading-relaxed">
              Official Competitive Programming Platform for Netaji Subhash Engineering College (NSEC) • Phoenix Tech Club.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['CSE', 'IT', 'ECE', 'AI&DS', 'EE', 'ME'].map((dept) => (
                <span
                  key={dept}
                  onMouseEnter={handleBadgeEnter}
                  onMouseLeave={handleBadgeLeave}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-golden-sand/20 text-onyx border border-onyx/12 cursor-pointer will-change-transform"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-onyx/70">
              Core Sections
            </h4>
            <ul className="space-y-2 text-xs text-onyx/70">
              <li>
                <Link
                  href="/dashboard"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className="inline-block hover:text-tomato-jam transition-colors will-change-transform"
                >
                  Dashboard & Quick Stats
                </Link>
              </li>
              <li>
                <Link
                  href="/rankings"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className="inline-block hover:text-tomato-jam transition-colors will-change-transform"
                >
                  Rankings & Dept Battles
                </Link>
              </li>
              <li>
                <Link
                  href="/editorials"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className="inline-block hover:text-tomato-jam transition-colors will-change-transform"
                >
                  Solution & Editorial Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className="inline-block hover:text-tomato-jam transition-colors will-change-transform"
                >
                  Student Profile & Heatmap
                </Link>
              </li>
              <li>
                <Link
                  href="/contests"
                  onMouseEnter={handleLinkEnter}
                  onMouseLeave={handleLinkLeave}
                  className="inline-block hover:text-tomato-jam transition-colors will-change-transform"
                >
                  Upcoming Matches Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Scoring & Formulas */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-onyx/70">
              CP Scoring Formula
            </h4>
            <div className="space-y-1.5 text-xs text-onyx/70 bg-golden-sand/10 p-3 rounded-xl border border-onyx/12">
              <p className="font-mono text-[11px] font-semibold text-onyx">
                {FORMULA_INFO.formula}
              </p>
              <p className="text-[11px] text-onyx/70">
                • <strong>Weights:</strong> CF (1.75x) | LeetCode (1.5x) | CC (1.25x) | GFG (1.0x)
              </p>
              <p className="text-[11px] text-onyx/70">
                • <strong>Streak Bonus:</strong> {FORMULA_INFO.streakBonus}
              </p>
              <p className="text-[11px] text-onyx/70">
                • <strong>Level Req:</strong> 50 × (L - 1)^1.6
              </p>
            </div>
          </div>

          {/* Col 4: Platform sync info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-onyx/70">
              Synced Platforms
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { name: 'Codeforces', url: 'https://codeforces.com' },
                { name: 'LeetCode', url: 'https://leetcode.com' },
                { name: 'CodeChef', url: 'https://codechef.com' },
                { name: 'GFG', url: 'https://geeksforgeeks.org' },
                { name: 'HackerRank', url: 'https://hackerrank.com' },
              ].map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={handlePlatformEnter}
                  onMouseLeave={handlePlatformLeave}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-onyx/12 text-onyx hover:border-tomato-jam/50 hover:text-tomato-jam transition-colors cursor-pointer will-change-transform"
                >
                  <span>{p.name}</span>
                  <ExternalLink className="ext-icon w-3 h-3 text-onyx/70 will-change-transform" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-onyx/70 pt-2">
              Built by NSEC Phoenix Tech Club • Avahan 2026 Edition.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-onyx/12 flex flex-col sm:flex-row items-center justify-between text-xs text-onyx/70">
          <p>© 2026 Cybernix Nexus • Netaji Subhash Engineering College. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1 text-tomato-jam font-medium">
              <span className="w-2 h-2 rounded-full bg-tomato-jam animate-pulse"></span>
              Live Synced: 564 Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

