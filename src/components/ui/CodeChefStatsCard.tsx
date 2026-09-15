'use client';

import React from 'react';
import { Trophy, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

/**
 * CodeChef Stats Display Card
 * Renders CodeChef-specific stats in a compact card format
 * Used across Dashboard, Leaderboard, and Profile pages
 */

interface CodeChefStats {
  rating: number | null;
  solved: number;
  stars: string | null;
  globalRank: string | null;
  failCount?: number;
  lastError?: string | null;
}

interface CodeChefStatsCardProps {
  stats: CodeChefStats;
  username?: string;
  isLoading?: boolean;
  variant?: 'compact' | 'full' | 'inline';
  showError?: boolean;
}

const CodeChefStatsCard: React.FC<CodeChefStatsCardProps> = ({
  stats,
  username,
  isLoading = false,
  variant = 'compact',
  showError = true,
}) => {
  const hasData = stats.rating !== null || stats.solved > 0;
  const isFailedProfile = (stats.failCount ?? 0) >= 3;

  if (isLoading) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center ${
        variant === 'compact' ? 'p-4 h-32' : 'p-6 h-48'
      }`}>
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (isFailedProfile && showError) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Profile Unavailable</span>
        </div>
        <p className="text-xs text-amber-600">{stats.lastError || 'Unable to fetch CodeChef profile after multiple attempts.'}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-600 font-medium">No CodeChef data</p>
        {username && <p className="text-xs text-gray-500 mt-1">Handle: {username}</p>}
      </div>
    );
  }

  // Compact variant - used in leaderboards and profile previews
  if (variant === 'compact') {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">CodeChef</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
            stats.stars 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {stats.stars ? `${stats.stars}★` : '─'}
          </span>
        </div>
        
        <div className="space-y-1.5">
          {stats.rating && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-600 font-medium">Rating</span>
              <span className="text-sm font-black text-emerald-800">{stats.rating}</span>
            </div>
          )}
          
          {stats.solved > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-teal-600 font-medium">Solved</span>
              <span className="text-sm font-bold text-teal-800">{stats.solved}</span>
            </div>
          )}
          
          {stats.globalRank && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-teal-600 font-medium">Rank</span>
              <span className="text-xs font-black text-teal-700 px-2 py-0.5 bg-white rounded-lg border border-teal-200">
                #{stats.globalRank}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inline variant - used in platform listings
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800">CodeChef</p>
          <p className="text-xs text-emerald-600">{stats.rating ? `${stats.rating} rating` : `${stats.solved} solved`}</p>
        </div>
        
        {stats.stars && (
          <span className="text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
            {stats.stars}★
          </span>
        )}
      </div>
    );
  }

  // Full variant - detailed dashboard card
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-emerald-900">CodeChef</h3>
            {username && <p className="text-xs text-emerald-600 font-medium">{username}</p>}
          </div>
        </div>
        
        {stats.stars && (
          <span className="text-lg font-black text-yellow-600 bg-yellow-100/60 px-3 py-1.5 rounded-full border border-yellow-200">
            {stats.stars}★
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Rating */}
        {stats.rating && (
          <div className="bg-white/60 backdrop-blur rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold mb-1">Rating</p>
            <p className="text-2xl font-black text-emerald-800">{stats.rating}</p>
            <p className="text-[10px] text-emerald-500 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Active
            </p>
          </div>
        )}

        {/* Solved */}
        {stats.solved > 0 && (
          <div className="bg-white/60 backdrop-blur rounded-xl p-3 text-center border border-teal-100">
            <p className="text-xs text-teal-600 font-semibold mb-1">Solved</p>
            <p className="text-2xl font-black text-teal-800">{stats.solved}</p>
            <p className="text-[10px] text-teal-500 mt-1">Problems</p>
          </div>
        )}

        {/* Rank */}
        {stats.globalRank && (
          <div className="bg-white/60 backdrop-blur rounded-xl p-3 text-center border border-cyan-100">
            <p className="text-xs text-cyan-600 font-semibold mb-1">Global Rank</p>
            <p className="text-lg font-black text-cyan-800 truncate">#{stats.globalRank}</p>
            <p className="text-[10px] text-cyan-500 mt-1">Worldwide</p>
          </div>
        )}
      </div>

      {/* Footer Status */}
      {stats.lastError && showError && (
        <div className="pt-2 border-t border-emerald-100">
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Last sync error: {stats.lastError}
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeChefStatsCard;
