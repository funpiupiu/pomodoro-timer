import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Disc3,
  Music2,
  Sparkles,
  CloudRain,
} from 'lucide-react';
import { musicService } from '../services/musicService';

export default function ZenMusicPlayerModal({
  isOpen,
  onClose,
  theme,
}) {
  const [playerState, setPlayerState] = useState(() => ({
    isPlaying: musicService.isPlaying,
    currentTrack: musicService.currentTrack,
    currentIndex: musicService.currentIndex,
    currentTime: musicService.currentTime,
    duration: musicService.currentTrack.duration,
    volume: musicService.volume,
    repeatMode: musicService.repeatMode,
    isShuffled: musicService.isShuffled,
    playlist: musicService.playlist,
  }));

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'playlist'

  useEffect(() => {
    const unsubscribe = musicService.subscribe((state) => {
      setPlayerState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const { isPlaying, currentTrack, currentIndex, currentTime, duration, volume, repeatMode, isShuffled, playlist } =
    playerState;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    musicService.seek(val);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    musicService.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl ${theme.surfaceClass} border shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base font-semibold text-white">Chinese Chill & Lo-Fi Lounge</h2>
              <p className="text-[11px] text-white/50">
                Acoustic Guqin, Guzheng & Lo-Fi Ballads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/30 border border-white/5 text-xs">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'player' ? theme.pillActive : 'text-white/50 hover:text-white'
                }`}
              >
                Vinyl
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'playlist' ? theme.pillActive : 'text-white/50 hover:text-white'
                }`}
              >
                Playlist ({playlist.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB: VINYL PLAYER */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center py-2 animate-fade-in">
            {/* Rotating Vinyl Record Graphic */}
            <div className="relative my-4 flex items-center justify-center w-52 h-52 select-none">
              {/* Outer Vinyl Glow */}
              <div
                className={`absolute inset-0 rounded-full filter blur-xl opacity-20 transition-all duration-1000 ${
                  isPlaying ? 'scale-110' : 'scale-95'
                }`}
                style={{ backgroundColor: currentTrack.coverColor }}
              />

              {/* Vinyl Disc Body */}
              <div
                className={`w-48 h-48 rounded-full bg-[#121214] border-4 border-[#222225] shadow-2xl relative flex items-center justify-center ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(circle, #1a1a1d 0, #1a1a1d 2px, #0e0e10 3px, #0e0e10 4px)',
                }}
              >
                {/* Center Record Label */}
                <div
                  className="w-20 h-20 rounded-full shadow-inner flex flex-col items-center justify-center p-2 text-center border-2 border-white/20"
                  style={{ backgroundColor: currentTrack.coverColor }}
                >
                  <Disc3 className="w-6 h-6 text-black/80" />
                  <span className="text-[9px] font-bold text-black/90 uppercase tracking-tighter truncate max-w-[65px] mt-0.5">
                    ZenFocus
                  </span>
                </div>

                {/* Spindle hole */}
                <div className="absolute w-3 h-3 rounded-full bg-[#0a0a0c] border border-white/30" />
              </div>
            </div>

            {/* Track Metadata */}
            <div className="text-center my-3 px-4 max-w-sm">
              <h3 className="text-base font-semibold text-white tracking-tight">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">{currentTrack.artist}</p>
              <p className="text-[11px] italic text-white/40 mt-1 font-serif">
                "{currentTrack.description}"
              </p>
            </div>

            {/* Seekable Progress Bar */}
            <div className="w-full px-4 my-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-amber-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-white/40 font-mono mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-5 my-3">
              {/* Shuffle toggle */}
              <button
                onClick={() => musicService.toggleShuffle()}
                title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isShuffled ? 'text-amber-300 bg-white/10' : 'text-white/40 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev track */}
              <button
                onClick={() => musicService.prevTrack()}
                title="Previous track"
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause main button */}
              <button
                onClick={() => musicService.togglePlay()}
                title={isPlaying ? 'Pause' : 'Play'}
                className="p-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              {/* Next track */}
              <button
                onClick={() => musicService.nextTrack()}
                title="Next track"
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat toggle */}
              <button
                onClick={() => musicService.toggleRepeat()}
                title={`Repeat: ${repeatMode}`}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'text-amber-300 bg-white/10' : 'text-white/40 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2.5 w-60 mt-1 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              <Volume2 className="w-3.5 h-3.5 text-white/50" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolume}
                className="w-full accent-amber-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-white/40 w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* TAB: PLAYLIST DRAWER */}
        {activeTab === 'playlist' && (
          <div className="space-y-2 py-2 max-h-80 overflow-y-auto pr-1 animate-fade-in">
            {playlist.map((track, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => musicService.playTrack(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                    isActive
                      ? 'border-white/30 bg-white/15 shadow-sm'
                      : 'border-transparent hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Disc thumbnail */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${
                        isActive && isPlaying ? 'animate-spin' : ''
                      }`}
                      style={{ backgroundColor: track.coverColor }}
                    >
                      <Disc3 className="w-4 h-4 text-black/80" />
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium truncate ${
                          isActive ? 'text-amber-300 font-semibold' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="text-[10px] text-white/50 truncate">
                        {track.artist} · {track.genre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isActive && isPlaying && (
                      <span className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                        <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                        <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse delay-150" />
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-white/40">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ambient Harmony Tip */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/60">
          <CloudRain className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Bật kết hợp nhạc Hoa với tiếng Mưa rơi nhẹ ở nút Mixer để tạo cảm giác ngồi giữa quán trà cổ trấn!
          </span>
        </div>
      </div>
    </div>
  );
}
