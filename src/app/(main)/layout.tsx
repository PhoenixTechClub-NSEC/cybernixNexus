/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Search, Bell, Plus, Loader2 } from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { user: CURRENT_USER } = useUser();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Redirect unauthenticated users immediately
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    setToastMessage('All notifications marked as read');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen w-full bg-[#FFF1D6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tomato-jam" />
      </div>
    );
  }

  
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
              {/* Search and Sync Profile Buttons Removed as requested */}

              {/* Notifications Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative w-9 h-9 rounded-xl bg-white border border-pine-teal/30 hover:bg-golden-sand/30 flex items-center justify-center text-onyx transition-colors cursor-pointer shadow-2xs"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tomato-jam"></span>
                </button>

                {/* Notifications Popover */}
                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-onyx/10 z-50 overflow-hidden">
                    <div className="p-3.5 border-b border-onyx/5">
                      <h4 className="text-sm font-black text-onyx">Notifications</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      <div className="p-2.5 rounded-xl hover:bg-golden-sand/15 transition-colors cursor-pointer border border-transparent hover:border-golden-sand/30 mb-1">
                        <p className="text-xs font-bold text-onyx">Codeforces Round #962</p>
                        <p className="text-[11px] text-onyx/60 mt-0.5">Starts in 2 hours. Are you ready?</p>
                      </div>
                      <div className="p-2.5 rounded-xl hover:bg-golden-sand/15 transition-colors cursor-pointer border border-transparent hover:border-golden-sand/30">
                        <p className="text-xs font-bold text-onyx">Level Up!</p>
                        <p className="text-[11px] text-onyx/60 mt-0.5">You reached Level {CURRENT_USER.level}. View new Mascot tier.</p>
                      </div>
                    </div>
                    <div className="p-2 border-t border-onyx/5 text-center bg-gray-50/50">
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-bold text-tomato-jam hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <Link href="/profile" className="flex items-center gap-2 pl-1" suppressHydrationWarning>
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  suppressHydrationWarning
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-tomato-jam/40 shadow-2xs"
                />
              </Link>
            </div>
          </header>

          {/* Main Page Content (No Footer) */}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
          <span className="text-lg">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
