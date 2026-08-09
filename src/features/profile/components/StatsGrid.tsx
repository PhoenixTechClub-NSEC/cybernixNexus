import React from 'react';
import { UserProfile } from '@/types';
import { BarChart3, Globe, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StatsGridProps {
  user: UserProfile;
}

export function StatsGrid({ user }: StatsGridProps) {
  const { easy, medium, hard, total } = user.solvedByDifficulty;

  const getPlatformBg = (platform: string) => {
    switch (platform) {
      case 'Codeforces':
        return 'border-tomato-jam/30 bg-tomato-jam/5 text-tomato-jam';
      case 'LeetCode':
        return 'border-golden-sand/50 bg-golden-sand/10 text-dark-amethyst';
      case 'CodeChef':
        return 'border-golden-sand/40 bg-golden-sand/8 text-onyx';
      case 'HackerRank':
        return 'border-onyx/12 bg-pine-teal/5 text-onyx/70';
      case 'GFG':
        return 'border-onyx/12 bg-pine-teal/5 text-onyx/70';
      default:
        return 'border-onyx/12 bg-pine-teal/5 text-onyx';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3-Col Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Problem Difficulty Breakdown */}
        <div className="rounded-2xl bg-white border border-onyx/12 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-onyx uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-onyx/70" />
              DSA Difficulty Split
            </h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-golden-sand/15 text-onyx border border-golden-sand/30">
              Total: {total}
            </span>
          </div>

          <div className="space-y-3">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-onyx/70">Easy</span>
                <span className="text-onyx">
                  {easy} / <span className="text-onyx/70">{total > 0 ? Math.round((easy / total) * 100) : 0}%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-pine-teal/10 overflow-hidden">
                <div
                  className="h-full bg-pine-teal rounded-full"
                  style={{ width: total > 0 ? `${(easy / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-golden-sand">Medium</span>
                <span className="text-onyx">
                  {medium} / <span className="text-onyx/70">{total > 0 ? Math.round((medium / total) * 100) : 0}%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-golden-sand/15 overflow-hidden">
                <div
                  className="h-full bg-golden-sand rounded-full"
                  style={{ width: total > 0 ? `${(medium / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-tomato-jam">Hard</span>
                <span className="text-onyx">
                  {hard} / <span className="text-onyx/70">{total > 0 ? Math.round((hard / total) * 100) : 0}%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-tomato-jam/10 overflow-hidden">
                <div
                  className="h-full bg-tomato-jam rounded-full"
                  style={{ width: total > 0 ? `${(hard / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-onyx/12 text-[11px] text-onyx/70 flex justify-between">
            <span>Points Earned (Bq):</span>
            <span className="font-bold text-onyx">
              {(easy * 10 + medium * 30 + hard * 75).toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Card 2: Synced CP Profiles */}
        <div className="rounded-2xl bg-white border border-onyx/12 p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-onyx uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-dark-amethyst" />
                Multi-Platform Rating Synchronization
              </h4>
              <p className="text-xs text-onyx/70 mt-0.5">
                Connected profiles across Codeforces, LeetCode, CodeChef, HackerRank, and GFG.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-onyx/70 bg-pine-teal/5 px-2.5 py-1 rounded-full border border-onyx/12">
              <ShieldCheck className="w-3.5 h-3.5" />
              Synced Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.platforms.map((platform) => (
              <a
                key={platform.platform}
                href={platform.profileUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-xs ${getPlatformBg(
                  platform.platform
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm truncate">@{platform.handle}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-current/20 shrink-0">
                    {platform.weight}x Wp
                  </span>
                </div>
                <div className="mt-2 text-xs">
                  <p className="text-onyx/70">Platform: <span className="font-semibold text-onyx">{platform.platform}</span></p>
                </div>
                <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-75">Rating</p>
                    <p className="text-base font-black">{platform.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-75">Solved</p>
                    <p className="text-base font-black">{platform.solvedCount}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Codolio-Style DSA Topic Analysis Bar Charts */}
      <div className="rounded-2xl bg-white border border-onyx/12 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-dark-amethyst" />
              <h3 className="text-lg font-bold text-onyx">
                DSA Topic Analysis
              </h3>
            </div>
            <p className="text-xs text-onyx/70 mt-0.5">
              Breakdown of {total} total accepted problems categorized by algorithm & data structure topics.
            </p>
          </div>
          <div className="text-xs font-semibold text-onyx/70 bg-golden-sand/10 px-3 py-1.5 rounded-lg border border-golden-sand/30">
            Codolio Style Breakdown
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {user.dsaTopics?.length === 0 ? (
            <div className="col-span-2 p-4 text-center text-xs font-bold text-onyx/50 bg-golden-sand/10 rounded-xl">
              No DSA topic tags tracked yet
            </div>
          ) : (
            user.dsaTopics?.map((item) => {
              const maxVal = user.dsaTopics[0]?.count || 415;
              const percentage = Math.round((item.count / maxVal) * 100);
              return (
                <div key={item.topic} className="flex items-center gap-3">
                  <div className="w-44 text-xs font-bold text-onyx truncate text-right">
                    {item.topic}
                  </div>
                  <div className="flex-1 bg-pine-teal/8 h-6 rounded-lg overflow-hidden relative flex items-center">
                    <div
                      className={`h-full ${item.color || 'bg-pine-teal'} transition-all duration-500 rounded-lg flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(percentage, 15)}%` }}
                    >
                      <span className="text-xs font-black text-white drop-shadow-xs">
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
    </div>
  );
}
