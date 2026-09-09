import React from 'react';
import { TierName } from '@/types';
import { LEVEL_TIERS } from '@/lib/constants';

interface LevelBadgeProps {
  level: number;
  tier: TierName;
  size?: 'sm' | 'md' | 'lg';
  showMascotName?: boolean;
}

export function LevelBadge({
  level,
  tier,
  size = 'md',
  showMascotName = false,
}: LevelBadgeProps) {
  const tierInfo = LEVEL_TIERS.find((t) => t.tierName === tier) || LEVEL_TIERS[0];

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 rounded-md font-bold whitespace-nowrap',
    md: 'text-xs px-2 py-1 gap-1.5 rounded-lg font-bold whitespace-nowrap',
    lg: 'text-sm px-3 py-1.5 gap-2 rounded-xl font-black shadow-sm whitespace-nowrap',
  };

  const badgeIconMap: Record<TierName, string> = {
    Spark: '✨',
    Ember: '🐣',
    Flame: '🦅',
    Phoenix: '🔥',
    Ascendant: '👑',
  };

  return (
    <span
      className={`inline-flex items-center border ${tierInfo.bgLight} ${tierInfo.color} ${sizeStyles[size]} transition-transform duration-200 hover:scale-105`}
      title={`Level ${level} (${tierInfo.levelRange}) — ${tierInfo.mascotName}`}
    >
      <span className="text-base leading-none">{badgeIconMap[tier]}</span>
      <span className="font-bold">Lvl {level}</span>
      {showMascotName && (
        <span className="ml-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-white/80 rounded border border-current/20">
          {tierInfo.mascotName}
        </span>
      )}
    </span>
  );
}
