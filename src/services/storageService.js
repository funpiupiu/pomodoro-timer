/**
 * ZenFocus 2.0 Storage & State Persistence Service
 * Local-First architecture: 100% private and persistent in browser LocalStorage
 */

const STORAGE_KEYS = {
  SETTINGS: 'zen_pomodoro_settings',
  TASKS: 'zen_pomodoro_tasks',
  STATS: 'zen_pomodoro_stats',
  ACTIVE_TASK_ID: 'zen_pomodoro_active_task_id',
  KNOWLEDGE_LOGS: 'zen_pomodoro_knowledge_logs',
  SCRATCHPAD: 'zen_pomodoro_scratchpad',
};

export const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  flowMode: true,
  activePreset: 'classic',
  feynmanPromptEnabled: true,
  theme: 'matcha',
  ambientSound: 'none',
  ambientVolume: 0.45,
  mixerTracks: {
    rain: 0,
    ocean: 0,
    forest: 0,
    campfire: 0,
    white_noise: 0,
  },
  binauralMode: 'none',
  binauralVolume: 0.3,
  soundEffects: true,
  notifications: false,
};

export const DEFAULT_STATS = {
  totalFocusMinutes: 0,
  totalSessionsCompleted: 0,
  dailyHistory: {},
  tagBreakdown: {},
  currentStreak: 0,
  lastActiveDate: null,
};

export const TASK_TAGS = [
  { id: '#code', label: '#Code', color: '#818cf8' },
  { id: '#study', label: '#Study', color: '#34d399' },
  { id: '#write', label: '#Write', color: '#fbbf24' },
  { id: '#design', label: '#Design', color: '#f472b6' },
  { id: '#life', label: '#Life', color: '#38bdf8' },
];

export const storageService = {
  // Settings
  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.warn('Failed to load settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  },

  // Tasks
  loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load tasks', e);
    }
    return [
      {
        id: '1',
        title: 'Deep Work: Read research paper or write code',
        tag: '#code',
        estimatedPomodoros: 3,
        completedPomodoros: 1,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Mindful review & clean workspace desk',
        tag: '#life',
        estimatedPomodoros: 1,
        completedPomodoros: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks', e);
    }
  },

  // Active Task
  loadActiveTaskId() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK_ID) || '1';
    } catch (e) {
      return null;
    }
  },

  saveActiveTaskId(id) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK_ID);
      }
    } catch (e) {}
  },

  // Scratchpad
  loadScratchpads() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCRATCHPAD);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  loadScratchpad(taskId = 'general') {
    const pads = this.loadScratchpads();
    return pads[taskId] || '';
  },

  saveScratchpad(taskId = 'general', content) {
    try {
      const pads = this.loadScratchpads();
      pads[taskId] = content;
      localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, JSON.stringify(pads));
    } catch (e) {}
  },

  // Knowledge Logs (Feynman Reflections)
  loadKnowledgeLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load knowledge logs', e);
    }
    return [
      {
        id: 'demo-log-1',
        taskTitle: 'Master Web Audio DSP filters',
        tag: '#code',
        simpleExplanation: 'Digital filters are like kitchen strainers for sound frequencies: lowpass lets deep bass through, highpass lets crisp highs pass.',
        keyTakeaway: 'Using BiquadFilterNode with LFO modulation creates organic ocean wave motion effortlessly without audio files.',
        nextObstacle: 'Explore stereo panning phase shifts for 3D spatial audio.',
        createdAt: new Date().toISOString(),
      },
    ];
  },

  saveKnowledgeLogs(logs) {
    try {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save knowledge logs', e);
    }
  },

  addKnowledgeLog(entry) {
    const logs = this.loadKnowledgeLogs();
    const updated = [entry, ...logs];
    this.saveKnowledgeLogs(updated);
    return updated;
  },

  deleteKnowledgeLog(id) {
    const logs = this.loadKnowledgeLogs();
    const updated = logs.filter(l => l.id !== id);
    this.saveKnowledgeLogs(updated);
    return updated;
  },

  // Export Knowledge Journal to Markdown
  exportKnowledgeAsMarkdown() {
    const logs = this.loadKnowledgeLogs();
    const today = new Date().toISOString().split('T')[0];

    let md = `# 🌿 ZenFocus Knowledge Journal\n\n`;
    md += `*Exported on: ${today} · Mindful Deep Work & Feynman Synthesis*\n\n`;
    md += `---\n\n`;

    if (logs.length === 0) {
      md += `*No reflection entries recorded yet.*\n`;
      return md;
    }

    logs.forEach((log) => {
      const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString() : today;
      md += `## 📌 ${log.taskTitle || 'Untitled Focus Session'} \`${log.tag || '#general'}\`\n`;
      md += `*Captured on ${dateStr}*\n\n`;

      if (log.simpleExplanation) {
        md += `### 💡 Simple Explanation (For a Beginner)\n${log.simpleExplanation}\n\n`;
      }
      if (log.keyTakeaway) {
        md += `### 🔑 Key Takeaway & Breakthrough\n${log.keyTakeaway}\n\n`;
      }
      if (log.nextObstacle) {
        md += `### 🚧 Next Obstacle to Solve\n${log.nextObstacle}\n\n`;
      }
      md += `---\n\n`;
    });

    return md;
  },

  // Statistics
  loadStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch (e) {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {}
  },

  recordCompletedSession(durationMinutes, tag = '#code') {
    const stats = this.loadStats();
    const today = new Date().toISOString().split('T')[0];
    
    stats.totalFocusMinutes = (stats.totalFocusMinutes || 0) + durationMinutes;
    stats.totalSessionsCompleted = (stats.totalSessionsCompleted || 0) + 1;

    if (!stats.dailyHistory) stats.dailyHistory = {};
    if (!stats.dailyHistory[today]) {
      stats.dailyHistory[today] = { minutes: 0, sessions: 0, tags: {} };
    }
    stats.dailyHistory[today].minutes += durationMinutes;
    stats.dailyHistory[today].sessions += 1;
    if (!stats.dailyHistory[today].tags) stats.dailyHistory[today].tags = {};
    stats.dailyHistory[today].tags[tag] = (stats.dailyHistory[today].tags[tag] || 0) + durationMinutes;

    if (!stats.tagBreakdown) stats.tagBreakdown = {};
    stats.tagBreakdown[tag] = (stats.tagBreakdown[tag] || 0) + durationMinutes;

    if (!stats.lastActiveDate) {
      stats.currentStreak = 1;
    } else if (stats.lastActiveDate !== today) {
      const lastDate = new Date(stats.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.currentStreak = (stats.currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
    }
    stats.lastActiveDate = today;

    this.saveStats(stats);
    return stats;
  },

  exportData() {
    return JSON.stringify({
      version: '2.5',
      exportedAt: new Date().toISOString(),
      settings: this.loadSettings(),
      tasks: this.loadTasks(),
      scratchpads: this.loadScratchpads(),
      knowledgeLogs: this.loadKnowledgeLogs(),
      stats: this.loadStats(),
    }, null, 2);
  },

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.tasks) this.saveTasks(parsed.tasks);
      if (parsed.scratchpads) {
        localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, JSON.stringify(parsed.scratchpads));
      }
      if (parsed.knowledgeLogs) {
        this.saveKnowledgeLogs(parsed.knowledgeLogs);
      }
      if (parsed.stats) this.saveStats(parsed.stats);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  },
};
