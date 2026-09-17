/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserProfile } from '@/types';
import { getLeaderboard } from '@/lib/api';
import { LevelBadge } from '@/features/gamification/components/LevelBadge';
import { ArrowLeft } from 'lucide-react';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch all leaderboard users and find the one matching userId
        const users = await getLeaderboard(100);
        const foundUser = users.find((u) => u.id === userId);
        
        if (!foundUser) {
          throw new Error('User not found');
        }
        
        setUser(foundUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return <CapybaraLoader />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-onyx">User Not Found</h1>
          <p className="text-sm text-onyx/70">{error || 'Unable to load user details'}</p>
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-onyx text-white font-bold text-sm hover:bg-[#3A2719] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-onyx/12 text-onyx font-bold text-sm hover:bg-onyx/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rankings
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight">
          Player Profile
        </h1>
        <div className="w-12" />
      </div>

      {/* Main Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Header & Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
            {/* Avatar & Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 pb-6 border-b border-onyx/10">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-tomato-jam/30 shadow-lg"
                loading="lazy"
              />
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-black text-onyx mb-2">
                  {user.name}
                </h1>
                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-sm font-bold text-onyx/70">
                    {user.department} • {user.year}
                  </p>
                  <p className="text-xs text-onyx/60">
                    College Rank: <span className="font-black text-tomato-jam">#{user.collegeRank}</span>
                  </p>
                </div>
                <LevelBadge level={user.level} tier={user.tier} size="md" />
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-golden-sand/20 to-golden-sand/10 border border-onyx/12 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-2">
                  CP Score
                </p>
                <p className="text-2xl sm:text-3xl font-black text-tomato-jam">
                  {user.cpScore.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-pine-teal/20 to-pine-teal/10 border border-onyx/12 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-2">
                  Total Solved
                </p>
                <p className="text-2xl sm:text-3xl font-black text-onyx">
                  {user.solvedByDifficulty.total}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-tomato-jam/20 to-tomato-jam/10 border border-onyx/12 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-2">
                  Current Streak
                </p>
                <p className="text-2xl sm:text-3xl font-black text-tomato-jam">
                  🔥 {user.currentStreak}d
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-onyx/10 to-onyx/5 border border-onyx/12 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-onyx/70 mb-2">
                  Level
                </p>
                <p className="text-2xl sm:text-3xl font-black text-onyx">
                  {user.level}
                </p>
              </div>
            </div>

            {/* Problem Difficulty Breakdown */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-onyx">Problems Solved by Difficulty</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 mb-1">Easy</p>
                  <p className="text-xl font-black text-emerald-600">
                    {user.solvedByDifficulty.easy || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Medium</p>
                  <p className="text-xl font-black text-yellow-600">
                    {user.solvedByDifficulty.medium || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                  <p className="text-xs font-bold text-red-700 mb-1">Hard</p>
                  <p className="text-xl font-black text-red-600">
                    {user.solvedByDifficulty.hard || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Synced Platforms */}
          <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-onyx mb-4">Synced Platforms ({user.platforms.length})</h2>
            {user.platforms.length === 0 ? (
              <p className="text-sm text-onyx/60 text-center py-8">No platforms connected</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.platforms.map((platform) => (
                  <div
                    key={platform.platform}
                    className="p-5 rounded-2xl bg-golden-sand/15 border border-onyx/12 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-onyx text-lg">{platform.platform}</h3>
                      <span className="px-2.5 py-1 rounded-lg bg-tomato-jam/20 text-tomato-jam text-xs font-bold">
                        {platform.rating}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-onyx/70">
                        <span className="font-bold text-onyx">Handle:</span> @{platform.handle}
                      </p>
                      <p className="text-onyx/70">
                        <span className="font-bold text-onyx">Solved:</span> {platform.solvedCount} problems
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges Card - FIXED ON RIGHT */}
      <div className="rounded-3xl bg-white border border-onyx/12 p-6 shadow-sm fixed right-4 lg:right-8 top-28 w-72 lg:w-80 max-h-96 overflow-y-auto custom-scrollbar z-40">
        <h2 className="text-lg font-black text-onyx mb-4">
          Unlocked Badges ({user.badges.length})
        </h2>
        {user.badges.length === 0 ? (
          <p className="text-sm text-onyx/60 text-center py-8">No badges unlocked yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                title={badge.title}
                className="p-3 rounded-2xl bg-golden-sand/20 border border-onyx/12 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-[10px] font-bold text-onyx leading-tight">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

