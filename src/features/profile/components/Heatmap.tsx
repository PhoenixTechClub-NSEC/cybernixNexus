'use client';

import React, { useState } from 'react';
import { Flame, Calendar, CheckCircle2 } from 'lucide-react';

interface HeatmapProps {
  currentStreak: number;
  maxStreak: number;
  totalSolved: number;
}

export function Heatmap({
  currentStreak = 34,
  maxStreak = 45,
  totalSolved = 939,
}: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);

  // Generate 52 weeks of mock daily data (0 to 6 problems per day)
  const weeks = 52;
  const daysPerWeek = 7;
  const gridData: number[][] = [];
  const todayIndex = weeks * daysPerWeek - 1;

  for (let w = 0; w < weeks; w++) {
    const weekCol: number[] = [];
    for (let d = 0; d < daysPerWeek; d++) {
      const idx = w * daysPerWeek + d;
      // Make the last 34 days consecutive green (current streak)
      if (idx >= todayIndex - currentStreak + 1) {
        // Solved between 1 and 6 problems
        weekCol.push(((idx % 5) + 1));
      } else if (idx % 4 === 0 || idx % 7 === 1 || idx % 11 === 0) {
        weekCol.push(0); // blank day
      } else {
        weekCol.push(((idx % 4) + 1));
      }
    }
    gridData.push(weekCol);
  }

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-pine-teal/10 hover:bg-pine-teal/20';
    if (count === 1) return 'bg-pine-teal/30 hover:bg-pine-teal/40';
    if (count === 2) return 'bg-pine-teal/50 hover:bg-pine-teal/60';
    if (count === 3) return 'bg-pine-teal/70 hover:bg-pine-teal/80';
    if (count === 4) return 'bg-pine-teal/90 hover:bg-pine-teal';
    return 'bg-pine-teal hover:bg-[#083d36]';
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

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

      {/* Month Labels */}
      <div className="grid grid-cols-12 text-[11px] font-bold text-onyx/70 mb-2 px-2">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-1 min-w-[640px]">
          {gridData.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((count, dIdx) => {
                const dayNum = wIdx * 7 + dIdx + 1;
                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() =>
                      setHoveredDay({
                        date: `Day ${dayNum} of 364`,
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
                : `${hoveredDay.count} problems solved`}
              <span className="text-onyx/70 font-normal">({hoveredDay.date})</span>
            </span>
          ) : (
            <span className="text-onyx/70">Hover over any square to inspect activity count</span>
          )}
        </div>
      </div>
    </div>
  );
}
