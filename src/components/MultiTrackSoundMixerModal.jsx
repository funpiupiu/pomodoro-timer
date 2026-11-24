import React, { useState } from 'react';
import {
  X,
  Sliders,
  CloudRain,
  Waves,
  Trees,
  Flame,
  Radio,
  Headphones,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioService, BINAURAL_MODES, SOUND_PRESETS } from '../services/audioService';

const TRACK_ICONS = {
  rain: CloudRain,
  ocean: Waves,
  forest: Trees,
  campfire: Flame,
  white_noise: Radio,
};

const TRACK_NAMES = {
  rain: 'Gentle Rain',
  ocean: 'Ocean Waves',
  forest: 'Forest Wind',
  campfire: 'Campfire',
  white_noise: 'Brown Noise',
};

export default function MultiTrackSoundMixerModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) {
  if (!isOpen) return null;

  const tracks = settings.mixerTracks || {
    rain: 0,
    ocean: 0,
    forest: 0,
    campfire: 0,
    white_noise: 0,
  };

  const handleTrackChange = (trackId, vol) => {
    audioService.initContext();
    const updated = { ...tracks, [trackId]: vol };
    audioService.setTrackVolume(trackId, vol);
    onUpdateSettings({ ...settings, mixerTracks: updated });
  };

  const handleBinauralChange = (mode) => {
    audioService.initContext();
    const vol = settings.binauralVolume ?? 0.3;
    audioService.setBinauralMode(mode, vol);
    onUpdateSettings({ ...settings, binauralMode: mode });
  };

  const handleBinauralVolume = (vol) => {
    audioService.setBinauralVolume(vol);
    onUpdateSettings({ ...settings, binauralVolume: vol });
  };

  const handleApplyPreset = (preset) => {
    audioService.initContext();
    audioService.applyPreset(preset.id);
    onUpdateSettings({
      ...settings,
      mixerTracks: { ...preset.tracks },
      binauralMode: preset.binaural,
      binauralVolume: preset.binauralVol,
    });
  };

  const handleMuteAll = () => {
    audioService.stopAllTracks();
    const mutedTracks = { rain: 0, ocean: 0, forest: 0, campfire: 0, white_noise: 0 };
    onUpdateSettings({
      ...settings,
      mixerTracks: mutedTracks,
      binauralMode: 'none',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl ${theme.surfaceClass} border shadow-2xl relative max-h-[92vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: theme.accentColor }} />
            <h2 className="text-base font-semibold text-white">Multi-Track Sound Mixer</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteAll}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Mute All
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Soundscape Presets */}
        <div className="my-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-white/70 mb-2.5 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Zen Presets</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SOUND_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-medium text-white group-hover:text-emerald-300">
                  {p.name}
                </div>
                <div className="text-[10px] text-white/40 truncate">
                  {Object.entries(p.tracks)
                    .filter(([_, v]) => v > 0)
                    .map(([k]) => TRACK_NAMES[k])
                    .join(' + ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 5 Nature Sound Tracks with Faders */}
        <div className="my-5 pt-4 border-t border-white/10 space-y-3.5">
          <div className="text-xs font-semibold uppercase text-white/70 tracking-wider">
            Natural Soundscapes
          </div>

          {Object.entries(TRACK_NAMES).map(([trackId, name]) => {
            const Icon = TRACK_ICONS[trackId] || Radio;
            const volume = tracks[trackId] || 0;
            const isPlaying = volume > 0;

            return (
              <div key={trackId} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5">
                <button
                  onClick={() => handleTrackChange(trackId, isPlaying ? 0 : 0.5)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                  title={isPlaying ? 'Mute' : 'Play'}
                >
                  <Icon className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${isPlaying ? 'text-white' : 'text-white/60'}`}>
                      {name}
                    </span>
                    <span className="font-mono text-[10px] text-white/50">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleTrackChange(trackId, parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Binaural Beats Frequency Section */}
        <div className="my-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-white/70 tracking-wider">
              <Headphones className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
              <span>Binaural Brainwave Beats</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">Use headphones for effect</span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2.5">
            {Object.values(BINAURAL_MODES).map((bm) => {
              const isSelected = (settings.binauralMode || 'none') === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => handleBinauralChange(bm.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-white/30 bg-white/15 shadow-sm'
                      : 'border-white/5 hover:border-white/15 bg-white/5'
                  }`}
                >
                  <div className="text-xs font-medium text-white">{bm.label}</div>
                  <div className="text-[10px] text-white/40 truncate">{bm.desc}</div>
                </button>
              );
            })}
          </div>

          {settings.binauralMode && settings.binauralMode !== 'none' && (
            <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
              <span className="text-xs text-white/60 min-w-[70px]">Beat Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.binauralVolume ?? 0.3}
                onChange={(e) => handleBinauralVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-white/50 w-8 text-right">
                {Math.round((settings.binauralVolume ?? 0.3) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
