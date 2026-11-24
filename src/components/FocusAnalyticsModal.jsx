import React, { useRef } from 'react';
import { X, Flame, Clock, Award, BarChart3, Download, Upload } from 'lucide-react';
import { storageService } from '../services/storageService';
import ProductivityHeatmap from './ProductivityHeatmap';

export default function FocusAnalyticsModal({
  isOpen,
  onClose,
  stats,
  theme,
  onDataImported,
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const totalHours = Math.floor((stats.totalFocusMinutes || 0) / 60);
  const totalRemainingMinutes = (stats.totalFocusMinutes || 0) % 60;

  // Generate last 7 days chart data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayData = stats.dailyHistory?.[dateStr] || { minutes: 0, sessions: 0 };
    last7Days.push({
      dateStr,
      dayLabel,
      minutes: dayData.minutes,
      sessions: dayData.sessions,
    });
  }

  const maxMinutesInWeek = Math.max(...last7Days.map(d => d.minutes), 60);

  const handleExport = () => {
    const json = storageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenfocus_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = storageService.importData(content);
        if (success) {
          alert('Data imported successfully!');
          if (onDataImported) onDataImported();
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl ${theme.surfaceClass} border shadow-2xl relative max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: theme.accentColor }} />
            <h2 className="text-base font-semibold text-white">Focus Insights & Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
              <Clock className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
              <span>Time Focused</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {totalHours > 0 ? `${totalHours}h ` : ''}{totalRemainingMinutes}m
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Sessions</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {stats.totalSessionsCompleted || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Day Streak</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {stats.currentStreak || 0} days
            </div>
          </div>
        </div>

        {/* Consistency Heatmap */}
        <ProductivityHeatmap stats={stats} theme={theme} />

        {/* 7-Day Trend Chart */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 my-4">
          <div className="text-xs font-medium text-white/70 mb-3 flex items-center justify-between">
            <span>Last 7 Days Breakdown</span>
            <span className="text-[10px] text-white/40">Minutes focused</span>
          </div>

          <div className="flex items-end justify-between h-28 pt-4 px-2 gap-2">
            {last7Days.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.minutes / maxMinutesInWeek) * 100));
              const isToday = idx === 6;
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="text-[10px] text-white/60 font-mono">
                    {day.minutes > 0 ? `${day.minutes}m` : '-'}
                  </div>
                  <div
                    className="w-full max-w-[28px] rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? theme.accentColor : 'rgba(255, 255, 255, 0.18)',
                      boxShadow: isToday ? `0 0 12px ${theme.glowColor}` : 'none',
                    }}
                  />
                  <span className={`text-[11px] font-medium ${isToday ? 'text-white' : 'text-white/40'}`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mindful Note */}
        <div className="p-3 rounded-xl bg-white/5 text-center text-xs italic text-white/60 font-serif">
          "Consistency is like water carving through stone — gentle, patient, and quietly unstoppable."
        </div>

        {/* Backup & Restore Data */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-white/10 text-xs">
          <span className="text-white/50">Local-First Storage</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              title="Export JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              title="Import JSON backup"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
