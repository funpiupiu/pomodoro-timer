/**
 * ZenFocus Master Music Service (Multi-Genre Mindful Suite)
 * - Baroque 60 BPM (Superlearning & Alpha Wave)
 * - Classical Peace & Piano Suite
 * - Chinese Chill & Lo-Fi Lounge
 *
 * Real-time Web Audio API DSP synthesis for Harpsichord, Grand Piano, Strings & Guzheng.
 * 100% Offline, zero-telemetry, perfectly layered with Ambient Noise & Binaural Beats.
 */

import {
  ALL_MUSIC_TRACKS,
  NOTE_FREQS,
  GENRES,
} from '../constants/musicPlaylists';
import { audioService } from './audioService';

class MusicService {
  constructor() {
    this.allTracks = ALL_MUSIC_TRACKS;
    this.selectedCategory = 'all'; // 'all' | 'baroque' | 'classical' | 'chinese'
    this.playlist = this.allTracks;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.55;
    this.currentTime = 0;
    this.repeatMode = 'all'; // 'all' | 'one' | 'off'
    this.isShuffled = false;
    this.playbackRate = 1.0; // 0.75 | 1.0 | 1.25 | 1.5 | 2.0
    this.availableRates = [0.75, 1.0, 1.25, 1.5, 2.0];

    // Synthesis playback refs
    this.playbackInterval = null;
    this.noteTimeouts = [];
    this.listeners = new Set();
    this.melodyNoteIndex = 0;
  }

