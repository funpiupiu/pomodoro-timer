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
  Disc3,
  Music2,
} from 'lucide-react';
import { THEMES } from './constants/themes';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { musicService } from './services/musicService';
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
import ZenMusicPlayerModal from './components/ZenMusicPlayerModal';

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

  // Modal open states
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isFeynmanOpen, setIsFeynmanOpen] = useState(false);
  const [isKnowledgeLogOpen, setIsKnowledgeLogOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Music state subscription
  const [musicState, setMusicState] = useState(() => ({
    isPlaying: musicService.isPlaying,
    currentTrack: musicService.currentTrack,
  }));

  useEffect(() => {
    return musicService.subscribe((state) => {
      setMusicState({
        isPlaying: state.isPlaying,
        currentTrack: state.currentTrack,
      });
    });
  }, []);

  const currentTheme = THEMES[settings.theme] || THEMES.matcha;
  const activeTask = tasks.find((t) => t.id === activeTaskId && !t.isCompleted) || null;

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    if (newSettings.ambientVolume !== undefined) {
      audioService.setMasterVolume(newSettings.ambientVolume);
    }
  };

  const handleFocusComplete = useCallback(
    (minutes) => {
      const taskTag = activeTask?.tag || '#code';

      if (activeTaskId) {
        setTasks((prevTasks) => {
          const updated = prevTasks.map((t) => {
            if (t.id === activeTaskId) {
              return { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 };
            }
            return t;
          });
          storageService.saveTasks(updated);
          return updated;
        });
      }

      setStats(storageService.loadStats());

      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 },
          colors: [currentTheme.accentColor, '#ffffff', '#e2ece6', '#fbbf24'],
          disableForReducedMotion: true,
        });
      } catch (_) {}

      if (settings.feynmanPromptEnabled !== false) {
        setTimeout(() => {
          setIsFeynmanOpen(true);
        }, 700);
      }
    },
    [activeTaskId, activeTask, currentTheme.accentColor, settings.feynmanPromptEnabled]
  );

  const timer = usePomodoroTimer(settings, handleFocusComplete);

  const rotateQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ZEN_QUOTES.length);
  };

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
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    storageService.saveTasks(updated);
    if (activeTaskId === id) {
      const remaining = updated.find((t) => !t.isCompleted);
      const nextId = remaining ? remaining.id : null;
      setActiveTaskId(nextId);
      storageService.saveActiveTaskId(nextId);
    }
  };

  const handleClearCompleted = () => {
    const updated = tasks.filter((t) => !t.isCompleted);
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleSetActiveTask = (id) => {
    setActiveTaskId(id);
    storageService.saveActiveTaskId(id);
  };

  // Global Keyboard shortcuts
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
        setIsZenMode((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBreathingOpen((prev) => !prev);
      } else if (e.key === 'k' || e.key === 'K') {
        setIsKnowledgeLogOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMusicOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsAnalyticsOpen(false);
        setIsSettingsOpen(false);
        setIsMixerOpen(false);
        setIsBreathingOpen(false);
        setIsFeynmanOpen(false);
        setIsKnowledgeLogOpen(false);
        setIsMusicOpen(false);
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentTheme.bgClass} ${currentTheme.textPrimary} transition-all duration-700 flex flex-col justify-between p-3 sm:p-6 pb-safe pt-safe relative overflow-x-hidden`}
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
      {/* TOP HEADER (Hidden in Zen Mode) */}
      {!isZenMode && (
        <header className="relative z-10 w-full max-w-5xl mx-auto flex flex-col pb-3 sm:pb-4 border-b border-white/5 gap-2">
          {/* Main Top Row */}
          <div className="flex items-center justify-between w-full gap-2">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0"
                style={{ backgroundColor: currentTheme.accentColor }}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white m-0 p-0 truncate">
                    ZenFocus
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-white/70 whitespace-nowrap">
                    {currentTheme.name}
                  </span>
                  {timer.isOvertime && (
                    <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold animate-pulse border border-amber-500/30 whitespace-nowrap">
                      Flow
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-white/50 hidden sm:block">
                  Aesthetic Pomodoro & Mindful Flow OS
                </p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Desktop Ambient Sound Dock */}
              <div className="hidden md:block">
                <AmbientSoundBar
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onOpenMixer={() => setIsMixerOpen(true)}
                  theme={currentTheme}
                />
              </div>

              {/* Music Lounge Vinyl Button */}
              <button
                onClick={() => setIsMusicOpen(true)}
                title={
                  musicState.isPlaying
                    ? `Playing: ${musicState.currentTrack.title} (Press M)`
                    : 'Mindful Music Lounge (Press M)'
                }
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-full border transition-all cursor-pointer shadow-sm ${
                  musicState.isPlaying
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-amber-400/10'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70 hover:text-white'
                }`}
              >
                <Disc3
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${musicState.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                  style={{ color: musicState.isPlaying ? '#fbbf24' : 'currentColor' }}
                />
                <span className="text-[11px] sm:text-xs font-medium">
                  {musicState.isPlaying ? 'Music' : 'Lounge'}
                </span>
              </button>

              {/* Desktop Knowledge Log button */}
              <button
                onClick={() => setIsKnowledgeLogOpen(true)}
                title="Knowledge Journal (Press K)"
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/80 hover:text-white cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-mono">{knowledgeLogs.length}</span>
              </button>

              {/* Desktop Mindful Breathing Guide button */}
              <button
                onClick={() => setIsBreathingOpen(true)}
                title="Box Breathing Guide (Press B)"
                className="hidden md:flex p-2 min-w-[36px] min-h-[36px] items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
              >
                <Wind className="w-4 h-4" />
              </button>

              {/* Streak & Analytics button (Desktop) */}
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                title="Focus Insights & Heatmap"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-mono text-xs">{stats.currentStreak || 0}d</span>
              </button>

              {/* Settings button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Settings & Presets"
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              {/* Zen Fullscreen Toggle */}
              <button
                onClick={() => setIsZenMode(true)}
                title="Zen Mode (Press F)"
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/70 hover:text-white cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Mobile Quick Toolbar (Phones & Small Tablets) */}
          <div className="grid grid-cols-4 md:hidden gap-1.5 pt-1">
            <button
              onClick={() => setIsMixerOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/85 whitespace-nowrap cursor-pointer transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Âm thanh</span>
            </button>
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/85 whitespace-nowrap cursor-pointer transition-all"
            >
              <Wind className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Hơi thở</span>
            </button>
            <button
              onClick={() => setIsKnowledgeLogOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/85 whitespace-nowrap cursor-pointer transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <span>Nhật ký ({knowledgeLogs.length})</span>
            </button>
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/85 whitespace-nowrap cursor-pointer transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>Thống kê ({stats.currentStreak || 0}d)</span>
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

      {/* MAIN WORKSPACE CONTENT (1-Column on Mobile/Tablet, 2-Column Split on Desktop >= 1024px) */}
      <main
        className={`relative z-10 w-full mx-auto flex-1 my-2 sm:my-4 ${
          isZenMode
            ? 'max-w-4xl flex flex-col items-center justify-center'
            : 'max-w-5xl flex flex-col items-center justify-center lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center'
        }`}
      >
        {/* Left Column: Core Breathing Timer */}
        <div className={isZenMode ? 'w-full flex justify-center' : 'w-full lg:col-span-7 flex flex-col items-center justify-center'}>
          <BreathingTimerRing
            timer={timer}
            theme={currentTheme}
            settings={settings}
            activeTask={activeTask}
          />
        </div>

        {/* Right Column: Tasks & Mindful Scratchpad Dual Tab Card */}
        {!isZenMode && (
          <div className="w-full lg:col-span-5 mt-5 lg:mt-0">
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
        <footer className="relative z-10 w-full max-w-5xl mx-auto pt-3 sm:pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
          <div
            onClick={rotateQuote}
            className="italic font-serif cursor-pointer hover:text-white/70 transition-colors text-center sm:text-left select-none text-[11px] sm:text-xs"
            title="Click for another mindful thought"
          >
            "{ZEN_QUOTES[quoteIndex]}"
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Space</kbd> to Begin
            </span>
            <span className="hidden sm:inline">•</span>
            <span>100% Offline & Private</span>
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
        onSaved={() => {
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

      <ZenMusicPlayerModal
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        theme={currentTheme}
      />
    </div>
  );
}
