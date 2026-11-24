/**
 * ZenFocus 2.0 Procedural Web Audio Engine
 * - Multi-Track Sound Mixer (mix rain, ocean, campfire, forest, brown noise)
 * - Scientific Binaural Beats Synthesizer (Alpha 10Hz, Beta 18Hz, Theta 6Hz)
 * - Master Dynamics Compressor to prevent clipping/distortion
 * - Tibetan Singing Bowl Chime (432Hz harmonic series)
 * - 100% offline, pure Web Audio DSP
 */

export const BINAURAL_MODES = {
  none: { id: 'none', label: 'Off', desc: 'No brainwave pulse' },
  alpha: { id: 'alpha', label: 'Alpha (10 Hz)', freqDiff: 10, desc: 'Flow state, creative reading & writing' },
  beta: { id: 'beta', label: 'Beta (18 Hz)', freqDiff: 18, desc: 'High alertness, complex coding & logic' },
  theta: { id: 'theta', label: 'Theta (6 Hz)', freqDiff: 6, desc: 'Deep calm, meditation & restorative breaks' },
};

export const SOUND_PRESETS = [
  {
    id: 'kyoto_rain',
    name: 'Kyoto Rain',
    tracks: { rain: 0.65, forest: 0.35, campfire: 0, ocean: 0, white_noise: 0 },
    binaural: 'alpha',
    binauralVol: 0.3,
  },
  {
    id: 'nordic_cabin',
    name: 'Nordic Cabin',
    tracks: { campfire: 0.7, rain: 0.4, forest: 0.2, ocean: 0, white_noise: 0 },
    binaural: 'none',
    binauralVol: 0,
  },
  {
    id: 'deep_coding',
    name: 'Deep Code',
    tracks: { white_noise: 0.55, rain: 0.25, campfire: 0, ocean: 0, forest: 0 },
    binaural: 'beta',
    binauralVol: 0.35,
  },
  {
    id: 'zen_temple',
    name: 'Zen Sanctuary',
    tracks: { forest: 0.6, ocean: 0.35, rain: 0, campfire: 0, white_noise: 0 },
    binaural: 'theta',
    binauralVol: 0.3,
  },
];

class AudioService {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.masterCompressor = null;
    this.masterVolume = 0.5;

    // Track Nodes: map of trackId -> { source, gainNode, filter, intervalId }
    this.activeTracks = {};
    // Active track volume levels: { rain: 0.4, campfire: 0 }
    this.trackVolumes = {
      rain: 0,
      ocean: 0,
      forest: 0,
      campfire: 0,
      white_noise: 0,
    };

