'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';

export interface ContestEvent {
  id: string;
  title: string;
  time: string;
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef' | 'AtCoder' | 'NSEC';
  badge: string;
  duration: string;
  ratedFor: string;
  url: string;
  type: 'major' | 'regular';
}

// Multi-month contest database (July, August, September 2026) keyed by "YYYY-MM-DD"
export const CONTEST_DATABASE: Record<string, ContestEvent[]> = {
  // August 2026
  '2026-08-01': [
    {
      id: 'lc-bw-137',
      title: 'LeetCode Biweekly Contest 137',
      time: '20:00 IST',
      duration: '1.5 hrs',
      platform: 'LeetCode',
      badge: 'Registered 🎯',
      ratedFor: 'All Users (Global)',
      url: 'https://leetcode.com/contest',
      type: 'major',
    },
  ],
  '2026-08-02': [
    {
      id: 'lc-w-410',
      title: 'LeetCode Weekly Contest 410',
      time: '08:00 IST',
      duration: '1.5 hrs',
      platform: 'LeetCode',
      badge: 'Registered 🎯',
      ratedFor: 'All Users (Global)',
      url: 'https://leetcode.com/contest',
      type: 'major',
    },
  ],
  '2026-08-05': [
    {
      id: 'nsec-avahan-26',
      title: 'NSEC Avahan Cup 2026 (Internal Championship)',
      time: '20:00 - 22:30 IST',
      duration: '2.5 hrs',
      platform: 'NSEC',
      badge: 'Championship 🏆',
      ratedFor: 'NSEC College Students (2.0x Multiplier)',
      url: 'https://nsec.ac.in/cp',
      type: 'major',
    },
  ],
  '2026-08-08': [
    {
      id: 'abc-365',
      title: 'AtCoder Beginner Contest 365',
      time: '17:30 IST',
      duration: '1.6 hrs',
      platform: 'AtCoder',
      badge: 'Rated <2800 ⭐',
      ratedFor: 'Beginner & Intermediate',
      url: 'https://atcoder.jp',
      type: 'major',
    },
  ],
  '2026-08-12': [
    {
      id: 'cf-950-div2',
      title: 'Codeforces Round #950 (Div. 2 & Div. 1)',
      time: '20:05 IST',
      duration: '2.0 hrs',
      platform: 'Codeforces',
      badge: 'Registered 🔥',
      ratedFor: 'Div. 1 & Div. 2 Users',
      url: 'https://codeforces.com',
      type: 'major',
    },
  ],
  '2026-08-15': [
    {
      id: 'lc-bw-138',
      title: 'LeetCode Biweekly Contest 138',
      time: '20:00 IST',
      duration: '1.5 hrs',
      platform: 'LeetCode',
      badge: 'Scheduled 🎯',
      ratedFor: 'All Users (Global)',
      url: 'https://leetcode.com',
      type: 'major',
    },
  ],
  '2026-08-19': [
    {
      id: 'cc-start-150',
      title: 'CodeChef Starters 150 (Div. 1, 2, 3)',
      time: '20:00 IST',
      duration: '2.0 hrs',
      platform: 'CodeChef',
      badge: 'Registered ⭐',
      ratedFor: 'All Divisions',
      url: 'https://codechef.com',
      type: 'major',
    },
  ],
  '2026-08-23': [
    {
      id: 'cf-951-div3',
      title: 'Codeforces Round #951 (Div. 3)',
      time: '20:05 IST',
      duration: '2.25 hrs',
      platform: 'Codeforces',
      badge: 'Rated <1600 ⚡',
      ratedFor: 'Div. 3 Users',
      url: 'https://codeforces.com',
      type: 'major',
    },
  ],
  '2026-08-26': [
    {
      id: 'lc-bw-139',
      title: 'LeetCode Biweekly Contest 139',
      time: '20:00 IST',
      duration: '1.5 hrs',
      platform: 'LeetCode',
      badge: 'Scheduled 🎯',
      ratedFor: 'All Users (Global)',
      url: 'https://leetcode.com',
      type: 'major',
    },
  ],
  '2026-08-30': [
    {
      id: 'nsec-sprint-end',
      title: 'NSEC August Sprint Finale',
      time: '18:00 IST',
      duration: '3.0 hrs',
      platform: 'NSEC',
      badge: 'Championship 🏆',
      ratedFor: 'All NSEC Departments',
      url: 'https://nsec.ac.in',
      type: 'major',
    },
  ],
};

