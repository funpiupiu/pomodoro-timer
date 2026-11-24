import { describe, it, expect, beforeEach } from 'vitest';
import {
  ALL_MUSIC_TRACKS,
  BAROQUE_PLAYLIST,
  CLASSICAL_PLAYLIST,
  CHINESE_PLAYLIST,
  NOTE_FREQS,
  GENRES,
} from '../constants/musicPlaylists';
import { musicService } from './musicService';

describe('Multi-Genre Music Suite & Music Service', () => {
  beforeEach(() => {
    musicService.pause();
    musicService.setCategory('all');
    musicService.currentIndex = 0;
    musicService.currentTime = 0;
  });

  it('should define all 14 curated mindful tracks across 3 distinct genres', () => {
    expect(ALL_MUSIC_TRACKS.length).toBe(14);
    expect(BAROQUE_PLAYLIST.length).toBe(4);
    expect(CLASSICAL_PLAYLIST.length).toBe(4);
    expect(CHINESE_PLAYLIST.length).toBe(6);

    // Baroque tracks
    const baroqueIds = BAROQUE_PLAYLIST.map((t) => t.id);
    expect(baroqueIds).toContain('bach_air');
    expect(baroqueIds).toContain('pachelbel_canon');
    expect(baroqueIds).toContain('vivaldi_winter');
    expect(baroqueIds).toContain('handel_water');

    // Classical tracks
    const classicalIds = CLASSICAL_PLAYLIST.map((t) => t.id);
    expect(classicalIds).toContain('mozart_k545');
    expect(classicalIds).toContain('satie_gymnopedie');
    expect(classicalIds).toContain('chopin_nocturne');
    expect(classicalIds).toContain('beethoven_moonlight');

    // Chinese tracks
    const chineseIds = CHINESE_PLAYLIST.map((t) => t.id);
    expect(chineseIds).toContain('feiniao');
    expect(chineseIds).toContain('duwo');
    expect(chineseIds).toContain('mangzhong');
    expect(chineseIds).toContain('qinghuaci');
    expect(chineseIds).toContain('yanhuayileng');
    expect(chineseIds).toContain('zuoshouzhiyue');

    // All tracks have required properties
    ALL_MUSIC_TRACKS.forEach((track) => {
      expect(track.title).toBeDefined();
      expect(track.artist).toBeDefined();
      expect(track.melody.length).toBeGreaterThan(0);
      expect(track.duration).toBeGreaterThan(60);
      expect(track.bpm).toBeGreaterThan(40);
      expect(track.coverColor).toBeDefined();
    });
  });

  it('should verify Baroque 60 BPM tracks are properly tuned for Alpha wave superlearning', () => {
    const bach = ALL_MUSIC_TRACKS.find((t) => t.id === 'bach_air');
    const pachelbel = ALL_MUSIC_TRACKS.find((t) => t.id === 'pachelbel_canon');
    const vivaldi = ALL_MUSIC_TRACKS.find((t) => t.id === 'vivaldi_winter');

    expect(bach.bpm).toBe(60);
    expect(pachelbel.bpm).toBe(60);
    expect(vivaldi.bpm).toBe(60);
    expect(pachelbel.instrument).toBe('harpsichord');
    expect(bach.instrument).toBe('strings');
  });

  it('should define all diatonic and chromatic notes with accurate frequencies', () => {
    expect(NOTE_FREQS['A4']).toBe(440);
    expect(NOTE_FREQS['C4']).toBeCloseTo(261.63, 1);
    expect(NOTE_FREQS['C#4']).toBeCloseTo(277.18, 1);
    expect(NOTE_FREQS['Eb4']).toBeCloseTo(311.13, 1);
    expect(NOTE_FREQS['F#4']).toBeCloseTo(369.99, 1);
    expect(NOTE_FREQS['G#4']).toBeCloseTo(415.3, 1);
    expect(NOTE_FREQS['Bb4']).toBeCloseTo(466.16, 1);
  });

  it('should switch categories and filter playlists smoothly', () => {
    // Default is all
    expect(musicService.selectedCategory).toBe('all');
    expect(musicService.playlist.length).toBe(14);

    // Switch to baroque
    musicService.setCategory('baroque');
    expect(musicService.selectedCategory).toBe('baroque');
    expect(musicService.playlist.length).toBe(4);
    expect(musicService.currentTrack.category).toBe('baroque');

    // Switch to classical
    musicService.setCategory('classical');
    expect(musicService.selectedCategory).toBe('classical');
    expect(musicService.playlist.length).toBe(4);
    expect(musicService.currentTrack.category).toBe('classical');

    // Switch to chinese
    musicService.setCategory('chinese');
    expect(musicService.selectedCategory).toBe('chinese');
    expect(musicService.playlist.length).toBe(6);
    expect(musicService.currentTrack.category).toBe('chinese');
  });

  it('should switch tracks and adjust playback state correctly', () => {
    musicService.setCategory('all');
    expect(musicService.currentIndex).toBe(0);

    musicService.playTrack(1);
    expect(musicService.currentIndex).toBe(1);
    expect(musicService.currentTrack.id).toBe('pachelbel_canon');
    expect(musicService.isPlaying).toBe(true);

    musicService.pause();
    expect(musicService.isPlaying).toBe(false);

    // Next track
    musicService.nextTrack();
    expect(musicService.currentIndex).toBe(2);
    expect(musicService.currentTrack.id).toBe('vivaldi_winter');

    // Prev track
    musicService.prevTrack();
    expect(musicService.currentIndex).toBe(1);

    // Seek
    musicService.seek(60);
    expect(musicService.currentTime).toBe(60);

    // Volume
    musicService.setVolume(0.75);
    expect(musicService.volume).toBe(0.75);

    // Repeat toggle
    musicService.toggleRepeat();
    expect(musicService.repeatMode).toBe('one');

    // Shuffle toggle
    musicService.toggleShuffle();
    expect(musicService.isShuffled).toBe(true);
  });
});
