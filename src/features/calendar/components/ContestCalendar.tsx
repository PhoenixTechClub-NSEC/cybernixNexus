'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef' | 'AtCoder' | 'NSEC' | string;
  badge: string;
  duration: string;
  ratedFor: string;
  url: string;
  type: 'major' | 'regular';
}

export function ContestCalendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(now);

  const [contestDB, setContestDB] = useState<Record<string, ContestEvent[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({});

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.contests)) {
          const grouped: Record<string, ContestEvent[]> = {};
          const regMap: Record<string, boolean> = {};

          data.contests.forEach((c: any) => {
            const dateObj = new Date(c.startTime);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            const dateKey = `${y}-${m}-${d}`;

            const event: ContestEvent = {
              id: c.id,
              title: c.title,
              time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: c.duration,
              platform: c.platform,
              badge: c.badge || (c.isInternal ? 'Championship 🏆' : 'Rated Match'),
              ratedFor: c.ratedFor || 'All Users',
              url: c.url || '#',
              type: 'major',
            };

            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);

            if (c.isRegisteredByMe) {
              regMap[c.id] = true;
            }
          });

          setContestDB(grouped);
          setRegisteredMap(regMap);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contests calendar from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [currentMonth]);

  const handleRegister = async (contestId: string, url: string) => {
    if (!url.startsWith('http')) {
      try {
        const res = await fetch('/api/contests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contestId }),
        });
        const data = await res.json();
        if (data.success) {
          setRegisteredMap((prev) => ({ ...prev, [contestId]: true }));
        }
      } catch (err) {
        console.error('Registration failed:', err);
      }
    }
  };

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
  const eventsForSelectedDate = contestDB[selectedKey] || [];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
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
    <div className="w-full space-y-4 relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tomato-jam"></div>
        </div>
      )}
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

      {/* Dynamic Date Grid (Supports ANY month & leap years correctly) */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {calendarDays.map((dateObj, idx) => {
          if (!dateObj) {
            return <div key={`empty-${idx}`} className="h-10 w-full rounded-xl bg-transparent" />;
          }

          const dateKey = formatDateKey(dateObj);
          const hasContest = Boolean(contestDB[dateKey]?.length);
          const isSelected = formatDateKey(selectedDate) === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateObj)}
              className={`h-10 w-full rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${isSelected
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
            {formatDateKey(selectedDate) === formatDateKey(new Date()) && (
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
            {eventsForSelectedDate.map((ev) => {
              const isRegistered = registeredMap[ev.id];
              return (
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
                        {isRegistered ? 'Registered 🎯' : ev.badge}
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

                  {ev.url.startsWith('http') ? (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-tomato-jam text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={isRegistered}
                      onClick={() => handleRegister(ev.id, ev.url)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${isRegistered
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-tomato-jam text-white hover:bg-red-700'
                        }`}
                    >
                      <span>{isRegistered ? 'Enrolled ✓' : 'Register'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-onyx/12 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-golden-sand/20 text-tomato-jam flex items-center justify-center mx-auto font-black text-xs">
              🎯
            </div>
            <h4 className="text-xs font-black text-onyx">Open Practice &amp; Upsolving Day</h4>
            <p className="text-[11px] text-onyx/70 max-w-sm mx-auto">
              No contests scheduled on this date. Perfect day for practice and problem upsolving!
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
