/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Search, Bell, Plus } from 'lucide-react';
import { CURRENT_USER } from '@/lib/constants';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FFF1D6] text-onyx flex flex-col">
      {/* Mobile Top Navbar (visible only on small screens) */}
      <div className="lg:hidden shrink-0 sticky top-0 z-50 bg-[#FFF1D6]">
        <Navbar />
      </div>

      <div className="flex-1 w-full flex">
        {/* Floating Left Bento Sidebar with Curved Active Bubble Tab Effect */}
        <Sidebar />

        {/* Main Workspace Area with Custom Scrollbar & Silky Smooth Scrolling */}
        <div className="flex-1 min-w-0 px-4 sm:px-8 py-5 flex flex-col gap-5">
          {/* Top Header Bar for Desktop/Tablet (No background, right actions only) */}
          <header className="hidden lg:flex items-center justify-end px-0 py-1 bg-transparent border-0 shadow-none shrink-0">
            <div className="flex items-center gap-3">
              {/* + Sync Profile Button */}
              <button
                onClick={() => alert('Syncing CP profile ratings across all connected platforms...')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-onyx hover:bg-onyx/80 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-tomato-jam" />
                <span>Sync Profile</span>
              </button>

              {/* Search Button */}
              <button
                onClick={() => alert('Search dialog')}
                className="w-9 h-9 rounded-xl bg-white border border-pine-teal/30 hover:bg-golden-sand/30 flex items-center justify-center text-onyx transition-colors cursor-pointer shadow-2xs"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => alert('Notifications: 2 upcoming contests')}
                className="relative w-9 h-9 rounded-xl bg-white border border-pine-teal/30 hover:bg-golden-sand/30 flex items-center justify-center text-onyx transition-colors cursor-pointer shadow-2xs"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tomato-jam"></span>
              </button>

              {/* User Avatar */}
              <Link href="/profile" className="flex items-center gap-2 pl-1">
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-tomato-jam/40 shadow-2xs"
                />
              </Link>
            </div>
          </header>

          {/* Main Page Content (No Footer) */}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
