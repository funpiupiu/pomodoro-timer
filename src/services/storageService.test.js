import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService, DEFAULT_SETTINGS, DEFAULT_STATS, TASK_TAGS } from './storageService';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('storageService v2.5 Deep Learning Suite', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should load default settings with Feynman Prompt enabled', () => {
    const settings = storageService.loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.flowMode).toBe(true);
    expect(settings.feynmanPromptEnabled).toBe(true);
  });

  it('should save and load scratchpad notes for a task', () => {
    storageService.saveScratchpad('task_123', '- Step 1: Initialize AudioContext\n- Step 2: Connect nodes');
    const loaded = storageService.loadScratchpad('task_123');
    expect(loaded).toContain('Initialize AudioContext');
  });

  it('should add, load and delete knowledge log reflections', () => {
    const log = {
      id: 'k-1',
      taskTitle: 'Master React 19 Hooks',
      tag: '#code',
      simpleExplanation: 'Hooks let components have memories.',
      keyTakeaway: 'useEffect cleanup prevents memory leaks.',
      nextObstacle: 'Explore useTransition.',
      createdAt: new Date().toISOString(),
    };

    storageService.addKnowledgeLog(log);
    const logs = storageService.loadKnowledgeLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].simpleExplanation).toBe('Hooks let components have memories.');

    // Delete
    const remaining = storageService.deleteKnowledgeLog('k-1');
    expect(remaining.find(l => l.id === 'k-1')).toBeUndefined();
  });

  it('should export formatted Markdown journal for Obsidian / Notion', () => {
    storageService.addKnowledgeLog({
      id: 'k-2',
      taskTitle: 'Binaural Beats Theory',
      tag: '#study',
      simpleExplanation: 'Two slightly different frequencies create a perceived beat in the brain.',
      keyTakeaway: 'Alpha 10Hz enhances focus.',
      nextObstacle: 'Test with pink noise masking.',
      createdAt: new Date().toISOString(),
    });

    const md = storageService.exportKnowledgeAsMarkdown();
    expect(md).toContain('# 🌿 ZenFocus Knowledge Journal');
    expect(md).toContain('Binaural Beats Theory');
    expect(md).toContain('Two slightly different frequencies');
    expect(md).toContain('### 💡 Simple Explanation');
  });

  it('should export and import backup data seamlessly in v2.5', () => {
    storageService.saveSettings({ ...DEFAULT_SETTINGS, focusDuration: 45 });
    storageService.saveScratchpad('general', 'Important note');
    storageService.addKnowledgeLog({ id: 'import-test', taskTitle: 'Test Log' });

    const exportedJson = storageService.exportData();
    expect(exportedJson).toContain('Important note');
    expect(exportedJson).toContain('Test Log');

    localStorageMock.clear();
    const success = storageService.importData(exportedJson);
    expect(success).toBe(true);

    const reloadedSettings = storageService.loadSettings();
    expect(reloadedSettings.focusDuration).toBe(45);
    const reloadedLogs = storageService.loadKnowledgeLogs();
    expect(reloadedLogs.find(l => l.id === 'import-test')).toBeDefined();
  });
});
