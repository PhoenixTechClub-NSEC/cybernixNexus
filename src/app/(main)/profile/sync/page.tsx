/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Multi-Platform Rating Sync 404 Page
 * 
 * SETUP INSTRUCTIONS:
 * 1. Save the provided Phoenix 404 illustration image as: /public/404-phoenix.png
 * 2. Image dimensions should be square (recommended: 512x512px or higher)
 * 3. The image will be automatically loaded and displayed on the right side
 * 4. This page is triggered when users click "Platform Sync" on their profile
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function PlatformSyncPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Header with logo and back button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-onyx/10 text-onyx font-bold text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      {/* Main content container */}
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left side - Text content */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          {/* 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tomato-jam/20 border border-tomato-jam/40 text-tomato-jam font-bold text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-tomato-jam animate-pulse" />
            404
          </div>

          {/* Main heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-onyx tracking-tight">
              Oops!
              <br />
              Page Not <span className="text-golden-sand">Found</span>
            </h1>
            <p className="text-base text-onyx/70 max-w-lg">
              The page you're looking for might have been moved, deleted, or never existed. But don't worry, our phoenix always finds a way back.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-4">
            <button
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-onyx hover:bg-onyx/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Profile
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-golden-sand/20 border-2 border-onyx/20 text-onyx font-bold text-sm transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Footer message */}
          <div className="flex items-center gap-2 text-xs text-onyx/60 font-semibold pt-4">
            <span className="text-lg">🔥</span>
            <p>Some paths are just not meant to be found.</p>
          </div>
        </div>

        {/* Right side - Phoenix illustration */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            <img
              src="/404-phoenix.png"
              alt="404 Phoenix"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
