import React from 'react';
import { TierName } from '@/types';

interface MascotRendererProps {
  tier: TierName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCard?: boolean;
}

export function MascotRenderer({
  tier,
  size = 'md',
  showCard = true,
}: MascotRendererProps) {
  const sizeClassMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  const mascotData: Record<
    TierName,
    {
      title: string;
      subtitle: string;
      description: string;
      badgeText: string;
      bgGradient: string;
      svgContent: React.ReactNode;
    }
  > = {
    Spark: {
      title: 'SPARK',
      subtitle: 'The Awakening',
      description: 'A glowing ember waiting to ignite into a flame chick.',
      badgeText: 'LEVEL 1+',
      bgGradient: 'from-amber-50 to-orange-100/60 border-amber-200',
      svgContent: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="28" fill="url(#sparkGrad)" />
          <circle cx="50" cy="50" r="18" fill="#FEF08A" opacity="0.8" />
          <path
            d="M50 15 L55 35 L75 40 L55 45 L50 65 L45 45 L25 40 L45 35 Z"
            fill="#F97316"
          />
          <defs>
            <radialGradient id="sparkGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    Ember: {
      title: 'FLAMCHI 🔥',
      subtitle: 'The Ember Chick',
      description:
        'A tiny chick born from a spark. It loves warmth and follows its trainer everywhere.',
      badgeText: 'LEVEL 11+',
      bgGradient: 'from-orange-50 to-amber-100/70 border-orange-200',
      svgContent: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Flame Tail */}
          <path
            d="M30 65 Q18 55 24 40 Q28 50 35 60 Z"
            fill="#EA580C"
          />
          {/* Chick Body */}
          <ellipse cx="50" cy="60" rx="22" ry="20" fill="#F97316" />
          <circle cx="50" cy="42" r="18" fill="#F59E0B" />
          {/* Eyes */}
          <circle cx="44" cy="40" r="2.8" fill="#1E293B" />
          <circle cx="56" cy="40" r="2.8" fill="#1E293B" />
          <circle cx="43" cy="39" r="1" fill="#FFFFFF" />
          <circle cx="55" cy="39" r="1" fill="#FFFFFF" />
          {/* Beak */}
          <polygon points="50,43 45,49 55,49" fill="#EA580C" />
          {/* Little Flame Crest */}
          <path d="M48 24 Q52 14 60 20 Q56 26 52 24 Z" fill="#EF4444" />
          <path d="M44 26 Q46 18 52 22 Z" fill="#F59E0B" />
          {/* Cute cheeks */}
          <ellipse cx="38" cy="45" rx="3" ry="1.5" fill="#EF4444" opacity="0.6" />
          <ellipse cx="62" cy="45" rx="3" ry="1.5" fill="#EF4444" opacity="0.6" />
        </svg>
      ),
    },
    Flame: {
      title: 'FLAMIRO 🔥',
      subtitle: 'The Flame Bird',
      description:
        'Its body burns brighter as it grows. It can soar high and leave trails of fire in the sky.',
      badgeText: 'LEVEL 26+',
      bgGradient: 'from-red-50 via-orange-50 to-amber-100/80 border-red-200',
      svgContent: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          {/* Flame Wings */}
          <path
            d="M15 45 Q5 25 30 35 Q20 45 35 55 Z"
            fill="url(#flamiroWing)"
          />
          <path
            d="M85 45 Q95 25 70 35 Q80 45 65 55 Z"
            fill="url(#flamiroWing)"
          />
          {/* Body */}
          <path
            d="M50 78 Q35 65 38 48 Q50 30 62 48 Q65 65 50 78 Z"
            fill="#EA580C"
          />
          <circle cx="50" cy="38" r="16" fill="#F97316" />
          {/* Majestic Crest */}
          <path d="M48 22 Q56 8 68 18 Q60 26 52 24 Z" fill="#EF4444" />
          <path d="M43 25 Q48 14 58 20 Z" fill="#F59E0B" />
          {/* Eyes */}
          <ellipse cx="44" cy="36" rx="3" ry="4" fill="#0F172A" />
          <ellipse cx="56" cy="36" rx="3" ry="4" fill="#0F172A" />
          <circle cx="43" cy="35" r="1.2" fill="#FFFFFF" />
          <circle cx="55" cy="35" r="1.2" fill="#FFFFFF" />
          {/* Beak */}
          <polygon points="50,39 44,47 56,47" fill="#FBBF24" />
          {/* Chest Feathers */}
          <path d="M50 55 Q44 65 50 72 Q56 65 50 55 Z" fill="#FDE047" opacity="0.8" />
          <defs>
            <linearGradient id="flamiroWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    Phoenix: {
      title: 'PYRAVIAN 🔥',
      subtitle: 'The Inferno Phoenix',
      description:
        'The legendary phoenix of flames. Its wings can light up the darkest skies and bring hope.',
      badgeText: 'LEVEL 51+',
      bgGradient: 'from-rose-50 via-orange-50 to-amber-100 border-rose-300',
      svgContent: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {/* Radiant Wings */}
          <path
            d="M5 40 Q2 15 28 25 Q12 35 32 45 Q15 55 38 65 Z"
            fill="url(#pyravianWing)"
          />
          <path
            d="M95 40 Q98 15 72 25 Q88 35 68 45 Q85 55 62 65 Z"
            fill="url(#pyravianWing)"
          />
          {/* Flame Tail */}
          <path d="M50 88 Q35 75 42 65 Q50 95 58 65 Q65 75 50 88 Z" fill="#DC2626" />
          {/* Majestic Body */}
          <ellipse cx="50" cy="55" rx="16" ry="22" fill="url(#pyravianBody)" />
          {/* Head & Crown */}
          <circle cx="50" cy="32" r="14" fill="#EA580C" />
          <path d="M42 20 Q50 2 68 12 Q58 24 50 22 Z" fill="#EF4444" />
          <path d="M38 22 Q44 8 58 14 Z" fill="#F59E0B" />
          <path d="M54 18 Q62 6 72 16 Z" fill="#DC2626" />
          {/* Eyes with fire glow */}
          <circle cx="44" cy="31" r="3" fill="#FEF08A" />
          <circle cx="56" cy="31" r="3" fill="#FEF08A" />
          <circle cx="44" cy="31" r="1.5" fill="#991B1B" />
          <circle cx="56" cy="31" r="1.5" fill="#991B1B" />
          {/* Beak */}
          <polygon points="50,34 44,43 56,43" fill="#FEF08A" />
          <defs>
            <linearGradient id="pyravianWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
            <radialGradient id="pyravianBody" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="60%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    Ascendant: {
      title: 'ASCENDANT PHOENIX 👑',
      subtitle: 'Legendary Immortal',
      description:
        'The apex sovereign of competitive programming. Radiating celestial fire and unmatched mastery.',
      badgeText: 'LEVEL 76+',
      bgGradient: 'from-purple-50 via-rose-50 to-amber-100 border-purple-300',
      svgContent: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          {/* Aura */}
          <circle cx="50" cy="50" r="42" fill="url(#ascendantAura)" opacity="0.6" />
          {/* Celestial Wings */}
          <path
            d="M2 35 Q-2 8 26 18 Q8 28 30 40 Q10 50 38 60 Q20 70 42 75 Z"
            fill="url(#ascendantWing)"
          />
          <path
            d="M98 35 Q102 8 74 18 Q92 28 70 40 Q90 50 62 60 Q80 70 58 75 Z"
            fill="url(#ascendantWing)"
          />
          {/* Phoenix Body */}
          <ellipse cx="50" cy="52" rx="17" ry="24" fill="url(#ascendantBody)" />
          <circle cx="50" cy="28" r="14" fill="#9333EA" />
          {/* Crown of Fire */}
          <path d="M40 16 L45 4 L50 12 L55 4 L60 16 Z" fill="#FACC15" />
          {/* Eyes */}
          <circle cx="44" cy="27" r="3" fill="#FFFFFF" />
          <circle cx="56" cy="27" r="3" fill="#FFFFFF" />
          <circle cx="44" cy="27" r="1.5" fill="#7E22CE" />
          <circle cx="56" cy="27" r="1.5" fill="#7E22CE" />
          {/* Golden Beak */}
          <polygon points="50,30 44,39 56,39" fill="#FDE047" />
          <defs>
            <linearGradient id="ascendantWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="40%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="ascendantBody" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#7E22CE" />
            </radialGradient>
            <radialGradient id="ascendantAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
  };

  const current = mascotData[tier] || mascotData.Flame;

  if (!showCard) {
    return <div className={`inline-block ${sizeClassMap[size]}`}>{current.svgContent}</div>;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 bg-gradient-to-br ${current.bgGradient} shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className="absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-orange-600 border border-orange-200/60 shadow-2xs">
        {current.badgeText}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className={`shrink-0 ${sizeClassMap[size]}`}>{current.svgContent}</div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {current.title}
            </h4>
          </div>
          <p className="text-xs font-semibold text-orange-600 mt-0.5">
            {current.subtitle}
          </p>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}
