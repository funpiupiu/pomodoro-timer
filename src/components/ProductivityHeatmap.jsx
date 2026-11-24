import React, { useMemo } from 'react';
import { TASK_TAGS } from '../services/storageService';

export default function ProductivityHeatmap({ stats, theme }) {
  // Generate a 12-week grid (84 days) ending on today
  const { weeks, totalMinutesInGrid } = useMemo(() => {
    const today = new Date();
    const days = [];
    let gridTotal = 0;

    // 84 days = 12 weeks
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = stats.dailyHistory?.[dateStr] || { minutes: 0, sessions: 0 };
      gridTotal += dayData.minutes;
      days.push({
        dateStr,
        dayOfWeek: d.getDay(), // 0 (Sun) to 6 (Sat)
        minutes: dayData.minutes,
        sessions: dayData.sessions,
      });
    }

    // Group into columns of 7 days (weeks)
    const groupedWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      groupedWeeks.push(days.slice(i, i + 7));
    }
    return { weeks: groupedWeeks, totalMinutesInGrid: gridTotal };
  }, [stats.dailyHistory]);

  // Color intensity function
  const getCellColor = (minutes) => {
    if (minutes === 0) return 'bg-white/5 border border-white/5';
    if (minutes <= 25) return 'bg-emerald-500/30 border border-emerald-500/40';
    if (minutes <= 60) return 'bg-emerald-500/60 border border-emerald-500/70';
    if (minutes <= 120) return 'bg-emerald-500/85 border border-emerald-400';
    return 'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
  };

  // Tag breakdown calculations
  const totalTagMinutes = Object.values(stats.tagBreakdown || {}).reduce((acc, v) => acc + v, 0);

  return (
    <div className="w-full my-4 p-4 rounded-2xl bg-white/5 border border-white/5">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-white/90">Consistency Heatmap (12 Weeks)</span>
        <span className="font-mono text-[11px] text-white/50">{totalMinutesInGrid}m focused</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 touch-pan-x scrollbar-thin">
        <div className="flex items-center gap-1.5 min-w-[280px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.minutes} min (${day.sessions} sessions)`}
                  className={`w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer ${getCellColor(
                    day.minutes
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2.5 text-[10px] text-white/40">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/5" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 border border-emerald-500/70" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/85 border border-emerald-400" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-300" />
        <span>More</span>
      </div>

      {/* Category / Tag Distribution */}
      {totalTagMinutes > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-[11px] font-medium text-white/70 mb-2">Category Distribution</div>
          
          {/* Segmented Progress Bar */}
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden flex mb-2.5">
            {TASK_TAGS.map((tag) => {
              const minutes = stats.tagBreakdown?.[tag.id] || 0;
              if (minutes === 0) return null;
              const percent = Math.round((minutes / totalTagMinutes) * 100);
              return (
                <div
                  key={tag.id}
                  style={{ width: `${percent}%`, backgroundColor: tag.color }}
                  title={`${tag.label}: ${minutes}m (${percent}%)`}
                />
              );
            })}
          </div>

          {/* Tag Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {TASK_TAGS.map((tag) => {
              const minutes = stats.tagBreakdown?.[tag.id] || 0;
              if (minutes === 0) return null;
              const percent = Math.round((minutes / totalTagMinutes) * 100);
              return (
                <div
                  key={tag.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-white font-medium">{tag.label}</span>
                  <span className="text-white/40 font-mono">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
