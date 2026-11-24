import { describe, it, expect } from 'vitest';
import { SESSION_PRESETS } from './presets';

describe('Session Presets', () => {
  it('should include standard and ultradian presets', () => {
    const ids = SESSION_PRESETS.map(p => p.id);
    expect(ids).toContain('classic');
    expect(ids).toContain('deep_sprint');
    expect(ids).toContain('ultradian');
    expect(ids).toContain('quick_blitz');

    SESSION_PRESETS.forEach(p => {
      expect(p.focus).toBeGreaterThan(0);
      expect(p.shortBreak).toBeGreaterThan(0);
      expect(p.longBreak).toBeGreaterThan(0);
      expect(p.interval).toBeGreaterThan(0);
    });
  });
});
