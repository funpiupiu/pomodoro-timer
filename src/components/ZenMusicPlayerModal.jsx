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
  Music,
  Sparkles,
  CloudRain,
  Brain,
  Crown,
  Zap,
} from 'lucide-react';
import { musicService } from '../services/musicService';
import { GENRES } from '../constants/musicPlaylists';

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
    duration: musicService.currentTrack ? musicService.currentTrack.duration : 0,
    volume: musicService.volume,
    repeatMode: musicService.repeatMode,
    isShuffled: musicService.isShuffled,
    playbackRate: musicService.playbackRate,
    availableRates: musicService.availableRates || [0.75, 1.0, 1.25, 1.5, 2.0],
    playlist: musicService.playlist,
    selectedCategory: musicService.selectedCategory,
    allTracksCount: musicService.allTracks.length,
  }));

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'playlist'

  useEffect(() => {
    const unsubscribe = musicService.subscribe((state) => {
      setPlayerState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const {
    isPlaying,
    currentTrack,
    currentIndex,
    currentTime,
    duration,
    volume,
    repeatMode,
    isShuffled,
    playbackRate,
    availableRates = [0.75, 1.0, 1.25, 1.5, 2.0],
    playlist,
    selectedCategory,
  } = playerState;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    musicService.seek(val);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    musicService.setVolume(val);
  };

  const handleCategorySelect = (catId) => {
    musicService.setCategory(catId);
  };

  const handleRateSelect = (rate) => {
    musicService.setPlaybackRate(rate);
  };

  // Center badge config based on category
  const getBadgeIcon = (cat) => {
    switch (cat) {
      case 'baroque':
        return <Crown className="w-5 h-5 text-amber-200" />;
      case 'classical':
        return <Music className="w-5 h-5 text-indigo-200" />;
      case 'chinese':
      default:
        return <Disc3 className="w-5 h-5 text-emerald-200" />;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'baroque':
        return 'BAROQUE 60';
      case 'classical':
        return 'CLASSICAL';
      case 'chinese':
      default:
        return 'ZEN LO-FI';
    }
  };

  // Dynamic Vinyl Spin Speed (Faster playbackRate = faster rotation)
  const spinDuration = isPlaying ? `${(14 / (playbackRate || 1.0)).toFixed(1)}s` : '14s';
  const effectiveBpm = Math.round((currentTrack?.bpm || 60) * (playbackRate || 1.0));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-4 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative max-h-[90vh] sm:max-h-[92vh] overflow-y-auto flex flex-col pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2.5 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <Disc3
                className="w-4 h-4 sm:w-5 sm:h-5"
                style={{
                  animation: isPlaying ? `spin ${spinDuration} linear infinite` : 'none',
                }}
              />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                ZenFocus Mindful Music Lounge
              </h2>
              <p className="text-[10px] sm:text-[11px] text-white/50">
                Baroque 60 BPM · Cổ Điển · Nhạc Hoa Chill
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tab switch */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/30 border border-white/5 text-[11px] sm:text-xs">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'player' ? theme.pillActive : 'text-white/50 hover:text-white'
                }`}
              >
                Vinyl
              </button>
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'playlist' ? theme.pillActive : 'text-white/50 hover:text-white'
                }`}
              >
                Tracks ({playlist.length})
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

        {/* GENRE / CATEGORY PILL SELECTOR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
          {GENRES.map((g) => {
            const isSelected = selectedCategory === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleCategorySelect(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/5'
                }`}
              >
                {g.id === 'all' && <Sparkles className="w-3.5 h-3.5" />}
                {g.id === 'baroque' && <Crown className="w-3.5 h-3.5" />}
                {g.id === 'classical' && <Music className="w-3.5 h-3.5" />}
                {g.id === 'chinese' && <Music2 className="w-3.5 h-3.5" />}
                <span>{g.label}</span>
                <span className="text-[10px] opacity-60">({g.count})</span>
              </button>
            );
          })}
        </div>

        {/* TAB: VINYL PLAYER */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center py-1 sm:py-2 animate-fade-in">
            {/* Rotating Vinyl Record Graphic with Dynamic Speed */}
            <div className="relative my-2 sm:my-3 flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52 select-none">
              {/* Outer Vinyl Glow */}
              <div
                className={`absolute inset-0 rounded-full filter blur-xl opacity-25 transition-all duration-1000 ${
                  isPlaying ? 'scale-110' : 'scale-95'
                }`}
                style={{ backgroundColor: currentTrack.coverColor }}
              />

              {/* Vinyl Disc Body */}
              <div
                className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[#121214] border-4 border-[#222225] shadow-2xl relative flex items-center justify-center"
                style={{
                  animation: isPlaying ? `spin ${spinDuration} linear infinite` : 'none',
                  backgroundImage:
                    'repeating-radial-gradient(circle, #1a1a1d 0, #1a1a1d 2px, #0e0e10 3px, #0e0e10 4px)',
                }}
              >
                {/* Center Record Label */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-inner flex flex-col items-center justify-center p-1.5 sm:p-2 text-center border-2 border-white/20 transition-colors duration-500"
                  style={{ backgroundColor: currentTrack.coverColor }}
                >
                  {getBadgeIcon(currentTrack.category)}
                  <span className="text-[7px] sm:text-[8px] font-bold text-white uppercase tracking-wider truncate max-w-[55px] sm:max-w-[65px] mt-0.5">
                    {getCategoryLabel(currentTrack.category)}
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] text-white/70 font-mono tracking-tighter">
                    {effectiveBpm} BPM
                  </span>
                </div>

                {/* Spindle hole */}
                <div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0a0a0c] border border-white/30" />
              </div>
            </div>

            {/* Track Metadata & Category Badge */}
            <div className="text-center my-2 px-4 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-amber-200/90 font-medium mb-1.5">
                <span>{currentTrack.badgeText}</span>
                <span>·</span>
                <span>{effectiveBpm} BPM</span>
                {playbackRate !== 1.0 && (
                  <span className="text-amber-300 font-bold">({playbackRate}x)</span>
                )}
                <span>·</span>
                <span>{currentTrack.genre}</span>
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">{currentTrack.artist}</p>
              <p className="text-[11px] italic text-white/45 mt-1 font-serif line-clamp-2">
                "{currentTrack.description}"
              </p>
            </div>

            {/* Seekable Progress Bar */}
            <div className="w-full px-4 my-1">
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

            {/* SPEED SELECTOR PILLS (0.75x - 2.0x) */}
            <div className="flex items-center gap-1.5 my-2 px-3 py-1 rounded-full bg-black/30 border border-white/5 text-xs">
              <span className="text-[10px] text-white/40 font-medium flex items-center gap-1 mr-1">
                <Zap className="w-3 h-3 text-amber-300" /> Tốc độ:
              </span>
              {availableRates.map((rate) => {
                const isCurrent = playbackRate === rate;
                return (
                  <button
                    key={rate}
                    onClick={() => handleRateSelect(rate)}
                    className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                );
              })}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-5 my-2">
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
            <div className="flex items-center gap-2.5 w-60 mt-1 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
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
              const isActive = track.id === currentTrack.id;
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
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner"
                      style={{
                        backgroundColor: track.coverColor,
                        animation: isActive && isPlaying ? `spin ${spinDuration} linear infinite` : 'none',
                      }}
                    >
                      {track.category === 'baroque' ? (
                        <Crown className="w-4 h-4 text-white" />
                      ) : track.category === 'classical' ? (
                        <Music className="w-4 h-4 text-white" />
                      ) : (
                        <Disc3 className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium truncate ${
                          isActive ? 'text-amber-300 font-semibold' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="text-[10px] text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-white/80">
                          {track.badgeText}
                        </span>
                        <span>{track.artist}</span>
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

        {/* Ambient & Science Harmony Tip Footer */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-white/60">
          {currentTrack.category === 'baroque' ? (
            <>
              <Brain className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-200">Hiệu ứng Baroque Superlearning:</strong> Nhịp độ {effectiveBpm} BPM (Bach, Vivaldi, Handel, Pachelbel) kích hoạt sóng não Alpha (8-12Hz), tối ưu hóa tiếp thu tri thức và giữ bình tĩnh khi gõ code!
              </span>
            </>
          ) : currentTrack.category === 'classical' ? (
            <>
              <Sparkles className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-indigo-200">Cổ Điển Trầm Lắng:</strong> Âm sắc Piano của Mozart & Satie giúp cân bằng hai bán cầu não, giảm thiểu áp lực nhận thức sau nhiều phiên Pomodoro.
              </span>
            </>
          ) : (
            <>
              <CloudRain className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Không Gian Trà Đạo Cổ Phong:</strong> Bật kết hợp nhạc Hoa với tiếng Mưa rơi nhẹ ở nút Mixer để tạo cảm giác ngồi giữa quán trà cổ trấn an yên!
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
