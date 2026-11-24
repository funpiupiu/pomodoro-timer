/**
 * ZenFocus Music Player Service (Chinese Chill & Lo-Fi Edition)
 * - Real-time procedural Guzheng, Guqin & Piano synthesis of authentic melodies
 * - Smooth integration with Master Audio Bus (can play simultaneously with rain/campfire)
 * - Loop, Shuffle, Seekable playback and track progress tracking
 */

import { CHINESE_PLAYLIST, NOTE_FREQS } from '../constants/chinesePlaylist';
import { audioService } from './audioService';

class MusicService {
  constructor() {
    this.playlist = CHINESE_PLAYLIST;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.55;
    this.currentTime = 0;
    this.repeatMode = 'all'; // 'all' | 'one' | 'off'
    this.isShuffled = false;

    // Synthesis playback refs
    this.playbackInterval = null;
    this.noteTimeouts = [];
    this.listeners = new Set();
    this.melodyNoteIndex = 0;
  }

  get currentTrack() {
    return this.playlist[this.currentIndex] || this.playlist[0];
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      currentIndex: this.currentIndex,
      currentTime: this.currentTime,
      duration: this.currentTrack.duration,
      volume: this.volume,
      repeatMode: this.repeatMode,
      isShuffled: this.isShuffled,
      playlist: this.playlist,
    };
    this.listeners.forEach((fn) => fn(state));
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  playTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
    }
    this.currentTime = 0;
    this.melodyNoteIndex = 0;
    this.startPlayback();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.startPlayback();
    }
  }

  pause() {
    this.isPlaying = false;
    this._stopMelodyLoop();
    this.notify();
  }

  nextTrack() {
    let nextIdx;
    if (this.isShuffled) {
      nextIdx = Math.floor(Math.random() * this.playlist.length);
    } else {
      nextIdx = (this.currentIndex + 1) % this.playlist.length;
    }
    this.playTrack(nextIdx);
  }

  prevTrack() {
    if (this.currentTime > 5) {
      this.seek(0);
      return;
    }
    const prevIdx = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(prevIdx);
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(this.currentTrack.duration, seconds));
    this.notify();
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.notify();
  }

  toggleRepeat() {
    const modes = ['all', 'one', 'off'];
    const nextIdx = (modes.indexOf(this.repeatMode) + 1) % modes.length;
    this.repeatMode = modes[nextIdx];
    this.notify();
  }

  startPlayback() {
    audioService.initContext();
    this.isPlaying = true;
    this._startMelodyLoop();
    this.notify();
  }

  _stopMelodyLoop() {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    this.noteTimeouts.forEach((id) => clearTimeout(id));
    this.noteTimeouts = [];
  }

  _startMelodyLoop() {
    this._stopMelodyLoop();

    // 1-second interval to update play progress
    this.playbackInterval = setInterval(() => {
      if (!this.isPlaying) return;

      this.currentTime += 1;
      if (this.currentTime >= this.currentTrack.duration) {
        if (this.repeatMode === 'one') {
          this.currentTime = 0;
          this.melodyNoteIndex = 0;
        } else if (this.repeatMode === 'all') {
          this.nextTrack();
          return;
        } else {
          this.pause();
          return;
        }
      }
      this.notify();
    }, 1000);

    // Start acoustic note sequencer
    this._scheduleNextMelodyPhrase();
  }

  _scheduleNextMelodyPhrase() {
    if (!this.isPlaying) return;

    const track = this.currentTrack;
    const melody = track.melody || [];
    if (melody.length === 0) return;

    const beatDurationMs = (60 / (track.bpm || 72)) * 1000;
    let accumulatedDelay = 0;

    melody.forEach((noteItem, idx) => {
      const delay = accumulatedDelay;
      const durationSec = noteItem.duration * (beatDurationMs / 1000);

      const timeoutId = setTimeout(() => {
        if (this.isPlaying) {
          this._pluckGuzhengString(noteItem.note, durationSec);
        }
      }, delay);

      this.noteTimeouts.push(timeoutId);
      accumulatedDelay += noteItem.duration * beatDurationMs;
    });

    // Schedule the next phrase when this phrase finishes
    const loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.noteTimeouts = [];
        this._scheduleNextMelodyPhrase();
      }
    }, accumulatedDelay);

    this.noteTimeouts.push(loopTimeout);
  }

  /**
   * Procedural Guzheng String Synthesis (Physical Pluck Modeling)
   */
  _pluckGuzhengString(noteName, lengthSec = 1.0) {
    if (!audioService.ctx || !this.isPlaying || this.volume <= 0) return;
    const ctx = audioService.ctx;
    const now = ctx.currentTime;
    const freq = NOTE_FREQS[noteName] || 440;

    // Harmonics for a bright wooden Guzheng / Guqin string
    const harmonics = [
      { mult: 1, gain: 0.65, decay: lengthSec * 2.2 },
      { mult: 2, gain: 0.28, decay: lengthSec * 1.5 },
      { mult: 3, gain: 0.12, decay: lengthSec * 1.0 },
      { mult: 4, gain: 0.05, decay: lengthSec * 0.7 },
    ];

    harmonics.forEach(({ mult, gain, decay }) => {
      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Subtle Guzheng vibrato / pitch bend
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.2, now);
        lfoGain.gain.setValueAtTime(1.8, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + decay);

        osc.type = 'triangle'; // Warmer string pluck timbre
        osc.frequency.setValueAtTime(freq * mult, now);

        // String Pluck Envelope
        const effectiveGain = gain * this.volume * 0.4;
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        // Warm Lowpass Filter for Lo-Fi aesthetic
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        osc.connect(filter);
        filter.connect(gainNode);

        if (audioService.masterCompressor) {
          gainNode.connect(audioService.masterCompressor);
        } else {
          gainNode.connect(ctx.destination);
        }

        osc.start(now);
        osc.stop(now + decay);
      } catch (_) {}
    });
  }
}

export const musicService = new MusicService();
export default musicService;
