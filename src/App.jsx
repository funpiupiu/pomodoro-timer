import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BarChart3,
  Settings2,
  Maximize2,
  Minimize2,
  Flame,
  Volume2,
  Wind,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { THEMES } from './constants/themes';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import BreathingTimerRing from './components/BreathingTimerRing';
import ZenTaskAndNotesCard from './components/ZenTaskAndNotesCard';
import FocusAnalyticsModal from './components/FocusAnalyticsModal';
import SettingsModal from './components/SettingsModal';
import AmbientSoundBar from './components/AmbientSoundBar';
import MultiTrackSoundMixerModal from './components/MultiTrackSoundMixerModal';
import MindfulBreathingModal from './components/MindfulBreathingModal';
import FeynmanReflectionModal from './components/FeynmanReflectionModal';
import KnowledgeLogModal from './components/KnowledgeLogModal';

const ZEN_QUOTES = [
  "Do one thing at a time, and do it with your whole heart.",
  "Smile, breathe and go slowly.",
  "Simplicity is the ultimate sophistication.",
  "Quiet the mind, and the soul will speak.",
  "Within you there is a stillness and a sanctuary.",
  "Wherever you are, be there totally.",
];

export default function App() {
  const [settings, setSettings] = useState(() => storageService.loadSettings());
  const [tasks, setTasks] = useState(() => storageService.loadTasks());
  const [activeTaskId, setActiveTaskId] = useState(() => storageService.loadActiveTaskId());
  const [stats, setStats] = useState(() => storageService.loadStats());
  const [knowledgeLogs, setKnowledgeLogs] = useState(() => storageService.loadKnowledgeLogs());

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isFeynmanOpen, setIsFeynmanOpen] = useState(false);
  const [isKnowledgeLogOpen, setIsKnowledgeLogOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const currentTheme = THEMES[settings.theme] || THEMES.matcha;
  const activeTask = tasks.find(t => t.id === activeTaskId && !t.isCompleted) || null;

  // Persist settings
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    if (newSettings.ambientVolume !== undefined) {
      audioService.setMasterVolume(newSettings.ambientVolume);
    }
  };

  // Focus session completed callback
  const handleFocusComplete = useCallback((minutes) => {
    const taskTag = activeTask?.tag || '#code';

    // Increment active task pomodoro
    if (activeTaskId) {
      setTasks(prevTasks => {
        const updated = prevTasks.map(t => {
          if (t.id === activeTaskId) {
            return { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 };
          }
          return t;
        });
        storageService.saveTasks(updated);
        return updated;
      });
    }

    // Refresh stats
    setStats(storageService.loadStats());

    // Gentle pastel celebration
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
        colors: [currentTheme.accentColor, '#ffffff', '#e2ece6', '#fbbf24'],
        disableForReducedMotion: true,
      });
    } catch (_) {}

    // Automatically trigger Feynman Reflection if enabled
    if (settings.feynmanPromptEnabled !== false) {
      setTimeout(() => {
        setIsFeynmanOpen(true);
      }, 700);
    }
  }, [activeTaskId, activeTask, currentTheme.accentColor, settings.feynmanPromptEnabled]);

  // Hook up timer
  const timer = usePomodoroTimer(settings, handleFocusComplete);

  // Rotate quotes
  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ZEN_QUOTES.length);
  };

  // Task actions
  const handleAddTask = (newTask) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
      storageService.saveActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    storageService.saveTasks(updated);
    if (activeTaskId === id) {
      const remaining = updated.find(t => !t.isCompleted);
      const nextId = remaining ? remaining.id : null;
      setActiveTaskId(nextId);
      storageService.saveActiveTaskId(nextId);
    }
  };

  const handleClearCompleted = () => {
    const updated = tasks.filter(t => !t.isCompleted);
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleSetActiveTask = (id) => {
    setActiveTaskId(id);
    storageService.saveActiveTaskId(id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        timer.toggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        timer.resetTimer();
      } else if (e.key === 's' || e.key === 'S') {
        timer.skipToNext();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsZenMode(prev => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBreathingOpen(prev => !prev);
      } else if (e.key === 'k' || e.key === 'K') {
        setIsKnowledgeLogOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsAnalyticsOpen(false);
        setIsSettingsOpen(false);
        setIsMixerOpen(false);
        setIsBreathingOpen(false);
        setIsFeynmanOpen(false);
        setIsKnowledgeLogOpen(false);
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentTheme.bgClass} ${currentTheme.textPrimary} transition-all duration-700 flex flex-col justify-between p-4 sm:p-6 relative overflow-x-hidden`}
    >
      {/* Background Ambient Glow Circles */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-20 transition-all duration-1000"
        style={{ backgroundColor: currentTheme.accentColor }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none filter blur-3xl opacity-15 transition-all duration-1000"
        style={{ backgroundColor: currentTheme.glowColor }}
      />

      {/* TOP HEADER (Hidden in Zen Mode) */}
      {!isZenMode && (
        <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-white/5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: currentTheme.accentColor }}
            >
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-white m-0 p-0">
                  ZenFocus
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-white/70">
                  {currentTheme.name}
                </span>
                {timer.isOvertime && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold animate-pulse border border-amber-500/30">
                    Flow Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Aesthetic Pomodoro & Mindful Flow OS
              </p>
            </div>
          </div>

          {/* Action Dock */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Ambient Sound Dock */}
            <div className="hidden md:block">
              <AmbientSoundBar
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onOpenMixer={() => setIsMixerOpen(true)}
                theme={currentTheme}
              />
            </div>

            {/* Knowledge Log button */}
            <button
              onClick={() => setIsKnowledgeLogOpen(true)}
              title="Knowledge Journal (Press K)"
              className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/80 hover:text-white cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-mono hidden sm:inline">{knowledgeLogs.length}</span>
            </button>

            {/* Mindful Breathing Guide button */}
            <button
              onClick={() => setIsBreathingOpen(true)}
              title="Box Breathing Guide (Press B)"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
            >
              <Wind className="w-4 h-4" />
            </button>

            {/* Streak & Analytics button */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              title="Focus Insights & Heatmap"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-mono">{stats.currentStreak || 0}d</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Settings & Presets"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Zen Fullscreen Toggle */}
            <button
              onClick={() => setIsZenMode(true)}
              title="Zen Mode (Press F)"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* ZEN MODE EXIT BUTTON */}
      {isZenMode && (
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 backdrop-blur-md text-xs text-white/70 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Exit Zen Mode (Esc or F)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen</span>
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <main className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center my-4">
        {/* Core Breathing Timer */}
        <BreathingTimerRing
          timer={timer}
          theme={currentTheme}
          settings={settings}
          activeTask={activeTask}
        />

        {/* Ambient Bar in Mobile View */}
        {!isZenMode && (
          <div className="md:hidden mt-4">
            <AmbientSoundBar
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onOpenMixer={() => setIsMixerOpen(true)}
              theme={currentTheme}
            />
          </div>
        )}

        {/* Tasks & Mindful Scratchpad Dual Tab Card (Hidden in Zen Mode) */}
        {!isZenMode && (
          <div className="w-full mt-6">
            <ZenTaskAndNotesCard
              tasks={tasks}
              activeTaskId={activeTaskId}
              onSetActiveTask={handleSetActiveTask}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompleted}
              onTriggerFeynman={() => setIsFeynmanOpen(true)}
              theme={currentTheme}
              settings={settings}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      {!isZenMode && (
        <footer className="relative z-10 w-full max-w-4xl mx-auto pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
          <div
            onClick={rotateQuote}
            className="italic font-serif cursor-pointer hover:text-white/70 transition-colors text-center sm:text-left select-none"
            title="Click for another mindful thought"
          >
            "{ZEN_QUOTES[quoteIndex]}"
          </div>

          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Space</kbd> to Begin</span>
            <span>•</span>
            <span className="text-[11px]">100% Offline & Private</span>
          </div>
        </footer>
      )}

      {/* MODALS */}
      <FocusAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        stats={stats}
        theme={currentTheme}
        onDataImported={() => {
          setSettings(storageService.loadSettings());
          setTasks(storageService.loadTasks());
          setStats(storageService.loadStats());
          setKnowledgeLogs(storageService.loadKnowledgeLogs());
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={currentTheme}
      />

      <MultiTrackSoundMixerModal
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={currentTheme}
      />

      <MindfulBreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        theme={currentTheme}
      />

      <FeynmanReflectionModal
        isOpen={isFeynmanOpen}
        onClose={() => setIsFeynmanOpen(false)}
        activeTask={activeTask}
        onSaved={(newLog) => {
          setKnowledgeLogs(storageService.loadKnowledgeLogs());
        }}
        theme={currentTheme}
      />

      <KnowledgeLogModal
        isOpen={isKnowledgeLogOpen}
        onClose={() => setIsKnowledgeLogOpen(false)}
        knowledgeLogs={knowledgeLogs}
        onUpdateLogs={(updated) => setKnowledgeLogs(updated)}
        theme={currentTheme}
      />
    </div>
  );
}
