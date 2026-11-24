import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Zap } from 'lucide-react';
import { TIMER_MODES } from '../constants/themes';

export default function BreathingTimerRing({
  timer,
  theme,
  settings,
  activeTask,
}) {
  const {
    mode,
    progressPercent,
    formattedTime,
    isRunning,
    isOvertime,
    overtimeSeconds,
    cycleCount,
    toggleTimer,
    resetTimer,
    switchMode,
    skipToNext,
    finalizeFlow,
  } = timer;

  const size = 320;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isOvertime
    ? 0 // Full circle in overtime
    : circumference - (progressPercent / 100) * circumference;

  const currentModeInfo = TIMER_MODES[mode] || TIMER_MODES.focus;

  return (
    <div className="flex flex-col items-center justify-center relative w-full max-w-md mx-auto my-4 select-none">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/20 border border-white/5 backdrop-blur-md mb-8 shadow-inner">
        {Object.entries(TIMER_MODES).map(([key, info]) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? theme.pillActive : theme.pillInactive
              }`}
            >
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Circular Timer Display */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Breathing Halo */}
        <div
          className={`absolute rounded-full transition-all duration-1000 pointer-events-none ${
            isOvertime
              ? 'animate-gentle-pulse'
              : isRunning
              ? 'animate-breathe'
              : 'opacity-20'
          }`}
          style={{
            width: size + 40,
            height: size + 40,
            background: isOvertime
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(0,0,0,0) 70%)'
              : `radial-gradient(circle, ${theme.glowColor} 0%, rgba(0,0,0,0) 70%)`,
          }}
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90 filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.ringTrack}
            strokeWidth={strokeWidth}
          />
          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isOvertime ? '#fbbf24' : theme.ringProgress}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Inner Content inside Ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          {/* Cycle Dots */}
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: settings.longBreakInterval || 4 }).map((_, idx) => {
              const isFilled = idx < cycleCount;
              return (
                <div
                  key={idx}
                  title={`Session ${idx + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    isFilled ? 'scale-110 shadow-sm' : 'opacity-30'
                  }`}
                  style={{
                    backgroundColor: isFilled ? (isOvertime ? '#fbbf24' : theme.accentColor) : '#666',
                    boxShadow: isFilled ? `0 0 8px ${isOvertime ? '#fbbf24' : theme.accentColor}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Large Digital Time */}
          <div
            className={`text-6xl sm:text-7xl font-light tracking-tight tabular-nums transition-colors duration-300 drop-shadow-sm font-['Space_Grotesk'] ${
              isOvertime ? 'text-amber-300' : ''
            }`}
            style={{ color: isOvertime ? '#fbbf24' : theme.accentColor }}
          >
            {formattedTime}
          </div>

          {/* Active Goal / Mindful Prompt / Overtime Badge */}
          <div className="mt-3 px-4 max-w-[220px] text-center">
            {isOvertime ? (
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold animate-pulse border border-amber-500/30">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Flow Overtime</span>
              </div>
            ) : activeTask ? (
              <div className="flex items-center justify-center gap-1.5 text-xs truncate font-medium text-white/80">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.accentColor }} />
                <span className="truncate">{activeTask.title}</span>
              </div>
            ) : (
              <p className={`text-xs italic ${theme.textMuted} font-serif line-clamp-1`}>
                {currentModeInfo.zenPrompt}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mt-8">
        {/* Reset button */}
        <button
          onClick={resetTimer}
          title="Reset timer (R)"
          className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${theme.surfaceSubtle} text-white/70 hover:text-white hover:scale-105 active:scale-95`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Action Button */}
        {isOvertime ? (
          <button
            onClick={finalizeFlow}
            title="Complete Flow Session and take a rest"
            className="px-6 py-3.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Wrap Up Flow</span>
          </button>
        ) : (
          <button
            onClick={toggleTimer}
            title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
            className={`px-8 py-3.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ${theme.buttonPrimary}`}
            style={{
              boxShadow: `0 8px 24px ${theme.glowColor}`,
            }}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Begin</span>
              </>
            )}
          </button>
        )}

        {/* Skip to Next button */}
        <button
          onClick={skipToNext}
          title="Skip session"
          className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${theme.surfaceSubtle} text-white/70 hover:text-white hover:scale-105 active:scale-95`}
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
