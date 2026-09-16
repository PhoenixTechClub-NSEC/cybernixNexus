'use client';

import React, { useRef } from 'react';
import { UserProfile } from '@/types';
import { Trophy, } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface PodiumProps {
  users: UserProfile[];
  onSelectUser?: (user: UserProfile) => void;
}

export function Podium({ users, onSelectUser }: PodiumProps) {
  const podiumRef = useRef<HTMLDivElement>(null);

  const sorted = [...users].sort((a, b) => b.cpScore - a.cpScore);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Buttery-smooth 60fps Staggered Podium Entrance
  useGSAP(
    () => {
      gsap.fromTo('.podium-item', 
        {
          y: 40,
          opacity: 0,
          scale: 0.9,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(2)',
          clearProps: 'transform',
        }
      );
    },
    { scope: podiumRef, dependencies: [users], revertOnUpdate: true }
  );

  const { contextSafe } = useGSAP({ scope: podiumRef });

  const handlePodiumEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const avatar = e.currentTarget.querySelector('.podium-avatar');
    const iconBadge = e.currentTarget.querySelector('.podium-rank-icon');
    gsap.to(e.currentTarget, {
      y: -8,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (avatar) {
      gsap.to(avatar, {
        scale: 1.15,
        rotation: 6,
        duration: 0.35,
        ease: 'back.out(2.5)',
      });
    }
    if (iconBadge) {
      gsap.to(iconBadge, {
        y: -5,
        scale: 1.3,
        duration: 0.35,
        ease: 'back.out(3)',
      });
    }
  });

  const handlePodiumLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const avatar = e.currentTarget.querySelector('.podium-avatar');
    const iconBadge = e.currentTarget.querySelector('.podium-rank-icon');
    gsap.to(e.currentTarget, {
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (avatar) {
      gsap.to(avatar, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
    if (iconBadge) {
      gsap.to(iconBadge, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  const renderPodiumItem = (user: UserProfile | undefined, position: 1 | 2 | 3) => {
    const isFirst = position === 1;
    const heightClass = isFirst ? 'h-32 sm:h-48' : position === 2 ? 'h-24 sm:h-36' : 'h-20 sm:h-28';
    const numColor = isFirst ? 'text-golden-sand/40' : position === 2 ? 'text-slate-300/40' : 'text-amber-600/40';
    const borderGlow = isFirst ? 'border-golden-sand shadow-[0_0_15px_rgba(255,159,28,0.15)]' : 'border-white/10';
    const bgFrost = isFirst ? 'bg-white/20' : position === 2 ? 'bg-white/10' : 'bg-white/5';

    if (!user) {
      return (
        <div
          key={`placeholder-${position}`}
          className={`podium-item flex flex-col items-center justify-end w-full will-change-transform opacity-60 ${
            isFirst ? 'order-2 z-10' : position === 2 ? 'order-1' : 'order-3'
          }`}
        >
          <div className="relative mb-3 z-10 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 text-white/40 text-xl font-bold">
              ?
            </div>
            <div className="absolute -bottom-3 -right-2 text-xl drop-shadow-md">
              {isFirst ? '🥇' : position === 2 ? '🥈' : '🥉'}
            </div>
          </div>

          <div className="flex flex-col items-center mb-2 px-1 text-center">
            <span className="font-bold text-xs sm:text-sm text-white/50">Open Spot</span>
            <span className="text-[10px] text-white/40 font-medium">Rank #{position}</span>
          </div>

          <div className={`w-full rounded-t-2xl backdrop-blur-md flex flex-col items-center justify-center pt-3 relative ${bgFrost} border ${borderGlow} border-b-0 ${heightClass}`}>
            <span className={`text-3xl sm:text-5xl font-black ${numColor}`}>{position}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={user.id}
        onClick={() => onSelectUser && onSelectUser(user)}
        onMouseEnter={handlePodiumEnter}
        onMouseLeave={handlePodiumLeave}
        className={`podium-item flex flex-col items-center justify-end group cursor-pointer w-full will-change-transform ${
          isFirst ? 'order-2 z-10' : position === 2 ? 'order-1' : 'order-3'
        }`}
      >
        <div className="relative mb-3 z-10 flex flex-col items-center">
          {isFirst && (
            <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(255,159,28,0.6)] z-20">👑</div>
          )}
          <img
            src={user.avatar}
            alt={user.name}
            className={`podium-avatar w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 bg-white shadow-lg will-change-transform ${
              isFirst ? 'border-golden-sand' : position === 2 ? 'border-slate-300' : 'border-amber-600'
            }`}
          />
          <div className="absolute -bottom-3 -right-2 text-xl drop-shadow-md">
            {isFirst ? '🥇' : position === 2 ? '🥈' : '🥉'}
          </div>
        </div>

        <div className="flex flex-col items-center mb-2 px-1">
          <span className={`font-black text-center truncate w-full text-xs sm:text-sm ${isFirst ? 'text-golden-sand' : 'text-white'}`}>
            {user.name.split(' ')[0]}
          </span>
          <span className="text-[10px] sm:text-xs text-white/60 font-bold mt-0.5">
            {user.department}
          </span>
        </div>

        <div className={`w-full rounded-t-2xl backdrop-blur-md flex flex-col items-center pt-3 relative ${bgFrost} border ${borderGlow} border-b-0 ${heightClass}`}>
           <span className={`text-3xl sm:text-5xl font-black ${numColor}`}>{position}</span>
           <div className="mt-auto pb-4 text-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
             <div className="text-[10px] font-bold text-white/70">CP Score</div>
             <div className="text-sm font-black text-white">{user.cpScore.toLocaleString()}</div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={podiumRef}
      className="relative w-full rounded-3xl bg-onyx text-white overflow-hidden shadow-lg border border-onyx/20 p-6 sm:p-8 gpu-accelerated"
    >
      {/* Background Glows & Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pine-teal/40 via-onyx to-onyx"></div>
      <div className="absolute top-10 left-10 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px] animate-pulse"></div>
      <div className="absolute top-16 right-16 w-2 h-2 bg-golden-sand rounded-full blur-[1px] animate-pulse delay-75"></div>
      <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.5px] animate-pulse delay-150"></div>
      <div className="absolute bottom-1/4 right-10 w-1 h-1 bg-white/40 rounded-full blur-[0.5px] animate-pulse delay-300"></div>
      
      <div className="relative z-10 text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-golden-sand/20 text-golden-sand text-xs font-extrabold tracking-wider uppercase border border-golden-sand/30">
          <Trophy className="w-3.5 h-3.5 text-golden-sand" />
          Top 3 Spotlight • NSEC Champions
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
          College CP Top Performers
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto mt-1">
          Highlighting the #1, #2, and #3 top programmers in Netaji Subhash Engineering College across all departments.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 items-end justify-center max-w-2xl mx-auto pt-4 h-[250px] sm:h-[300px]">
        {renderPodiumItem(second, 2)}
        {renderPodiumItem(first, 1)}
        {renderPodiumItem(third, 3)}
      </div>
    </div>
  );
}