export function ContestCalendar() {
  // Real dynamic Date state: default to August 4, 2026
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 7, 1)); // Month 7 is August (0-indexed)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 5)); // Default selected Aug 5

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days dynamically for ANY month and year
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Add empty placeholders before 1st day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedKey = formatDateKey(selectedDate);
  const eventsForSelectedDate = CONTEST_DATABASE[selectedKey] || [];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 4); // Standardized today Aug 4, 2026
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const getPlatformBadgeStyle = (platform: string) => {
    switch (platform) {
      case 'Codeforces':
        return 'bg-[#1F8ACB]/15 text-[#1F8ACB] border-[#1F8ACB]/30';
      case 'LeetCode':
        return 'bg-[#FFA116]/15 text-onyx border-[#FFA116]/40';
      case 'CodeChef':
        return 'bg-[#5B4638]/15 text-[#5B4638] border-[#5B4638]/30';
      case 'AtCoder':
        return 'bg-onyx/10 text-onyx border-onyx/20';
      default:
        return 'bg-tomato-jam/15 text-tomato-jam border-tomato-jam/30';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Calendar Month & Navigation Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-golden-sand/25 text-tomato-jam flex items-center justify-center font-black shadow-2xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-onyx leading-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <p className="text-xs text-onyx/60 font-medium">Official Contest Schedule &amp; Training</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-onyx/12 hover:bg-onyx/5 text-onyx/80 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-golden-sand/25 text-onyx text-xs font-extrabold border border-onyx/15 hover:bg-golden-sand/40 transition-all cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-onyx/12 hover:bg-onyx/5 text-onyx/80 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header (Sun - Sat) */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-[11px] font-black text-onyx/50 uppercase tracking-wider py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dynamic Date Grid (Supports ANY month & leap years correctly!) */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {calendarDays.map((dateObj, idx) => {
          if (!dateObj) {
            return <div key={`empty-${idx}`} className="h-10 w-full rounded-xl bg-transparent" />;
          }

          const dateKey = formatDateKey(dateObj);
          const hasContest = Boolean(CONTEST_DATABASE[dateKey]?.length);
          const isSelected = formatDateKey(selectedDate) === dateKey;
          const isToday = dateKey === '2026-08-04'; // Simulated Today

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateObj)}
              className={`h-10 w-full rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-onyx text-white shadow-sm ring-2 ring-golden-sand scale-105 font-black z-10'
                  : hasContest
                  ? 'bg-tomato-jam text-white shadow-2xs hover:scale-105 font-black'
                  : isToday
                  ? 'bg-golden-sand/30 text-onyx border-2 border-tomato-jam font-extrabold'
                  : 'bg-[#FFF1D6] text-onyx hover:bg-onyx/10 border border-onyx/5'
              }`}
            >
              <span>{dateObj.getDate()}</span>
              {hasContest && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-golden-sand"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Selected Date Details Card */}
      <div className="p-4 rounded-2xl bg-[#FFF1D6] border border-onyx/12 space-y-3 mt-3">
        <div className="flex items-center justify-between pb-2 border-b border-onyx/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-onyx">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </span>
            {formatDateKey(selectedDate) === '2026-08-04' && (
              <span className="px-2 py-0.5 rounded-full bg-golden-sand/30 text-onyx text-[10px] font-extrabold">
                TODAY
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-onyx/60">
            {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'Contest' : 'Contests'}
          </span>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {eventsForSelectedDate.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-white border border-onyx/12 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getPlatformBadgeStyle(
                        ev.platform
                      )}`}
                    >
                      {ev.platform}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-golden-sand/20 text-tomato-jam">
                      {ev.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-onyx leading-snug">
                    {ev.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-onyx/70">
                    <span className="flex items-center gap-1 font-semibold text-onyx">
                      <Clock className="w-3.5 h-3.5 text-tomato-jam" />
                      {ev.time} ({ev.duration})
                    </span>
                    <span>•</span>
                    <span>{ev.ratedFor}</span>
                  </div>
                </div>

                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-tomato-jam text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Register</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-onyx/12 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-golden-sand/20 text-tomato-jam flex items-center justify-center mx-auto font-black text-xs">
              🎯
            </div>
            <h4 className="text-xs font-black text-onyx">Open Training &amp; Upsolving Day</h4>
            <p className="text-[11px] text-onyx/70 max-w-sm mx-auto">
              No major external contests scheduled. Perfect day to practice Dynamic Programming or upsolve previous Codeforces Round #950 problems!
            </p>
          </div>
        )}
      </div>

      {/* Calendar Legend */}
      <div className="pt-2 border-t border-onyx/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-onyx/70">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-tomato-jam inline-block"></span>
          Major Contest Day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-golden-sand inline-block border border-onyx/30"></span>
          Current Day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-onyx inline-block"></span>
          Selected
        </span>
      </div>
    </div>
  );
}
