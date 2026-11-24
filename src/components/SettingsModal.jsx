import React from 'react';
import { X, Settings2, Sliders, Palette, Volume2, Bell, Keyboard, Zap, Sparkles, BookOpen, Music } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { SESSION_PRESETS } from '../constants/presets';
import { audioService } from '../services/audioService';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    if (settings.soundEffects) audioService.playClick();
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleSelectPreset = (preset) => {
    if (settings.soundEffects) audioService.playClick();
    onUpdateSettings({
      ...settings,
      activePreset: preset.id,
      focusDuration: preset.focus,
      shortBreakDuration: preset.shortBreak,
      longBreakDuration: preset.longBreak,
      longBreakInterval: preset.interval,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative max-h-[88vh] sm:max-h-[90vh] overflow-y-auto pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2.5 sm:hidden flex-shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" style={{ color: theme.accentColor }} />
            <h2 className="text-base font-semibold text-white">Mindful Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Session Presets */}
        <div className="my-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/70 mb-2.5 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rhythm Presets</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_PRESETS.map((p) => {
              const isSelected = settings.focusDuration === p.focus && settings.shortBreakDuration === p.shortBreak;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white/30 bg-white/15 shadow-sm'
                      : 'border-white/5 hover:border-white/15 bg-white/5'
                  }`}
                >
                  <div className="text-xs font-medium text-white">{p.name}</div>
                  <div className="text-[10px] text-white/40">{p.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Timer Durations */}
        <div className="my-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/70 mb-3 tracking-wider">
            <Sliders className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            <span>Custom Durations (Minutes)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <label className="text-[11px] text-white/60 block mb-1">Focus</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focusDuration}
                onChange={(e) => handleChange('focusDuration', Math.max(1, parseInt(e.target.value) || 25))}
                className="w-full text-lg font-semibold bg-transparent text-white focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <label className="text-[11px] text-white/60 block mb-1">Short Break</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full text-lg font-semibold bg-transparent text-white focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <label className="text-[11px] text-white/60 block mb-1">Long Break</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', Math.max(1, parseInt(e.target.value) || 15))}
                className="w-full text-lg font-semibold bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Theme Selection */}
        <div className="my-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/70 mb-3 tracking-wider">
            <Palette className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            <span>Zen Aesthetic Theme</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(THEMES).map((thm) => {
              const isSelected = settings.theme === thm.id;
              return (
                <button
                  key={thm.id}
                  onClick={() => handleChange('theme', thm.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-white/30 bg-white/15 shadow-md'
                      : 'border-white/5 hover:border-white/15 bg-white/5'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                    style={{ backgroundColor: thm.accentColor }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">{thm.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{thm.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Automation & Deep Learning Toggles */}
        <div className="my-5 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Post-Session Feynman Prompt</span>
              </div>
              <div className="text-[11px] text-white/50">Show 60s learning synthesis dialog after each focus session</div>
            </div>
            <input
              type="checkbox"
              checked={settings.feynmanPromptEnabled ?? true}
              onChange={(e) => handleChange('feynmanPromptEnabled', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Flow Mode (Overtime Counting)</span>
              </div>
              <div className="text-[11px] text-white/50">Allow timer to keep counting positive when session ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.flowMode}
              onChange={(e) => handleChange('flowMode', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Auto-start Breaks</div>
              <div className="text-[11px] text-white/50">Automatically begin rest when focus ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Auto-start Pomodoros</div>
              <div className="text-[11px] text-white/50">Automatically begin next focus when break ends</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartPomodoros}
              onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Tibetan Bell & Chimes</div>
              <div className="text-[11px] text-white/50">Synthesized 432Hz singing bowl sound</div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => handleChange('soundEffects', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Browser Notifications</div>
              <div className="text-[11px] text-white/50">Alert when tab is minimized or hidden</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 5. Shortcuts Guide */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/70 mb-2.5 tracking-wider">
            <Keyboard className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            <span>Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span>Start / Pause</span>
              <kbd className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-[11px]">Space</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span>Chinese Music Player</span>
              <kbd className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-[11px]">M</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span>Knowledge Log</span>
              <kbd className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-[11px]">K</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span>Breathing Guide</span>
              <kbd className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-[11px]">B</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <span>Zen Fullscreen</span>
              <kbd className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-[11px]">F</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
