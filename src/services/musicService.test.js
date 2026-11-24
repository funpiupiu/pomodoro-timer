import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CHINESE_PLAYLIST, NOTE_FREQS } from '../constants/chinesePlaylist';
import { musicService } from './musicService';

describe('Chinese Playlist and Music Service', () => {
  beforeEach(() => {
    musicService.pause();
    musicService.currentIndex = 0;
    musicService.currentTime = 0;
  });

  it('should define all 6 curated Chinese Chill songs with melodies', () => {
    expect(CHINESE_PLAYLIST.length).toBe(6);
    const ids = CHINESE_PLAYLIST.map((t) => t.id);
    expect(ids).toContain('feiniao');
    expect(ids).toContain('duwo');
    expect(ids).toContain('mangzhong');
    expect(ids).toContain('qinghuaci');
    expect(ids).toContain('yanhuayileng');
    expect(ids).toContain('zuoshouzhiyue');

    CHINESE_PLAYLIST.forEach((track) => {
      expect(track.title).toBeDefined();
      expect(track.artist).toBeDefined();
      expect(track.melody.length).toBeGreaterThan(0);
      expect(track.duration).toBeGreaterThan(60);
    });
  });

  it('should define standard pentatonic and diatonic note frequencies', () => {
    expect(NOTE_FREQS['A4']).toBe(440);
    expect(NOTE_FREQS['C4']).toBeCloseTo(261.63, 1);
    expect(NOTE_FREQS['E4']).toBeCloseTo(329.63, 1);
    expect(NOTE_FREQS['G4']).toBeCloseTo(392.0, 1);
  });

  it('should switch tracks and adjust playback state correctly', () => {
    expect(musicService.currentIndex).toBe(0);
    expect(musicService.currentTrack.id).toBe('feiniao');

    musicService.playTrack(2);
    expect(musicService.currentIndex).toBe(2);
    expect(musicService.currentTrack.id).toBe('mangzhong');
    expect(musicService.isPlaying).toBe(true);

    musicService.pause();
    expect(musicService.isPlaying).toBe(false);

    // Next track
    musicService.nextTrack();
    expect(musicService.currentIndex).toBe(3);
    expect(musicService.currentTrack.id).toBe('qinghuaci');

    // Prev track
    musicService.prevTrack();
    expect(musicService.currentIndex).toBe(2);

    // Seek
    musicService.seek(45);
    expect(musicService.currentTime).toBe(45);

    // Volume
    musicService.setVolume(0.8);
    expect(musicService.volume).toBe(0.8);

    // Repeat toggle
    musicService.toggleRepeat();
    expect(musicService.repeatMode).toBe('one');

    // Shuffle toggle
    musicService.toggleShuffle();
    expect(musicService.isShuffled).toBe(true);
  });
});
