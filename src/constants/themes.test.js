import { describe, it, expect } from 'vitest';
import { THEMES, AMBIENT_SOUNDS, TIMER_MODES } from './themes';

describe('Themes and Constants configuration', () => {
  it('should include all 4 calm aesthetic themes', () => {
    expect(THEMES).toHaveProperty('matcha');
    expect(THEMES).toHaveProperty('oat');
    expect(THEMES).toHaveProperty('indigo');
    expect(THEMES).toHaveProperty('rose');

    Object.values(THEMES).forEach((theme) => {
      expect(theme.accentColor).toBeDefined();
      expect(theme.bgClass).toBeDefined();
      expect(theme.ringProgress).toBeDefined();
    });
  });

  it('should define all procedural ambient soundscapes', () => {
    const soundIds = AMBIENT_SOUNDS.map(s => s.id);
    expect(soundIds).toContain('none');
    expect(soundIds).toContain('rain');
    expect(soundIds).toContain('ocean');
    expect(soundIds).toContain('forest');
    expect(soundIds).toContain('campfire');
    expect(soundIds).toContain('white_noise');
  });

  it('should define all standard Pomodoro timer modes', () => {
    expect(TIMER_MODES).toHaveProperty('focus');
    expect(TIMER_MODES).toHaveProperty('shortBreak');
    expect(TIMER_MODES).toHaveProperty('longBreak');
  });
});
