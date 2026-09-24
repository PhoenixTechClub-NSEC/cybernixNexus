/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  WEEKLY_VELOCITY_DATA,
} from '@/lib/constants';
import { useUser } from '@/components/providers/UserProvider';
import {
  Share2,
  MoreVertical,
  Download,
  CheckCircle2,
  Bell,
  Plus,
  Pin,
  Edit2,
  Trash2,
  ChevronRight,
  LayoutGrid,
  List,
  Trophy,
  Flame,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Award,
  Check,
  Globe,
  ExternalLink,
  Eye,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/* ============================================================================
 * [BACKEND INTEGRATION POINT: DASHBOARD STATISTICS & RATING HISTORY]
 *
 * 1. GET /api/v1/dashboard/overview?userId={CURRENT_USER.id}
 *    - Description: Returns combined stats across CodeChef, Codeforces, LeetCode & GFG.
 *    - Response Payload:
 *      {
 *        "globalRank": 28, "collegeRank": 3, "departmentRank": 1,
 *        "cpScore": 24500, "currentStreak": 21, "solvedCount": 1232
 *      }
 *
 * 2. GET /api/v1/dashboard/rating-history?platform={CodeChef|Codeforces|LeetCode}
 *    - Description: Returns chronological contest rating history for the dynamic SVG Ember Graph.
 *
 * 3. GET /api/v1/dashboard/goals
 *    - Description: Returns user's active weekly practice goals and completion checkboxes.
 *
 * 4. POST /api/v1/dashboard/goals/toggle
 *    - Description: Updates the completion boolean state of a weekly goal in the database.
 * ============================================================================ */

interface ContestDataPoint {
  id: string;
  contestName: string;
  date: string;
  rating: number;
  delta: number;
  rank: number;
}

const UPCOMING_EVENTS = [
  { id: 1, title: 'Codeforces Round #962', subtitle: 'Tomorrow, 8:00 PM', type: 'Contest', badge: 'Upcoming', action: 'View', link: '/contests' },
  { id: 2, title: 'Dynamic Programming Sprint', subtitle: 'Ongoing • NSEC Phoenix Club', type: 'Practice', badge: '83%', action: 'Continue', link: '/editorials' },
  { id: 3, title: 'LeetCode Weekly 400', subtitle: 'Sunday, 8:00 AM', type: 'Contest', badge: 'Registered', action: 'View', link: '/contests' },
  { id: 4, title: 'CodeChef Starters 120', subtitle: 'Next Wed, 8:00 PM', type: 'Contest', badge: 'Upcoming', action: 'View', link: '/contests' },
];

const getLevelForTier = (tier: string) => {
  switch (tier) {
    case 'Spark': return 1;
    case 'Ember': return 2;
    case 'Flame': return 3;
    case 'Phoenix': return 4;
    case 'Ascendant': return 5;
    default: return 1;
  }
};

export default function DashboardPage() {
  const { user: CURRENT_USER } = useUser();
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  const activeLevel = getLevelForTier(CURRENT_USER.tier);
    
  const currentIllusSrc = `/lvl-${activeLevel}.png`;
  const isBigLvl = activeLevel >= 3;

  const desktopWrapperClasses = `absolute hidden sm:block z-20 pointer-events-none transition-all duration-500 ease-out ${
    isBigLvl
      ? '-right-8 sm:-right-6 lg:-right-4 -top-24 sm:-top-36 lg:-top-40'
      : '-right-10 sm:-right-8 lg:-right-6 -top-20 sm:-top-28 lg:-top-32'
  }`;

  const desktopImgClasses = `hero-illustration w-auto object-contain select-none drop-shadow-xl origin-bottom will-change-transform transition-all duration-500 ease-out ${
    isBigLvl
      ? 'h-72 sm:h-96 lg:h-[28rem]'
      : 'h-64 sm:h-80 lg:h-96'
  }`;

  const mobileWrapperClasses = `absolute block sm:hidden z-20 pointer-events-none transition-all duration-500 ease-out overflow-hidden ${
    isBigLvl
      ? '-right-2 -top-12'
      : '-right-4 -top-8'
  }`;

  const mobileImgClasses = `hero-illustration w-auto object-contain select-none drop-shadow-md origin-bottom will-change-transform transition-all duration-500 ease-out ${
    isBigLvl ? 'h-48' : 'h-40'
  }`;

  // Buttery Smooth 60fps Staggered Bento & Hero Entrance
  const { contextSafe } = useGSAP(
    () => {
      const illusTl = gsap.timeline({ delay: 0.1 });
      illusTl
        .fromTo('.hero-illustration', 
          { scale: 0.1, y: 35, rotation: -15 },
          {
            scale: 1,
            y: 0,
            rotation: 0,
            duration: 0.75,
            ease: 'back.out(1.8)',
            clearProps: 'transform'
          }
        );

      gsap.fromTo('.hello-card', 
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );

      gsap.fromTo('.bento-stat-card', 
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: 'back.out(1.5)',
          delay: 0.15,
          clearProps: 'transform',
        }
      );

      gsap.fromTo('.left-col-card', 
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.25,
          clearProps: 'transform',
        }
      );
    },
    { scope: dashboardRef }
  );

  // ContextSafe hover handlers for Stat Cards & Verified Rows (Zero memory leak, 60fps)
  const handleStatCardEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const badge = e.currentTarget.querySelector('.stat-icon-badge');
    gsap.to(e.currentTarget, {
      y: -5,
      scale: 1.02,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (badge) {
      gsap.to(badge, {
        scale: 1.25,
        rotation: 12,
        duration: 0.35,
        ease: 'back.out(3)',
      });
    }
  });

  const handleStatCardLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const badge = e.currentTarget.querySelector('.stat-icon-badge');
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
    if (badge) {
      gsap.to(badge, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });



  const handleVerifiedEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const checkBadge = e.currentTarget.querySelector('.check-badge');
    gsap.to(e.currentTarget, { x: 5, duration: 0.2, ease: 'power2.out' });
    if (checkBadge) {
      gsap.to(checkBadge, {
        scale: 1.35,
        rotation: 360,
        duration: 0.45,
        ease: 'back.out(2.5)',
      });
    }
  });

  const handleVerifiedLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const checkBadge = e.currentTarget.querySelector('.check-badge');
    gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' });
    if (checkBadge) {
      gsap.to(checkBadge, {
        scale: 1,
        rotation: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  });

  // Goals Checklist State
  // Dynamic Goals tailored to live verified student metrics
  const dynamicGoals = React.useMemo(() => {
    const streakTarget = Math.max(7, Math.ceil(((CURRENT_USER.currentStreak || 1) + 1) / 7) * 7);
    const hardSolved = CURRENT_USER.solvedByDifficulty?.hard || 0;
    const hardTarget = Math.max(10, Math.ceil(((hardSolved || 1) + 1) / 10) * 10);
    const nextTier = CURRENT_USER.tier === 'Phoenix' ? 'Ascendant' : CURRENT_USER.tier === 'Flame' ? 'Phoenix' : CURRENT_USER.tier === 'Ember' ? 'Flame' : 'Ember';

    return [
      { id: 1, text: `Maintain ${streakTarget}-day coding streak`, completed: (CURRENT_USER.currentStreak || 0) >= streakTarget },
      { id: 2, text: `Solve ${hardTarget} Hard DSA problems`, completed: hardSolved >= hardTarget },
      { id: 3, text: `Reach Top 3 in ${CURRENT_USER.department} Department Rank`, completed: CURRENT_USER.deptRank > 0 && CURRENT_USER.deptRank <= 3 },
      { id: 4, text: `Achieve ${nextTier} Tier status (${CURRENT_USER.nextTierScore.toLocaleString()} pts)`, completed: CURRENT_USER.cpScore >= CURRENT_USER.nextTierScore },
    ];
  }, [CURRENT_USER]);

  const [goals, setGoals] = useState(dynamicGoals);

  React.useEffect(() => {
    setGoals(dynamicGoals);
  }, [dynamicGoals]);

  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'thisWeek' | 'lastWeek' | 'twoWeeksAgo'>('thisWeek');
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number>(5);
  const [selectedMetricIdx, setSelectedMetricIdx] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'solved' | 'weight'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDiff, setSelectedDiff] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');
  const [graphPlatform, setGraphPlatform] = useState<'CodeChef' | 'Codeforces' | 'LeetCode'>('CodeChef');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [liveCfHistory, setLiveCfHistory] = useState<ContestDataPoint[]>([]);

  const completedGoalsCount = goals.filter((g) => g.completed).length;

  const toggleGoal = (id: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const [velocityData, setVelocityData] = useState(WEEKLY_VELOCITY_DATA);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dashboard/velocity', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.velocity) {
          setVelocityData(json.velocity);
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.error('Velocity fetch error:', err);
        }
      });
    return () => controller.abort();
  }, []);

  // Fetch real contest rating history from Codeforces if user has handle
  React.useEffect(() => {
    const cfPlat = CURRENT_USER.platforms?.find((p: any) => p.platform === 'Codeforces');
    if (cfPlat?.handle) {
      fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(cfPlat.handle)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.status === 'OK' && Array.isArray(json.result) && json.result.length > 0) {
            const mapped: ContestDataPoint[] = json.result.slice(-7).map((c: any) => ({
              id: `cf-${c.contestId}`,
              contestName: c.contestName,
              date: new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              rating: c.newRating,
              delta: c.newRating - c.oldRating,
              rank: c.rank,
            }));
            setLiveCfHistory(mapped);
          }
        })
        .catch(() => {});
    }
  }, [CURRENT_USER.platforms]);

  const currentWeekData = (velocityData as any)[selectedTimeframe] || WEEKLY_VELOCITY_DATA[selectedTimeframe];

  const getX = (idx: number) => 10 + idx * 35;
  const getY = (val: number, maxVal: number) => 85 - (val / maxVal) * 70;

  const buildSvgLinePath = (values: number[], maxVal: number) => {
    return values
      .map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val, maxVal)}`)
      .join(' ');
  };

  const activePlatItem = CURRENT_USER.platforms?.find(
    (p: any) => p.platform === graphPlatform || p.name === graphPlatform
  );
  const currentPlatRating = activePlatItem?.rating || 0;

  const historyPoints: ContestDataPoint[] = graphPlatform === 'Codeforces' && liveCfHistory.length > 0
    ? liveCfHistory
    : currentPlatRating > 0
    ? [
        { id: 'pt-1', contestName: 'Initial Rating', date: 'Start', rating: Math.max(0, currentPlatRating - 100), delta: 0, rank: 0 },
        { id: 'pt-2', contestName: 'Season Progress', date: 'Mid-Season', rating: Math.max(0, currentPlatRating - 30), delta: 70, rank: 0 },
        { id: 'pt-3', contestName: 'Current Synced Rating', date: 'Latest Sync', rating: currentPlatRating, delta: 30, rank: 0 },
      ]
    : [
        { id: 'pt-1', contestName: 'No Contest Data', date: 'Start', rating: 0, delta: 0, rank: 0 },
        { id: 'pt-2', contestName: 'No Contest Data', date: 'Today', rating: 0, delta: 0, rank: 0 },
      ];

  const minRating = Math.min(...historyPoints.map((p) => p.rating)) - 40;
  const maxRating = Math.max(...historyPoints.map((p) => p.rating)) + 40;
  const svgWidth = 400;
  const svgHeight = 175;
  const paddingX = 25;
  const paddingY = 20;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const coords = historyPoints.map((pt, i) => {
    const x = paddingX + (i / (historyPoints.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((pt.rating - minRating) / (maxRating - minRating)) * usableHeight;
    return { x, y, pt, index: i };
  });

  const lineD = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = coords[idx - 1];
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) / 2;
    const cy2 = curr.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${lineD} L ${coords[coords.length - 1].x} ${svgHeight} L ${coords[0].x} ${svgHeight} Z`;

  const activeIndex = hoveredPointIdx !== null ? hoveredPointIdx : coords.length - 1;
  const activePoint = coords[activeIndex];
  const peakRating = Math.max(...historyPoints.map((p) => p.rating));

  const getPlatformMeta = (platName: string) => {
    switch (platName) {
      case 'Codeforces':
        return { color: '#f97316', url: 'https://codeforces.com', badge: 'Specialist' };
      case 'LeetCode':
        return { color: '#f59e0b', url: 'https://leetcode.com', badge: 'Knight' };
      case 'CodeChef':
        return { color: '#10b981', url: 'https://www.codechef.com', badge: 'Rated' };
      case 'GFG':
      case 'GeeksForGeeks':
        return { color: '#3b82f6', url: 'https://geeksforgeeks.org', badge: '5 Star' };
      default:
        return { color: '#8b5cf6', url: 'https://hackerrank.com', badge: 'Active' };
    }
  };

  const rawPlatforms = CURRENT_USER.platforms || [];
  const normalizedPlatforms = rawPlatforms.map((p: any, idx: number) => {
    const platName = p.platform || p.name || 'Platform';
    const meta = getPlatformMeta(platName);
    const cfRank = p.cfRank as string | undefined;
    const cfMaxRank = p.cfMaxRank as string | undefined;
    const cfContribution = p.cfContribution as number | undefined;
    // For Codeforces, prefer the live rank from DB as badge label
    const badge = platName === 'Codeforces'
      ? (cfRank ? cfRank.charAt(0).toUpperCase() + cfRank.slice(1) : (p.badge || meta.badge))
      : (p.badge || meta.badge);
    return {
      id: p.id || `plat-${idx}`,
      name: platName,
      platform: platName,
      handle: p.handle || '',
      rating: p.rating || 0,
      solvedCount: p.solvedCount || 0,
      weight: p.weight || 1.0,
      badge,
      globalRank: p.globalRank || null,
      percentage: p.percentage ?? (p.rating && p.rating > 0 ? Math.min(100, Math.round((p.rating / 2400) * 100)) : (p.solvedCount > 0 ? Math.min(100, Math.round((p.solvedCount / 50) * 100)) : 0)),
      color: p.color || meta.color,
      url: p.profileUrl || p.url || (p.handle ? (platName === 'CodeChef' ? `https://www.codechef.com/users/${p.handle}` : `${meta.url}/profile/${p.handle}`) : meta.url),
      milestone: cfContribution != null
        ? `Contribution: ${cfContribution > 0 ? '+' : ''}${cfContribution} • Max rank: ${cfMaxRank || 'N/A'}`
        : (p.milestone || `Verified ${p.handle || 'user'} profile`),
    };
  });

  const sortedPlatforms = [...normalizedPlatforms].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'solved') return b.solvedCount - a.solvedCount;
    return b.weight - a.weight;
  });

  const totalDsa = CURRENT_USER.solvedByDifficulty?.total || 0;
  const easyDsa = CURRENT_USER.solvedByDifficulty?.easy || 0;
  const mediumDsa = CURRENT_USER.solvedByDifficulty?.medium || 0;
  const cfCount = CURRENT_USER.platforms?.find((p: any) => p.platform === 'Codeforces')?.solvedCount || 0;

  const easyTarget = Math.max(totalDsa, 100);
  const easyDonutOffset = totalDsa === 0 && easyDsa === 0 ? 100 : 100 - Math.min((easyDsa / easyTarget) * 100, 100);

  const mediumLayerPct = totalDsa === 0 ? 0 : ((easyDsa + mediumDsa) / totalDsa) * 100;
  const easyLayerPct = totalDsa === 0 ? 0 : (easyDsa / totalDsa) * 100;
  const dsaMediumOffset = 100 - mediumLayerPct;
  const dsaEasyOffset = 100 - easyLayerPct;

  const cfTarget = Math.max(cfCount, 100);
  const cfDonutOffset = cfCount === 0 ? 100 : 100 - Math.min((cfCount / cfTarget) * 100, 100);

  return (
    <div ref={dashboardRef} className="space-y-8 pb-12">
      {/* TOP HERO BENTO ROW matching Dribbble Reference: Hello Card with Outside-the-Box Illustration + 4 Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-6 sm:pt-10">
        {/* LEFT: Hello Card with Outside the Box Waving Illustration (8 Cols) */}
        <div className="hello-card lg:col-span-8 relative rounded-3xl bg-white border border-pine-teal/25 p-4 sm:p-6 md:p-8 shadow-xs overflow-hidden sm:overflow-visible flex flex-col justify-between min-h-[280px] will-change-transform">
          {/* Top Greeting Section */}
          <div className="relative z-10 max-w-md sm:max-w-lg space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-golden-sand/20 text-tomato-jam border border-pine-teal/30 inline-block">
                🔥 {CURRENT_USER.currentStreak || 1}-Day Streak
              </span>
              <span className="text-[10px] sm:text-xs text-pine-teal font-semibold">
                {CURRENT_USER.department} Dept • Rank #{CURRENT_USER.collegeRank} College
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-onyx tracking-tight">
              Hello {CURRENT_USER.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-pine-teal font-medium">
              It&apos;s good to see you again.
            </p>

            {/* Locked Level Badge - Display in empty white space */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-tomato-jam/15 to-golden-sand/15 border-2 border-tomato-jam/30 max-w-fit">
              <span className="text-2xl font-black text-tomato-jam">🔒</span>
              <div>
                <p className="text-[10px] font-bold text-tomato-jam uppercase tracking-wider">Current Level</p>
                <p className="text-lg sm:text-2xl font-black text-tomato-jam">Lvl {activeLevel} • {CURRENT_USER.tier}</p>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Sprint Bar (matching Spanish B2 pill in Dribbble reference) */}
          <div className="relative z-10 mt-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-golden-sand/10 border border-pine-teal/25 shadow-2xs max-w-xl">
              {/* Left: Icon and Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tomato-jam text-white flex items-center justify-center font-extrabold shadow-sm shrink-0">
                  {UPCOMING_EVENTS[currentEventIdx].type === 'Contest' ? (
                    <Calendar className="w-5 h-5 fill-current" />
                  ) : (
                    <Flame className="w-5 h-5 fill-current animate-pulse" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-onyx truncate">
                    {UPCOMING_EVENTS[currentEventIdx].title}
                  </h4>
                  <p className="text-[11px] text-pine-teal font-medium truncate">
                    {UPCOMING_EVENTS[currentEventIdx].subtitle}
                  </p>
                </div>
              </div>

              {/* Right: Progress Ring, Continue Button & Arrows */}
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-pine-teal/30 text-xs font-black text-onyx shadow-2xs shrink-0">
                  <span className={`w-2 h-2 rounded-full ${UPCOMING_EVENTS[currentEventIdx].type === 'Contest' ? 'bg-pine-teal' : 'bg-tomato-jam animate-pulse'}`} />
                  <span>{UPCOMING_EVENTS[currentEventIdx].badge}</span>
                </div>

                <Link
                  href={UPCOMING_EVENTS[currentEventIdx].link}
                  className="px-4 py-2 rounded-xl bg-onyx hover:bg-[#2A2A2A] text-white font-extrabold text-xs shadow-sm transition-all text-center flex-1 sm:flex-none"
                >
                  {UPCOMING_EVENTS[currentEventIdx].action}
                </Link>

                <div className="hidden sm:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentEventIdx((prev) => (prev - 1 + UPCOMING_EVENTS.length) % UPCOMING_EVENTS.length)}
                    className="w-7 h-7 rounded-full border border-pine-teal/30 bg-white hover:bg-golden-sand/15 flex items-center justify-center text-onyx font-bold transition-colors"
                    title="Previous"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentEventIdx((prev) => (prev + 1) % UPCOMING_EVENTS.length)}
                    className="w-7 h-7 rounded-full border border-pine-teal/30 bg-white hover:bg-golden-sand/15 flex items-center justify-center text-onyx font-bold transition-colors"
                    title="Next"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* THE WAVING ILLUSTRATION (dynamic based on tier) positioned at the TOP of the box (popping out above, not inside) */}
          <div className={desktopWrapperClasses}>
            <img
              src={currentIllusSrc}
              alt={`${CURRENT_USER.tier} Tier Illustration`}
              className={desktopImgClasses}
              width="400"
              height="400"
              fetchPriority="high"
            />
          </div>
          {/* Mobile version of illustration */}
          <div className={mobileWrapperClasses}>
            <img
              src={currentIllusSrc}
              alt={`${CURRENT_USER.tier} Tier Illustration`}
              className={mobileImgClasses}
              width="400"
              height="400"
              fetchPriority="high"
            />
          </div>
        </div>

        {/* RIGHT: 4 Stats Mini-Grid (4 Cols) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Stat 1: Questions Solved */}
          <div
            onMouseEnter={handleStatCardEnter}
            onMouseLeave={handleStatCardLeave}
            className="bento-stat-card rounded-3xl bg-white border border-pine-teal/25 p-5 shadow-xs flex flex-col justify-between cursor-pointer will-change-transform"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-pine-teal uppercase tracking-wider">
                Solved
              </p>
              <div className="stat-icon-badge w-9 h-9 rounded-xl bg-golden-sand/20 text-tomato-jam flex items-center justify-center font-black text-sm will-change-transform">
                Q
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-3xl font-black text-onyx">
                {(CURRENT_USER.solvedByDifficulty?.total || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-tomato-jam font-semibold mt-0.5">
                Across synced platforms
              </p>
            </div>
          </div>

          {/* Stat 2: Active Days */}
          <div
            onMouseEnter={handleStatCardEnter}
            onMouseLeave={handleStatCardLeave}
            className="bento-stat-card rounded-3xl bg-white border border-pine-teal/25 p-5 shadow-xs flex flex-col justify-between cursor-pointer will-change-transform"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-pine-teal uppercase tracking-wider">
                Active Streak
              </p>
              <div className="stat-icon-badge w-9 h-9 rounded-xl bg-golden-sand/20 text-tomato-jam flex items-center justify-center font-black text-sm will-change-transform">
                🔥
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-3xl font-black text-onyx">
                {CURRENT_USER.currentStreak || 0}d
              </p>
              <p className="text-[10px] text-tomato-jam font-semibold mt-0.5">
                Current Streak
              </p>
            </div>
          </div>

          {/* Stat 3: Contests / Platforms */}
          <div
            onMouseEnter={handleStatCardEnter}
            onMouseLeave={handleStatCardLeave}
            className="bento-stat-card rounded-3xl bg-white border border-pine-teal/25 p-5 shadow-xs flex flex-col justify-between cursor-pointer will-change-transform"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-pine-teal uppercase tracking-wider">
                Linked Platforms
              </p>
              <div className="stat-icon-badge w-9 h-9 rounded-xl bg-golden-sand/20 text-pine-teal flex items-center justify-center font-black text-sm will-change-transform">
                🏆
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-3xl font-black text-onyx">
                {CURRENT_USER.platforms?.filter((p: any) => p.handle && p.handle.trim() !== '').length || 0}
              </p>
              <p className="text-[10px] text-pine-teal mt-0.5">
                Synced profiles
              </p>
            </div>
          </div>

          {/* Stat 4: Global Rank */}
          <div
            onMouseEnter={handleStatCardEnter}
            onMouseLeave={handleStatCardLeave}
            className="bento-stat-card rounded-3xl bg-white border border-pine-teal/25 p-5 shadow-xs flex flex-col justify-between cursor-pointer will-change-transform"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-pine-teal uppercase tracking-wider">
                C Score Rank
              </p>
              <div className="stat-icon-badge w-9 h-9 rounded-xl bg-onyx text-white flex items-center justify-center font-black text-xs will-change-transform">
                #{CURRENT_USER.collegeRank || 0}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl sm:text-3xl font-black text-onyx">
                #{CURRENT_USER.collegeRank || 0}
              </p>
              <p className="text-[10px] text-pine-teal mt-0.5">
                College Standings
              </p>
            </div>
          </div>


        </div>
      </div>

      {/* BOTTOM DASHBOARD GRID: Left Stats, Center Graph, Right Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT COLUMN: Profile Info & Problem Solving Platform Checkmarks (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* User Profile Card */}
          <div className="left-col-card rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs text-center space-y-3 will-change-transform">
            <div className="relative w-20 h-20 mx-auto">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-tomato-jam/30 shadow-md"
                fetchPriority="high"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-tomato-jam border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-onyx text-lg">
                {CURRENT_USER.name}
              </h3>
              <p className="text-xs font-bold text-tomato-jam">@{CURRENT_USER.username}</p>
              <p className="text-[11px] text-pine-teal mt-1 leading-snug">
                {CURRENT_USER.bio}
              </p>
            </div>
            <div className="text-[11px] text-pine-teal font-semibold pt-2 border-t border-pine-teal/15 space-y-1">
              <p>📍 Kolkata, WB</p>
              <p>🎓 Netaji Subhash Engg. College</p>
            </div>
          </div>

          {/* Problem Solving Verified Platforms */}
          <div className="left-col-card rounded-3xl bg-white border border-pine-teal/25 p-5 shadow-xs space-y-3 will-change-transform">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-onyx flex items-center justify-between">
              <span>Problem Solving Handles</span>
              <UserCheck className="w-4 h-4 text-tomato-jam" />
            </h4>
            <div className="space-y-2 text-xs">
              {CURRENT_USER.platforms?.filter((p: any) => p.handle && p.handle.trim() !== '').length === 0 ? (
                <div className="p-3 text-center text-xs font-bold text-onyx/50 bg-golden-sand/10 rounded-xl">
                  No handles linked yet (add in Settings)
                </div>
              ) : (
                CURRENT_USER.platforms
                  ?.filter((plat: any) => plat.handle && plat.handle.trim() !== '')
                  .map((plat: any) => (
                    <div
                      key={plat.platform || plat.name}
                      onMouseEnter={handleVerifiedEnter}
                      onMouseLeave={handleVerifiedLeave}
                      className="flex items-center justify-between p-2 rounded-xl bg-golden-sand/10 hover:bg-golden-sand/15 transition-colors cursor-pointer will-change-transform"
                    >
                      <span className="font-bold text-onyx">{plat.platform || plat.name}: {plat.handle}</span>
                      <div className="check-badge w-5 h-5 rounded-full bg-golden-sand/20 text-tomato-jam flex items-center justify-center will-change-transform">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="left-col-card relative rounded-3xl bg-gradient-to-br from-onyx to-[#2A2A2A] text-white p-6 shadow-xl space-y-4 border border-white/10 overflow-hidden will-change-transform group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-golden-sand/10 blur-3xl rounded-full pointer-events-none group-hover:bg-golden-sand/20 transition-colors duration-500"></div>
            
            <div className="relative z-10 text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-golden-sand/80">College Rank</p>
                <div className="px-2 py-0.5 rounded-full bg-golden-sand/20 text-golden-sand text-[10px] font-bold border border-golden-sand/30">
                  Global
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-golden-sand to-white drop-shadow-md">
                  #{CURRENT_USER.collegeRank || 0}
                </span>
                <span className="text-xs text-white/50 font-medium">overall</span>
              </div>
            </div>

            <Link
              href="/rankings"
              className="relative z-10 flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>View Leaderboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <div className="relative z-10 flex justify-between items-center text-[10px] text-white/60 pt-3 border-t border-white/10 mt-1">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Sync</span>
              <span className="font-semibold text-white/80">Top {(CURRENT_USER.collegeRank / 1500 * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Contest Rating Graph, Awards & DSA Topic Analysis (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Rating Timeline Graph Card (Fully Functional & Interactive) */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-4">
            {/* Header with Title and Platform Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-onyx flex items-center gap-2">
                  <span>Rating Timeline & Contest Performance</span>
                </h3>
                <p className="text-xs text-pine-teal mt-0.5">
                  <strong className="text-onyx">{graphPlatform} Rating:</strong> {activePoint.pt.rating} (Peak: {peakRating}) | {activePoint.pt.contestName}
                </p>
              </div>

              {/* Platform Selector Buttons */}
              <div className="flex items-center gap-1 bg-golden-sand/15 p-1 rounded-xl border border-pine-teal/20 self-start sm:self-auto">
                {(['CodeChef', 'Codeforces', 'LeetCode'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => {
                      setGraphPlatform(plat);
                      setHoveredPointIdx(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${graphPlatform === plat
                        ? 'bg-onyx text-golden-sand shadow-2xs'
                        : 'text-pine-teal hover:text-onyx'
                      }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Interactive SVG Ember Area Graph - Taller Height */}
            <div 
              className="relative h-44 sm:h-60 w-full pt-2 group/graph"
              onMouseLeave={() => setHoveredPointIdx(null)}
            >
              <svg viewBox="0 0 400 175" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="emberGradDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9F1C" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="10" y1="25" x2="390" y2="25" stroke="rgba(0, 15, 8, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="65" x2="390" y2="65" stroke="rgba(0, 15, 8, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="105" x2="390" y2="105" stroke="rgba(0, 15, 8, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="145" x2="390" y2="145" stroke="rgba(0, 15, 8, 0.08)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Dynamic Area Fill & Path Line */}
                <path d={areaD} fill="url(#emberGradDynamic)" />
                <path
                  d={lineD}
                  fill="none"
                  stroke="#FF9F1C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Vertical Cursor Line on Hover */}
                {hoveredPointIdx !== null && (
                  <line
                    x1={activePoint.x}
                    y1="10"
                    x2={activePoint.x}
                    y2="170"
                    stroke="#FF9F1C"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="transition-all duration-150"
                  />
                )}

                {/* Interactive Points on the Path */}
                {coords.map((c) => {
                  const isHovered = activeIndex === c.index;
                  return (
                    <g
                      key={c.pt.id}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPointIdx(c.index)}
                    >
                      {/* Invisible enlarge hit region for easy hover */}
                      <circle cx={c.x} cy={c.y} r="14" fill="transparent" />

                      {/* Outer pulse ring for hovered point */}
                      {isHovered && (
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r="10"
                          fill="none"
                          stroke="#FF9F1C"
                          strokeWidth="2"
                          className="animate-pulse"
                        />
                      )}

                      {/* Visible Point */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isHovered ? '6' : '4'}
                        fill={isHovered ? '#FF9F1C' : '#2C1F14'}
                        stroke="#FF9F1C"
                        strokeWidth={isHovered ? '3' : '1.5'}
                        className="transition-all duration-200 opacity-0 group-hover/graph:opacity-100"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Interactive Floating Tooltip Badge */}
              <div
                className={`absolute bg-onyx text-white p-2.5 rounded-xl shadow-lg border border-pine-teal/40 transition-all duration-200 pointer-events-none z-10 text-xs min-w-[170px] ${hoveredPointIdx !== null ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${Math.min(Math.max((activePoint.x / 400) * 100, 15), 75)}%`,
                  top: `${Math.max((activePoint.y / 175) * 100 - 30, 5)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-pine-teal/20 pb-1 mb-1">
                  <span className="font-extrabold text-golden-sand text-[11px] truncate max-w-[110px]">
                    {activePoint.pt.contestName}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${activePoint.pt.delta >= 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                      }`}
                  >
                    {activePoint.pt.delta >= 0 ? `+${activePoint.pt.delta}` : activePoint.pt.delta}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-pine-teal">
                  <span>Rating: <strong className="text-white">{activePoint.pt.rating}</strong></span>
                  <span>Rank: <strong className="text-golden-sand">#{activePoint.pt.rank}</strong></span>
                </div>
                <div className="text-[9px] text-pine-teal/70 mt-0.5 text-right font-medium">
                  {activePoint.pt.date}
                </div>
              </div>
            </div>
          </div>


          {/* DSA Topic Analysis Bar Chart (Bigger Height) */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-5 content-visibility-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-tomato-jam" />
                <span>DSA Topic Analysis</span>
              </h3>
              <span className="text-xs font-semibold text-pine-teal">
                {(CURRENT_USER.solvedByDifficulty?.total || 0) > 0 ? `${CURRENT_USER.solvedByDifficulty?.total} Solved` : 'Problem Breakdown'}
              </span>
            </div>

            <div className="space-y-3.5">
              {CURRENT_USER.dsaTopics?.length === 0 ? (
                <div className="p-3 text-center text-xs font-bold text-onyx/50 bg-golden-sand/10 rounded-xl">
                  No DSA topic tags tracked yet
                </div>
              ) : (
                CURRENT_USER.dsaTopics?.map((item) => {
                  const maxVal = Math.max(...(CURRENT_USER.dsaTopics?.map((t) => t.count) || [1]), 10);
                  const pct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={item.topic} className="flex items-center gap-3 text-xs">
                      <span className="w-32 sm:w-36 font-bold text-onyx truncate text-right">
                        {item.topic}
                      </span>
                      <div className="flex-1 bg-golden-sand/12 h-6.5 rounded-lg overflow-hidden relative flex items-center border border-pine-teal/20">
                        <div
                          className={`h-full ${item.color || 'bg-tomato-jam'} rounded-lg flex items-center justify-end pr-2.5 transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 12)}%` }}
                        >
                          <span className="text-xs font-black text-white">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Platform-wise Problems Solved */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-5 content-visibility-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx flex items-center gap-2">
                <Trophy className="w-4 h-4 text-tomato-jam" />
                <span>Problems by Platform</span>
              </h3>
              <span className="text-xs font-semibold text-pine-teal">
                {(CURRENT_USER.solvedByDifficulty?.total || 0).toLocaleString()} Total
              </span>
            </div>

            <div className="space-y-3.5">
              {normalizedPlatforms.length === 0 ? (
                <div className="p-3 text-center text-xs font-bold text-onyx/50 bg-golden-sand/10 rounded-xl">
                  No platforms linked yet
                </div>
              ) : (
                normalizedPlatforms.map((plat) => {
                  const totalSolved = normalizedPlatforms.reduce((sum, p) => sum + (p.solvedCount || 0), 0) || 1;
                  const pct = Math.round(((plat.solvedCount || 0) / totalSolved) * 100);
                  
                  return (
                    <div key={plat.id} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-bold text-onyx truncate" style={{ color: plat.color }}>
                        {plat.platform}
                      </span>
                      <div className="flex-1 bg-golden-sand/12 h-6.5 rounded-lg overflow-hidden relative flex items-center border border-pine-teal/20">
                        <div
                          className="h-full rounded-lg flex items-center justify-end pr-2.5 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: plat.color }}
                        >
                          <span className="text-xs font-black text-white">
                            {plat.solvedCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Question Distribution & Contest Rankings (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Question Distribution */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-onyx flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tomato-jam" />
              <span>Question Distribution</span>
            </h4>

            <div className="space-y-3">
              {/* Donut 1: Fundamentals */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="rgba(0, 102, 94, 0.1)" strokeWidth="4" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke="#00665E" strokeWidth="4" strokeDasharray="100" strokeDashoffset={easyDonutOffset} strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out group-hover:stroke-tomato-jam" />
                  </svg>
                  <span className="absolute text-[11px] font-black text-onyx">{easyDsa}</span>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-extrabold text-onyx text-xs group-hover:text-tomato-jam transition-colors">Easy Problems</p>
                  <p className="text-[10px] text-pine-teal font-medium bg-golden-sand/20 px-2 py-0.5 rounded-md inline-block">
                    LeetCode Easy: <span className="font-bold text-onyx">{CURRENT_USER.solvedByDifficulty?.easy || 0}</span>
                  </p>
                </div>
              </div>

              {/* Donut 2: DSA Total */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="rgba(0, 102, 94, 0.1)" strokeWidth="4" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke="#E5484D" strokeWidth="4" strokeDasharray="100" strokeDashoffset={dsaMediumOffset} strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out" />
                    <circle cx="20" cy="20" r="16" stroke="#00665E" strokeWidth="4" strokeDasharray="100" strokeDashoffset={dsaEasyOffset} strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out delay-150 group-hover:stroke-tomato-jam" />
                  </svg>
                  <span className="absolute text-[11px] font-black text-onyx">{totalDsa}</span>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-extrabold text-onyx text-xs group-hover:text-pine-teal transition-colors">DSA Solved Total</p>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold bg-golden-sand/20 px-2 py-0.5 rounded-md inline-flex">
                    <span className="text-pine-teal font-bold">E: {CURRENT_USER.solvedByDifficulty?.easy || 0}</span>
                    <span className="text-onyx/20">•</span>
                    <span className="text-onyx font-bold">M: {CURRENT_USER.solvedByDifficulty?.medium || 0}</span>
                    <span className="text-onyx/20">•</span>
                    <span className="text-tomato-jam font-bold">H: {CURRENT_USER.solvedByDifficulty?.hard || 0}</span>
                  </div>
                </div>
              </div>

              {/* Donut 3: Competitive Programming Solved */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="rgba(0, 102, 94, 0.1)" strokeWidth="4" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke="#111111" strokeWidth="4" strokeDasharray="100" strokeDashoffset={cfDonutOffset} strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out group-hover:stroke-tomato-jam" />
                  </svg>
                  <span className="absolute text-[11px] font-black text-onyx">
                    {cfCount}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-extrabold text-onyx text-xs group-hover:text-tomato-jam transition-colors">Codeforces Solved</p>
                  <p className="text-[10px] text-pine-teal font-medium bg-golden-sand/20 px-2 py-0.5 rounded-md inline-block">
                    Accepted: <span className="font-bold text-onyx">{CURRENT_USER.platforms?.find((p: any) => p.platform === 'Codeforces')?.solvedCount || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contest Rankings Cards */}
          <div className="rounded-3xl bg-white border border-pine-teal/25 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-onyx flex items-center gap-2">
              <Trophy className="w-4 h-4 text-pine-teal" />
              <span>Contest Rankings</span>
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {/* LEETCODE */}
              {(() => {
                const lcPlat = CURRENT_USER.platforms?.find((p: any) => p.platform === 'LeetCode');
                const lcRating = lcPlat?.rating || 0;
                const lcBadge = lcRating >= 2150 ? 'Guardian' : lcRating >= 1850 ? 'Knight' : lcRating > 0 ? 'Contestant' : '';
                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group relative overflow-hidden flex items-center justify-between">
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                      <Trophy className="w-20 h-20" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-pine-teal/20 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-amber-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-onyx text-xs sm:text-sm truncate">LeetCode</h5>
                        {lcRating > 0 ? (
                          <p className="text-[10px] font-semibold text-pine-teal mt-0.5 truncate">
                            Contest Rating: <span className="text-onyx">{lcRating}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] font-semibold text-pine-teal mt-0.5 truncate">
                            Contest Rating
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 text-right shrink-0 ml-2">
                      <div className="text-xl sm:text-2xl font-black text-onyx group-hover:text-amber-500 transition-colors leading-none">
                        {lcRating > 0 ? lcRating : '-'}
                      </div>
                      {lcBadge ? (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 inline-block uppercase max-w-[80px] truncate">
                          {lcBadge}
                        </div>
                      ) : (
                        lcRating > 0 && (
                          <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 inline-block">
                            Rating
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* CODECHEF */}
              {(() => {
                const ccPlat = CURRENT_USER.platforms?.find((p: any) => p.platform === 'CodeChef');
                const ccRating = ccPlat?.rating || 0;
                const ccRank = (ccPlat as any)?.globalRank;
                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group relative overflow-hidden flex items-center justify-between">
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                      <Trophy className="w-20 h-20" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-pine-teal/20 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-tomato-jam">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-onyx text-xs sm:text-sm truncate">CodeChef</h5>
                        {ccRating > 0 ? (
                          <p className="text-[10px] font-semibold text-pine-teal mt-0.5 truncate">
                            {ccRank ? `Global: #${Number(ccRank).toLocaleString()}` : `Rating: ${ccRating}`}
                          </p>
                        ) : (
                          <p className="text-[10px] font-semibold text-pine-teal mt-0.5 truncate">
                            Contest Rating
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 text-right shrink-0 ml-2">
                      <div className="text-xl sm:text-2xl font-black text-onyx group-hover:text-tomato-jam transition-colors leading-none">
                        {ccRating > 0 ? ccRating : '-'}
                      </div>
                      {ccPlat?.badge ? (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded-md bg-tomato-jam/10 text-tomato-jam border border-tomato-jam/20 inline-block uppercase max-w-[90px] truncate">
                          {ccPlat.badge}
                        </div>
                      ) : (
                        ccRating > 0 && (
                          <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded-md bg-tomato-jam/10 text-tomato-jam border border-tomato-jam/20 inline-block">
                            Rating
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* CODEFORCES */}
              {(() => {
                const cfPlat = CURRENT_USER.platforms?.find((p: any) => p.platform === 'Codeforces');
                const cfRating = cfPlat?.rating || 0;
                const cfRank = (cfPlat as any)?.cfRank || (cfRating > 0 ? 'Rated' : '');
                const cfMaxRating = (cfPlat as any)?.cfMaxRating || cfRating;
                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-golden-sand/10 to-transparent border border-pine-teal/15 hover:border-pine-teal/30 hover:shadow-sm hover:-translate-y-0.5 transition-all group relative overflow-hidden flex items-center justify-between">
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                      <Trophy className="w-20 h-20" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-pine-teal/20 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-pine-teal">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-onyx text-xs sm:text-sm truncate">Codeforces</h5>
                        {cfMaxRating > 0 && (
                          <p className="text-[10px] font-semibold text-pine-teal mt-0.5 truncate">
                            Max Rating: <span className="text-onyx">{cfMaxRating}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 text-right shrink-0 ml-2">
                      <div className="text-xl sm:text-2xl font-black text-onyx group-hover:text-pine-teal transition-colors leading-none">
                        {cfRating > 0 ? cfRating : '-'}
                      </div>
                      {cfRank && cfRank.toLowerCase() !== 'unrated' && (
                        <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded-md bg-pine-teal/10 text-pine-teal border border-pine-teal/20 inline-block uppercase max-w-[80px] truncate">
                          {cfRank}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SECTION: Synced CP Profiles (Grid / List Switcher) */}
      <div className="space-y-4 pt-6 border-t border-pine-teal/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-onyx">
              Synced CP Profiles & Ratings ({sortedPlatforms.length})
            </h3>
            <p className="text-xs text-pine-teal mt-0.5">
              Live synchronized algorithmic profiles sorted by your active priority.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-pine-teal">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'solved' | 'weight')}
                className="bg-transparent font-bold text-onyx focus:outline-none cursor-pointer border-b border-pine-teal/40 pb-0.5"
              >
                <option value="rating">Rating (High to Low)</option>
                <option value="solved">Solved Problems</option>
                <option value="weight">Platform Weight</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-golden-sand/15 p-1 rounded-xl border border-pine-teal/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white shadow-2xs text-onyx'
                  : 'text-pine-teal hover:text-onyx'
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list'
                  ? 'bg-white shadow-2xs text-onyx'
                  : 'text-pine-teal hover:text-onyx'
                  }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 content-visibility-auto">
            {sortedPlatforms.map((plat) => (
              <a
                key={plat.id}
                href={plat.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl bg-onyx text-white p-5 shadow-md hover:border-golden-sand/40 transition-all duration-200 border border-pine-teal/30 flex items-center justify-between gap-4 group hover:-translate-y-0.5 gpu-accelerated"
              >
                {/* Left: Platform Info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: plat.color }}
                    ></span>
                    <span className="text-xs font-extrabold text-golden-sand truncate">
                      {plat.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-golden-sand shrink-0">
                      {plat.weight}x Wp
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-white group-hover:text-golden-sand transition-colors truncate">
                    {plat.rating.toLocaleString()} <span className="text-xs font-semibold text-golden-sand/80">Rating</span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white border border-white/20">
                      {plat.badge}
                    </span>
                    {plat.solvedCount > 0 && (
                      <span className="text-xs text-teal-200/90 font-medium">
                        • {plat.solvedCount} Solved
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Clean Circular Bar */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform gpu-accelerated">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3.5" fill="none" />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={plat.color}
                      strokeWidth="3.5"
                      strokeDasharray="100"
                      strokeDashoffset={100 * (1 - plat.percentage / 100)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-black text-white leading-none">
                      {plat.percentage}%
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-onyx text-white border border-pine-teal/30 divide-y divide-pine-teal/20 overflow-hidden shadow-md content-visibility-auto">
            {sortedPlatforms.map((plat) => (
              <a
                key={plat.id}
                href={plat.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors group gpu-accelerated"
              >
                <div className="flex items-center gap-4">
                  {/* Circular Bar in List View */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3.5" fill="none" />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke={plat.color}
                        strokeWidth="3.5"
                        strokeDasharray="100"
                        strokeDashoffset={100 * (1 - plat.percentage / 100)}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">
                      {plat.percentage}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: plat.color }}
                      ></span>
                      <h4 className="text-base font-black text-white group-hover:text-golden-sand transition-colors">
                        {plat.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-golden-sand">
                        {plat.weight}x Wp
                      </span>
                    </div>
                    <p className="text-xs text-teal-200/80 mt-0.5">
                      Badge: <span className="text-white font-bold">{plat.badge}</span> • Handle: <span className="text-white font-semibold">@{plat.handle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-base font-black text-white">
                      {plat.rating.toLocaleString()} <span className="text-xs text-golden-sand/80 font-medium">Rating</span>
                    </p>
                    {plat.solvedCount > 0 ? (
                      <p className="text-xs text-teal-200/90 font-medium">
                        {plat.solvedCount} Solved ({plat.percentage}%)
                      </p>
                    ) : (
                      <p className="text-xs text-teal-200/90 font-medium">
                        {plat.percentage > 0 ? `${plat.percentage}%` : 'Synced'}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-golden-sand/80 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
