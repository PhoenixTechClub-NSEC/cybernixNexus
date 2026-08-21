'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Calendar, CheckCircle2, Loader2 } from 'lucide-react';

interface DayDetail {
  date: string;
  formattedDate: string;
  count: number;
}

interface HeatmapProps {
  studentId?: string;
  currentStreak?: number;
  maxStreak?: number;
  totalSolved?: number;
}

export function Heatmap({
  studentId,
  currentStreak: initialStreak = 0,
  maxStreak: initialMaxStreak = 0,
  totalSolved: initialTotal = 0,
}: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);

  const [gridData, setGridData] = useState<number[][]>([]);
  const [dayDetails, setDayDetails] = useState<DayDetail[][]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(initialStreak);
  const [maxStreak, setMaxStreak] = useState<number>(initialMaxStreak);
  const [totalSolved, setTotalSolved] = useState<number>(initialTotal);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActivity = async () => {
      setIsLoading(true);
      try {
        const url = studentId
          ? `/api/student/activity?studentId=${encodeURIComponent(studentId)}`
          : '/api/student/activity';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            if (Array.isArray(data.gridData)) {
              setGridData(data.gridData);
            }
            if (Array.isArray(data.dayDetails)) {
              setDayDetails(data.dayDetails);
            }
            if (typeof data.currentStreak === 'number') {
              setCurrentStreak(data.currentStreak);
            }
            if (typeof data.maxStreak === 'number') {
              setMaxStreak(data.maxStreak);
            }
            if (typeof data.totalSolved === 'number') {
              setTotalSolved(data.totalSolved);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load student activity:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-pine-teal/10 hover:bg-pine-teal/20';
    if (count === 1) return 'bg-pine-teal/30 hover:bg-pine-teal/40';
    if (count === 2) return 'bg-pine-teal/50 hover:bg-pine-teal/60';
    if (count === 3) return 'bg-pine-teal/70 hover:bg-pine-teal/80';
    if (count === 4) return 'bg-pine-teal/90 hover:bg-pine-teal';
    return 'bg-pine-teal hover:bg-[#083d36]';
  };

  // Compute month headers aligned with the 52-week columns
  const monthLabels = useMemo(() => {
    if (!dayDetails.length) {
      return [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
    }

    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = '';

    dayDetails.forEach((week, wIdx) => {
      if (week.length > 0) {
        const d = new Date(week[0].date);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        if (monthName !== lastMonth) {
          labels.push({ text: monthName, colIndex: wIdx });
          lastMonth = monthName;
        }
      }
    });

    return labels;
  }, [dayDetails]);

  return (
    <div className="rounded-3xl border border-onyx/12 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-onyx/12 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pine-teal" />
            <h3 className="text-xl font-black text-onyx tracking-tight">
              Annual Coding Activity
            </h3>
            {isLoading && <Loader2 className="w-4 h-4 text-pine-teal animate-spin ml-2" />}
          </div>
          <p className="text-xs text-onyx/70 mt-0.5">
            Blank cells turn green automatically whenever a problem solution is accepted on any synced platform.
          </p>
        </div>

        {/* Streak Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-golden-sand/15 border border-golden-sand/40">
            <Flame className="w-4 h-4 fill-tomato-jam text-tomato-jam animate-bounce" />
            <div>
              <p className="text-[10px] uppercase font-bold text-tomato-jam">
                Active / Max
              </p>
              <p className="text-sm font-black text-onyx leading-none">
                {currentStreak}d / {maxStreak}d
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pine-teal/5 border border-onyx/12">
            <CheckCircle2 className="w-4 h-4 text-onyx/70" />
            <div>
              <p className="text-[10px] uppercase font-bold text-onyx/70">
                12m Total
              </p>
              <p className="text-sm font-black text-onyx leading-none">
                {totalSolved} Solves
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Labels & Activity Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[680px]">
          {/* Aligned Month Labels */}
          {Array.isArray(monthLabels) && typeof monthLabels[0] === 'object' ? (
            <div className="relative h-5 text-[11px] font-bold text-onyx/70 mb-1">
              {(monthLabels as { text: string; colIndex: number }[]).map((m, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{ left: `${(m.colIndex / 52) * 100}%` }}
                >
                  {m.text}
                </span>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-12 text-[11px] font-bold text-onyx/70 mb-1 px-2">
              {(monthLabels as string[]).map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}

          {/* Activity Matrix */}
          <div className="flex gap-1 pt-1">
            {gridData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((count, dIdx) => {
                  const detail = dayDetails[wIdx]?.[dIdx];
                  const displayDate = detail ? detail.formattedDate : `Day ${wIdx * 7 + dIdx + 1}`;

                  return (
                    <div
                      key={dIdx}
                      onMouseEnter={() =>
                        setHoveredDay({
                          date: displayDate,
                          count,
                        })
                      }
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-2xs cursor-pointer transition-colors ${getCellColor(
                        count
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Active Hover Display */}
      <div className="mt-4 pt-3 border-t border-onyx/12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-onyx/70">Less</span>
          <span className="w-3 h-3 rounded-2xs bg-pine-teal/10"></span>
          <span className="w-3 h-3 rounded-2xs bg-pine-teal/30"></span>
          <span className="w-3 h-3 rounded-2xs bg-pine-teal/50"></span>
          <span className="w-3 h-3 rounded-2xs bg-pine-teal/70"></span>
          <span className="w-3 h-3 rounded-2xs bg-pine-teal"></span>
          <span className="text-onyx/70">More</span>
        </div>

        <div className="text-onyx/70 font-medium min-h-[20px]">
          {hoveredDay ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-onyx">
              <span className="w-2 h-2 rounded-full bg-pine-teal"></span>
              {hoveredDay.count === 0
                ? '0 problems solved'
                : `${hoveredDay.count} problem${hoveredDay.count === 1 ? '' : 's'} solved`}
              <span className="text-onyx/70 font-normal">on {hoveredDay.date}</span>
            </span>
          ) : (
            <span className="text-onyx/70">Hover over any square to inspect activity count</span>
          )}
        </div>
      </div>
    </div>
  );
}