  get currentTrack() {
    return this.playlist[this.currentIndex] || this.playlist[0] || this.allTracks[0];
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
      duration: this.currentTrack ? this.currentTrack.duration : 0,
      volume: this.volume,
      repeatMode: this.repeatMode,
      isShuffled: this.isShuffled,
      playbackRate: this.playbackRate,
      availableRates: this.availableRates,
      playlist: this.playlist,
      selectedCategory: this.selectedCategory,
      allTracksCount: this.allTracks.length,
    };
    this.listeners.forEach((fn) => fn(state));
  }

  setCategory(category) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.playlist = this.allTracks;
    } else {
      this.playlist = this.allTracks.filter((t) => t.category === category);
    }

    // Keep active track index aligned if possible, or reset to 0
    const currentTrackId = this.currentTrack?.id;
    const newIdx = this.playlist.findIndex((t) => t.id === currentTrackId);
    if (newIdx !== -1) {
      this.currentIndex = newIdx;
    } else {
      this.currentIndex = 0;
      this.currentTime = 0;
      if (this.isPlaying) {
        this.startPlayback();
      }
    }
    this.notify();
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

  playTrackById(trackId) {
    const idx = this.playlist.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.playTrack(idx);
    } else {
      // Find in all tracks and switch category if necessary
      const globalTrack = this.allTracks.find((t) => t.id === trackId);
      if (globalTrack) {
        this.selectedCategory = 'all';
        this.playlist = this.allTracks;
        const targetIdx = this.playlist.findIndex((t) => t.id === trackId);
        this.playTrack(targetIdx !== -1 ? targetIdx : 0);
      }
    }
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
    if (this.playlist.length === 0) return;
    let nextIdx;
    if (this.isShuffled && this.playlist.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * this.playlist.length);
      } while (nextIdx === this.currentIndex);
    } else {
      nextIdx = (this.currentIndex + 1) % this.playlist.length;
    }
    this.playTrack(nextIdx);
  }

  prevTrack() {
    if (this.playlist.length === 0) return;
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

  setPlaybackRate(rate) {
    const parsed = parseFloat(rate);
    if (!isNaN(parsed) && parsed > 0) {
      this.playbackRate = parsed;
      if (this.isPlaying) {
        this._stopMelodyLoop();
        this._startMelodyLoop();
      }
      this.notify();
    }
  }

  cyclePlaybackRate() {
    const currentIdx = this.availableRates.indexOf(this.playbackRate);
    const nextIdx = currentIdx !== -1 ? (currentIdx + 1) % this.availableRates.length : 1;
    this.setPlaybackRate(this.availableRates[nextIdx]);
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

    // 1-second interval to update play progress adjusted by playbackRate
    this.playbackInterval = setInterval(() => {
      if (!this.isPlaying) return;

      this.currentTime = Math.min(this.currentTrack.duration, this.currentTime + this.playbackRate);
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

    const effectiveBpm = (track.bpm || 60) * this.playbackRate;
    const beatDurationMs = (60 / effectiveBpm) * 1000;
    let accumulatedDelay = 0;

    melody.forEach((noteItem) => {
      const delay = accumulatedDelay;
      const durationSec = noteItem.duration * (beatDurationMs / 1000);

      const timeoutId = setTimeout(() => {
        if (this.isPlaying) {
          this._playSynthesizedNote(noteItem.note, durationSec, track.instrument || 'guzheng');
        }
      }, delay);

      this.noteTimeouts.push(timeoutId);
      accumulatedDelay += noteItem.duration * beatDurationMs;
    });

    // Schedule the next phrase loop
    const loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.noteTimeouts = [];
        this._scheduleNextMelodyPhrase();
      }
    }, accumulatedDelay);

    this.noteTimeouts.push(loopTimeout);
  }

  /**
   * Instrument Dispatcher: Harpsichord, Grand Piano, Strings & Guzheng
   */
  _playSynthesizedNote(noteName, lengthSec = 1.0, instrument = 'guzheng') {
    if (!audioService.ctx || !this.isPlaying || this.volume <= 0) return;
    const freq = NOTE_FREQS[noteName] || 440;

    switch (instrument) {
      case 'harpsichord':
        this._playHarpsichord(freq, lengthSec);
        break;
      case 'piano':
        this._playGrandPiano(freq, lengthSec);
        break;
      case 'strings':
        this._playBaroqueStrings(freq, lengthSec);
        break;
      case 'guzheng':
      default:
        this._playGuzheng(freq, lengthSec);
        break;
    }
  }

  /**
   * 1. Baroque Harpsichord (Clavecin) Synthesis
   * Bright plucked metallic plectrum with crisp odd harmonics and sharp release
   */
  _playHarpsichord(freq, lengthSec) {
    const ctx = audioService.ctx;
    const now = ctx.currentTime;
    const decay = Math.min(lengthSec * 1.6, 2.5);

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.002, now); // Slightly detuned 2nd harmonic octave

      // Harpsichord highpass/bright lowpass
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4800, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + decay);

      // Plectrum pluck attack (fast 4ms)
      const effectiveGain = this.volume * 0.22;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(effectiveGain * 0.35, now + 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      if (audioService.masterCompressor) {
        gainNode.connect(audioService.masterCompressor);
      } else {
        gainNode.connect(ctx.destination);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + decay);
      osc2.stop(now + decay);
    } catch (_) {}
  }

  /**
   * 2. Classical Grand Piano Synthesis
   * Warm felt-hammer strike, rich fundamental + detuned pair, warm lowpass
   */
  _playGrandPiano(freq, lengthSec) {
    const ctx = audioService.ctx;
    const now = ctx.currentTime;
    const decay = Math.max(lengthSec * 2.2, 1.8);

    try {
      const oscFundamental = ctx.createOscillator();
      const oscOvertone = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscFundamental.type = 'sine';
      oscFundamental.frequency.setValueAtTime(freq, now);

      oscOvertone.type = 'triangle';
      oscOvertone.frequency.setValueAtTime(freq * 1.998, now); // Natural string chorus

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + decay);

      const effectiveGain = this.volume * 0.28;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(effectiveGain * 0.45, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      oscFundamental.connect(filter);
      oscOvertone.connect(filter);
      filter.connect(gainNode);

      if (audioService.masterCompressor) {
        gainNode.connect(audioService.masterCompressor);
      } else {
        gainNode.connect(ctx.destination);
      }

      oscFundamental.start(now);
      oscOvertone.start(now);
      oscFundamental.stop(now + decay);
      oscOvertone.stop(now + decay);
    } catch (_) {}
  }

  /**
   * 3. Baroque Chamber Strings (Violin / Cello)
   * Smooth legato bow attack, gentle 5Hz vibrato, rich sustained warmth
   */
  _playBaroqueStrings(freq, lengthSec) {
    const ctx = audioService.ctx;
    const now = ctx.currentTime;
    const decay = lengthSec * 1.8;

    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Expressive chamber vibrato
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(5.0, now);
      vibratoGain.gain.setValueAtTime(2.2, now);
      vibrato.connect(osc.frequency);
      vibrato.start(now);
      vibrato.stop(now + decay);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      // Soft bow attack (45ms)
      const effectiveGain = this.volume * 0.18;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.045);
      gainNode.gain.setValueAtTime(effectiveGain * 0.8, now + lengthSec * 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

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
  }

  /**
   * 4. Chinese Guzheng & Guqin (Wooden String Pluck)
   */
  _playGuzheng(freq, lengthSec) {
    const ctx = audioService.ctx;
    const now = ctx.currentTime;

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

        // Subtle Guzheng vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.2, now);
        lfoGain.gain.setValueAtTime(1.8, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + decay);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * mult, now);

        const effectiveGain = gain * this.volume * 0.35;
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

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
