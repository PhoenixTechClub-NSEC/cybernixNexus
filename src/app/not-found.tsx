/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden select-none">
      {/* Header with logo */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <img
            src="/phoenix_logo-removebg-preview.png"
            alt="Cybernix Phoenix Logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-base font-black tracking-tight text-onyx">
            Cybernix <span className="text-tomato-jam">Nexus</span>
          </span>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-onyx/10 text-onyx font-bold text-sm transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      {/* Main content container (Centered layout without 404 image) */}
      <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6 z-10 py-8">
        {/* 404 Badge (Static indicator, no looped animation) */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tomato-jam/20 border border-tomato-jam/40 text-tomato-jam font-bold text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-tomato-jam" />
          404 • Not Found
        </div>

        {/* Main heading */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-onyx tracking-tight">
            Oops! Page Not <span className="text-tomato-jam">Found</span>
          </h1>
          <p className="text-base text-onyx/70 max-w-lg mx-auto">
            The page you are looking for might have been moved, deleted, or does not exist. Our phoenix always finds a way back.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-onyx hover:bg-onyx/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        {/* Footer message */}
        <div className="flex items-center justify-center gap-2 text-xs text-onyx/60 font-semibold pt-2">
          <span className="text-base">🔥</span>
          <p>Some paths are just not meant to be found.</p>
        </div>
      </div>
    </div>
  );
}