    // Binaural nodes
    this.binauralNodes = null; // { oscL, oscR, panL, panR, gainNode }
    this.currentBinauralMode = 'none';
    this.binauralVolume = 0.3;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AudioCtx) {
        return false;
      }
      this.ctx = new AudioCtx();

      // Master Compressor prevents distortion when multiple audio streams play together
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      this.masterCompressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  // --- Noise Buffer Helpers ---
  createWhiteNoiseBuffer(seconds = 3) {
    if (!this.initContext()) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  createPinkNoiseBuffer(seconds = 4) {
    if (!this.initContext()) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  createBrownNoiseBuffer(seconds = 4) {
    if (!this.initContext()) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  // --- Chimes & Clicks ---
  playZenBell() {
    if (!this.initContext()) return;
    const now = this.ctx.currentTime;
    const harmonics = [
      { freq: 432, gain: 0.7, decay: 4.5 },
      { freq: 864, gain: 0.35, decay: 3.8 },
      { freq: 1296, gain: 0.18, decay: 2.6 },
      { freq: 2160, gain: 0.08, decay: 1.5 },
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(2.5, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + decay);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(gain * 0.8, now + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(this.masterCompressor);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  playClick() {
    if (!this.initContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterCompressor);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // --- Volume Control ---
  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05);
    }
  }

  // Legacy compatibility
  setVolume(vol) {
    this.setMasterVolume(vol);
  }

  // --- Multi-Track Sound Mixer Engine ---
  setTrackVolume(trackId, volume) {
    const vol = Math.max(0, Math.min(1, volume));
    this.trackVolumes[trackId] = vol;

    if (vol > 0) {
      if (!this.activeTracks[trackId]) {
        this._startTrack(trackId);
      }
      if (this.activeTracks[trackId]?.gainNode) {
        const now = this.ctx.currentTime;
        this.activeTracks[trackId].gainNode.gain.cancelScheduledValues(now);
        this.activeTracks[trackId].gainNode.gain.linearRampToValueAtTime(vol * 0.7, now + 0.1);
      }
    } else {
      if (this.activeTracks[trackId]) {
        this._stopTrack(trackId);
      }
    }
  }

  _startTrack(trackId) {
    if (!this.initContext()) return;
    switch (trackId) {
      case 'rain':
        this._setupRainTrack();
        break;
      case 'ocean':
        this._setupOceanTrack();
        break;
      case 'forest':
        this._setupForestTrack();
        break;
      case 'campfire':
        this._setupCampfireTrack();
        break;
      case 'white_noise':
        this._setupBrownNoiseTrack();
        break;
      default:
        break;
    }
  }

  _stopTrack(trackId) {
    const track = this.activeTracks[trackId];
    if (!track) return;
    delete this.activeTracks[trackId];

    if (track.intervalId) clearInterval(track.intervalId);
    if (track.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        track.gainNode.gain.cancelScheduledValues(now);
        track.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      } catch (_) {}
    }
    setTimeout(() => {
      try {
        if (track.source) track.source.stop();
        if (track.source) track.source.disconnect();
        if (track.filter) track.filter.disconnect();
      } catch (_) {}
    }, 600);
  }

  stopAllTracks() {
    Object.keys(this.activeTracks).forEach(t => this._stopTrack(t));
    this.stopBinaural();
  }

  // --- Track DSP Implementations ---
  _setupRainTrack() {
    const buffer = this.createPinkNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    const initialVol = (this.trackVolumes.rain || 0.4) * 0.7;
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(initialVol, this.ctx.currentTime + 0.8);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterCompressor);
    source.start();

    const intervalId = setInterval(() => {
      if (!this.activeTracks.rain || !this.ctx) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        dropOsc.type = 'sine';
        const startFreq = 1600 + Math.random() * 800;
        dropOsc.frequency.setValueAtTime(startFreq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        const dropVol = 0.03 * (this.trackVolumes.rain || 0.5);
        dropGain.gain.setValueAtTime(dropVol, now);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        dropOsc.connect(dropGain);
        dropGain.connect(this.masterCompressor);
        dropOsc.start(now);
        dropOsc.stop(now + 0.07);
      } catch (_) {}
    }, 450);

    this.activeTracks.rain = { source, filter, gainNode, intervalId };
  }

  _setupOceanTrack() {
    const buffer = this.createPinkNoiseBuffer(5);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const filterLfo = this.ctx.createOscillator();
    const filterLfoGain = this.ctx.createGain();
    filterLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    filterLfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
    filterLfo.connect(filter.frequency);
    filterLfo.start();

    const waveGain = this.ctx.createGain();
    const ampLfo = this.ctx.createOscillator();
    const ampLfoGain = this.ctx.createGain();
    ampLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    ampLfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    const initialVol = (this.trackVolumes.ocean || 0.4) * 0.7;
    waveGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
    ampLfo.connect(waveGain.gain);
    ampLfo.start();

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterCompressor);
    source.start();

    this.activeTracks.ocean = { source, filter, gainNode: waveGain };
  }

  _setupForestTrack() {
    const buffer = this.createPinkNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const windLfo = this.ctx.createOscillator();
    const windLfoGain = this.ctx.createGain();
    windLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    windLfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    windLfo.connect(filter.frequency);
    windLfo.start();

    const gainNode = this.ctx.createGain();
    const initialVol = (this.trackVolumes.forest || 0.4) * 0.7;
    gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(initialVol, this.ctx.currentTime + 1.2);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterCompressor);
    source.start();

    this.activeTracks.forest = { source, filter, gainNode };
  }

  _setupCampfireTrack() {
    const buffer = this.createBrownNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    const initialVol = (this.trackVolumes.campfire || 0.4) * 0.65;
    gainNode.gain.setValueAtTime(initialVol, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterCompressor);
    source.start();

    const intervalId = setInterval(() => {
      if (!this.activeTracks.campfire || !this.ctx) return;
      if (Math.random() > 0.45) {
        try {
          const crackleBuffer = this.createWhiteNoiseBuffer(0.08);
          const crackleSource = this.ctx.createBufferSource();
          crackleSource.buffer = crackleBuffer;

          const crackleFilter = this.ctx.createBiquadFilter();
          crackleFilter.type = 'highpass';
          crackleFilter.frequency.setValueAtTime(2000 + Math.random() * 2500, this.ctx.currentTime);

          const crackleGain = this.ctx.createGain();
          const popVolume = (0.05 + Math.random() * 0.12) * (this.trackVolumes.campfire || 0.5);
          crackleGain.gain.setValueAtTime(popVolume, this.ctx.currentTime);
          crackleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

          crackleSource.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(this.masterCompressor);
          crackleSource.start();
        } catch (_) {}
      }
    }, 280);

    this.activeTracks.campfire = { source, filter, gainNode, intervalId };
  }

  _setupBrownNoiseTrack() {
    const buffer = this.createBrownNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    const initialVol = (this.trackVolumes.white_noise || 0.4) * 0.7;
    gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(initialVol, this.ctx.currentTime + 1);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterCompressor);
    source.start();

    this.activeTracks.white_noise = { source, filter, gainNode };
  }

  // --- Scientific Binaural Beats Engine ---
  setBinauralMode(mode, volume = 0.3) {
    this.currentBinauralMode = mode;
    this.binauralVolume = volume;

    if (!mode || mode === 'none') {
      this.stopBinaural();
      return;
    }

    const config = BINAURAL_MODES[mode];
    if (!config || !this.initContext()) return;

    this.stopBinaural();

    const carrier = 200; // Base soothing carrier tone (Hz)
    const diff = config.freqDiff;
    const freqL = carrier - diff / 2;
    const freqR = carrier + diff / 2;

    const now = this.ctx.currentTime;

    // Left Ear
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(freqL, now);

    // Right Ear
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(freqR, now);

    // Stereo Panning
    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panL) panL.pan.setValueAtTime(-1, now); // 100% Left
    if (panR) panR.pan.setValueAtTime(1, now);  // 100% Right

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(this.binauralVolume * 0.25, now + 1.5);

    if (panL && panR) {
      oscL.connect(panL);
      panL.connect(gainNode);
      oscR.connect(panR);
      panR.connect(gainNode);
    } else {
      oscL.connect(gainNode);
      oscR.connect(gainNode);
    }

    gainNode.connect(this.masterCompressor);

    oscL.start(now);
    oscR.start(now);

    this.binauralNodes = { oscL, oscR, panL, panR, gainNode };
  }

  setBinauralVolume(vol) {
    this.binauralVolume = Math.max(0, Math.min(1, vol));
    if (this.binauralNodes?.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.binauralNodes.gainNode.gain.cancelScheduledValues(now);
      this.binauralNodes.gainNode.gain.linearRampToValueAtTime(this.binauralVolume * 0.25, now + 0.1);
    }
  }

  stopBinaural() {
    if (!this.binauralNodes) return;
    const { oscL, oscR, gainNode } = this.binauralNodes;
    this.binauralNodes = null;
    this.currentBinauralMode = 'none';

    if (gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      } catch (_) {}
    }

    setTimeout(() => {
      try {
        if (oscL) oscL.stop();
        if (oscR) oscR.stop();
        if (oscL) oscL.disconnect();
        if (oscR) oscR.disconnect();
      } catch (_) {}
    }, 600);
  }

  // --- Preset Loader ---
  applyPreset(presetId) {
    const preset = SOUND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Apply track volumes
    Object.entries(preset.tracks).forEach(([trackId, vol]) => {
      this.setTrackVolume(trackId, vol);
    });

    // Apply binaural beat
    this.setBinauralMode(preset.binaural, preset.binauralVol);
  }

  // Backward compatibility methods
  startAmbient(type) {
    if (!type || type === 'none') {
      this.stopAllTracks();
      return;
    }
    // Turn off other tracks and turn on this single track
    Object.keys(this.trackVolumes).forEach(t => {
      this.setTrackVolume(t, t === type ? (this.trackVolumes[t] || 0.5) : 0);
    });
  }

  stopAmbient() {
    this.stopAllTracks();
  }
}

export const audioService = new AudioService();
export default audioService;
