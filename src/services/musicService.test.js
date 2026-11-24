import { describe, it, expect, beforeEach } from 'vitest';
import {
  ALL_MUSIC_TRACKS,
  BAROQUE_PLAYLIST,
  CLASSICAL_PLAYLIST,
  CHINESE_PLAYLIST,
  NOTE_FREQS,
} from '../constants/musicPlaylists';
import { musicService } from './musicService';

describe('Multi-Genre Music Suite & Music Service', () => {
  beforeEach(() => {
    musicService.pause();
    musicService.setCategory('all');
    musicService.setPlaybackRate(1.0);
    musicService.currentIndex = 0;
    musicService.currentTime = 0;
  });

  it('should define all 24 curated mindful tracks across 3 distinct genres', () => {
    expect(ALL_MUSIC_TRACKS.length).toBe(24);
    expect(CHINESE_PLAYLIST.length).toBe(16);
    expect(BAROQUE_PLAYLIST.length).toBe(4);
    expect(CLASSICAL_PLAYLIST.length).toBe(4);

    // 10 New Hot Chinese tracks
    const chineseIds = CHINESE_PLAYLIST.map((t) => t.id);
    const expectedChineseIds = [
      'baiyueguang',
      'nidedaan',
      'cuoweishikong',
      'xingchendahai',
      'hongsegaogenxie',
      'dayu',
      'gaobaiqiqiu',
      'xiaozhang',
      'tonghua',
      'cijiumenhuiyi',
      'feiniao',
      'duwo',
      'mangzhong',
      'qinghuaci',
      'yanhuayileng',
      'zuoshouzhiyue',
    ];
    expectedChineseIds.forEach((id) => expect(chineseIds).toContain(id));

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

  it('should provide synchronized 3-layer lyrics (Hanzi, Pinyin, Vietnamese) for all 16 Chinese tracks', () => {
    CHINESE_PLAYLIST.forEach((track) => {
      expect(Array.isArray(track.lyrics)).toBe(true);
      expect(track.lyrics.length).toBeGreaterThanOrEqual(6);
      track.lyrics.forEach((line) => {
        expect(typeof line.time).toBe('number');
        expect(line.time).toBeGreaterThanOrEqual(0);
        expect(line.zh.length).toBeGreaterThan(0);
        expect(line.pinyin.length).toBeGreaterThan(0);
        expect(line.vi.length).toBeGreaterThan(0);
      });
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
    expect(musicService.selectedCategory).toBe('all');
    expect(musicService.playlist.length).toBe(24);

    musicService.setCategory('baroque');
    expect(musicService.selectedCategory).toBe('baroque');
    expect(musicService.playlist.length).toBe(4);
    expect(musicService.currentTrack.category).toBe('baroque');

    musicService.setCategory('classical');
    expect(musicService.selectedCategory).toBe('classical');
    expect(musicService.playlist.length).toBe(4);
    expect(musicService.currentTrack.category).toBe('classical');

    musicService.setCategory('chinese');
    expect(musicService.selectedCategory).toBe('chinese');
    expect(musicService.playlist.length).toBe(16);
    expect(musicService.currentTrack.category).toBe('chinese');
  });

  it('should switch tracks and adjust playback state correctly', () => {
    musicService.setCategory('all');
    expect(musicService.currentIndex).toBe(0);

    musicService.playTrack(1);
    expect(musicService.currentIndex).toBe(1);
    expect(musicService.currentTrack.id).toBe('nidedaan');
    expect(musicService.isPlaying).toBe(true);

    musicService.pause();
    expect(musicService.isPlaying).toBe(false);

    musicService.nextTrack();
    expect(musicService.currentIndex).toBe(2);
    expect(musicService.currentTrack.id).toBe('cuoweishikong');

    musicService.prevTrack();
    expect(musicService.currentIndex).toBe(1);

    musicService.seek(60);
    expect(musicService.currentTime).toBe(60);

    musicService.setVolume(0.75);
    expect(musicService.volume).toBe(0.75);

    musicService.toggleRepeat();
    expect(musicService.repeatMode).toBe('one');

    musicService.toggleShuffle();
    expect(musicService.isShuffled).toBe(true);
  });

  it('should support dynamic playback rate adjustment and cycling', () => {
    expect(musicService.playbackRate).toBe(1.0);
    expect(musicService.availableRates).toEqual([0.75, 1.0, 1.25, 1.5, 2.0]);

    musicService.setPlaybackRate(1.5);
    expect(musicService.playbackRate).toBe(1.5);

    musicService.setPlaybackRate(0.75);
    expect(musicService.playbackRate).toBe(0.75);

    musicService.cyclePlaybackRate();
    expect(musicService.playbackRate).toBe(1.0);

    musicService.cyclePlaybackRate();
    expect(musicService.playbackRate).toBe(1.25);

    let receivedRate = null;
    const unsub = musicService.subscribe((state) => {
      receivedRate = state.playbackRate;
    });

    musicService.setPlaybackRate(2.0);
    expect(receivedRate).toBe(2.0);
    unsub();
  });
});
