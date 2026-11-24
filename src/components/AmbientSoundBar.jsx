import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Trees,
  Flame,
  Radio,
  Sliders,
  Headphones,
} from 'lucide-react';
import { AMBIENT_SOUNDS } from '../constants/themes';
import { audioService } from '../services/audioService';

const ICON_MAP = {
  VolumeX,
  CloudRain,
  Waves,
  Trees,
  Flame,
  Radio,
};

export default function AmbientSoundBar({
  settings,
  onUpdateSettings,
  onOpenMixer,
  theme,
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Count active tracks in mixer
  const activeTrackCount = Object.values(settings.mixerTracks || {}).filter(v => v > 0).length;
  const hasBinaural = settings.binauralMode && settings.binauralMode !== 'none';

  const handleSelectSound = (soundId) => {
    if (settings.soundEffects) audioService.playClick();
    const updated = { ...settings, ambientSound: soundId };
    onUpdateSettings(updated);
    audioService.startAmbient(soundId);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    audioService.setMasterVolume(val);
    onUpdateSettings({ ...settings, ambientVolume: val });
  };

  return (
    <div className="relative flex items-center gap-1.5 p-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md shadow-lg select-none">
      {/* Sound Pills */}
      <div className="flex items-center gap-1">
        {AMBIENT_SOUNDS.map((sound) => {
          const IconComponent = ICON_MAP[sound.icon] || Radio;
          const isActive = settings.ambientSound === sound.id && activeTrackCount <= 1;
          return (
            <button
              key={sound.id}
              onClick={() => handleSelectSound(sound.id)}
              title={sound.label}
              className={`p-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Multi-Track Mixer Launcher */}
      <button
        onClick={onOpenMixer}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
          activeTrackCount > 1 || hasBinaural
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }`}
        title="Open Sound Mixer & Binaural Beats"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium text-[11px]">
          {activeTrackCount > 1 ? `${activeTrackCount} tracks` : 'Mixer'}
        </span>
        {hasBinaural && <Headphones className="w-3 h-3 text-amber-300 ml-0.5" />}
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-white/10 mx-0.5" />

      {/* Volume Controller Trigger */}
      <div className="relative">
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          title={`Master Volume: ${Math.round((settings.ambientVolume ?? 0.45) * 100)}%`}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            showVolumeSlider ? 'text-white bg-white/15' : 'text-white/50 hover:text-white'
          }`}
        >
          {settings.ambientVolume === 0 ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Volume popover slider */}
        {showVolumeSlider && (
          <div
            className={`absolute bottom-full right-0 mb-3 p-3 rounded-2xl ${theme.surfaceClass} border shadow-2xl flex flex-col items-center gap-2 w-36 backdrop-blur-xl animate-fade-in z-40`}
          >
            <div className="text-[11px] font-medium text-white/80 flex items-center justify-between w-full">
              <span>Volume</span>
              <span className="font-mono text-[10px] text-white/50">
                {Math.round((settings.ambientVolume ?? 0.45) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.ambientVolume ?? 0.45}
              onChange={handleVolumeChange}
              className="w-full accent-emerald-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
