import React, { useState, useEffect, useRef } from 'react';
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
  Disc3,
  Music2,
  Music,
  Sparkles,
  CloudRain,
  Brain,
  Crown,
  Zap,
  AlignLeft,
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

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'lyrics' | 'playlist'
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const activeLyricRef = useRef(null);

  useEffect(() => {
    const unsubscribe = musicService.subscribe((state) => {
      setPlayerState({ ...state });
    });
    return unsubscribe;
  }, []);

  const {
    isPlaying,
    currentTrack,
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

  const lyrics = currentTrack?.lyrics || [];
  let activeLyricIdx = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeLyricIdx = i;
      break;
    }
  }
  const activeLyric = activeLyricIdx >= 0 ? lyrics[activeLyricIdx] : lyrics[0] || null;

  // Auto-scroll active lyric line smoothly when viewing the Lyrics tab
  useEffect(() => {
    if (isOpen && activeTab === 'lyrics' && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIdx, activeTab, isOpen]);

  if (!isOpen) return null;

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

  const handleLyricClick = (timeSec) => {
    musicService.seek(timeSec);
    if (!isPlaying) {
      musicService.togglePlay();
    }
  };

  const getBadgeIcon = (cat) => {
    switch (cat) {
      case 'baroque':
        return <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />;
      case 'classical':
        return <Music className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />;
      case 'chinese':
      default:
        return <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />;
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

  const spinDuration = isPlaying ? `${(14 / (playbackRate || 1.0)).toFixed(1)}s` : '14s';
  const effectiveBpm = Math.round((currentTrack?.bpm || 60) * (playbackRate || 1.0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg p-3.5 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* Header Row 1: Title & Close */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 flex-shrink-0">
              <Disc3
                className="w-4 h-4 sm:w-5 sm:h-5"
                style={{
                  animation: isPlaying ? `spin ${spinDuration} linear infinite` : 'none',
                }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                ZenFocus Mindful Music Lounge
              </h2>
              <p className="text-[10px] sm:text-[11px] text-white/50 truncate">
                16 Nhạc Hoa Có Lời · Baroque 60 BPM · Cổ Điển
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close music lounge"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Row 2: Segmented Tab Switch (Responsive Full-Width on Mobile) */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-black/30 border border-white/5 text-[11px] sm:text-xs mb-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('player')}
            className={`py-1.5 px-2 rounded-full transition-all cursor-pointer font-medium text-center ${
              activeTab === 'player' ? theme.pillActive : 'text-white/55 hover:text-white'
            }`}
          >
            Vinyl
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`py-1.5 px-2 rounded-full transition-all cursor-pointer font-medium flex items-center justify-center gap-1 ${
              activeTab === 'lyrics' ? theme.pillActive : 'text-white/55 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3 h-3" />
            <span>Lời ({lyrics.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`py-1.5 px-2 rounded-full transition-all cursor-pointer font-medium text-center ${
              activeTab === 'playlist' ? theme.pillActive : 'text-white/55 hover:text-white'
            }`}
          >
            Tracks ({playlist.length})
          </button>
        </div>

        {/* GENRE / CATEGORY PILL SELECTOR */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 mb-1 flex-shrink-0">
          {GENRES.map((g) => {
            const isSelected = selectedCategory === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleCategorySelect(g.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/5'
                }`}
              >
                {g.id === 'all' && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {g.id === 'baroque' && <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {g.id === 'classical' && <Music className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                {g.id === 'chinese' && <Music2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{g.label}</span>
                <span className="text-[9px] sm:text-[10px] opacity-60">({g.count})</span>
              </button>
            );
          })}
        </div>

        {/* TAB: VINYL PLAYER */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center py-0.5 sm:py-2 animate-fade-in">
            {/* Rotating Vinyl Record Graphic with Dynamic Speed */}
            <div className="relative my-1 sm:my-2 flex items-center justify-center w-28 h-28 sm:w-44 sm:h-44 select-none">
              <div
                className={`absolute inset-0 rounded-full filter blur-xl opacity-25 transition-all duration-1000 ${
                  isPlaying ? 'scale-110' : 'scale-95'
                }`}
                style={{ backgroundColor: currentTrack.coverColor }}
              />

              <div
                className="w-26 h-26 sm:w-40 sm:h-40 rounded-full bg-[#121214] border-4 border-[#222225] shadow-2xl relative flex items-center justify-center"
                style={{
                  animation: isPlaying ? `spin ${spinDuration} linear infinite` : 'none',
                  backgroundImage:
                    'repeating-radial-gradient(circle, #1a1a1d 0, #1a1a1d 2px, #0e0e10 3px, #0e0e10 4px)',
                }}
              >
                <div
                  className="w-12 h-12 sm:w-18 sm:h-18 rounded-full shadow-inner flex flex-col items-center justify-center p-1 sm:p-2 text-center border-2 border-white/20 transition-colors duration-500"
                  style={{ backgroundColor: currentTrack.coverColor }}
                >
                  {getBadgeIcon(currentTrack.category)}
                  <span className="text-[6px] sm:text-[8px] font-bold text-white uppercase tracking-wider truncate max-w-[44px] sm:max-w-[65px] mt-0.5">
                    {getCategoryLabel(currentTrack.category)}
                  </span>
                  <span className="text-[6px] sm:text-[7px] text-white/70 font-mono tracking-tighter">
                    {effectiveBpm} BPM
                  </span>
                </div>

                <div className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#0a0a0c] border border-white/30" />
              </div>
            </div>

            {/* Track Metadata & Category Badge */}
            <div className="text-center my-1.5 px-2 sm:px-4 w-full max-w-sm">
              <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-amber-200/90 font-medium mb-1">
                <span>{currentTrack.badgeText}</span>
                <span>·</span>
                <span>{effectiveBpm} BPM</span>
                {playbackRate !== 1.0 && (
                  <span className="text-amber-300 font-bold">({playbackRate}x)</span>
                )}
                <span>·</span>
                <span>{currentTrack.genre}</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1">
                {currentTrack.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-white/60 mt-0.5 truncate">{currentTrack.artist}</p>
            </div>

            {/* Mini Live Synced Lyric Preview on Vinyl View */}
            {activeLyric ? (
              <button
                type="button"
                onClick={() => setActiveTab('lyrics')}
                title="Nhấn để mở toàn bộ Lời bài hát đồng bộ"
                className="w-full max-w-sm my-1.5 px-3.5 py-2 rounded-2xl bg-black/30 hover:bg-black/40 border border-white/10 text-center transition-all cursor-pointer group"
              >
                <div className="text-xs sm:text-sm font-medium text-amber-200 group-hover:text-amber-100 truncate">
                  {activeLyric.zh}
                </div>
                <div className="text-[10px] text-white/55 font-mono truncate mt-0.5">
                  {activeLyric.pinyin}
                </div>
                <div className="text-[10px] italic text-white/70 truncate mt-0.5">
                  "{activeLyric.vi}"
                </div>
              </button>
            ) : (
              <p className="text-[11px] italic text-white/45 my-1 px-4 font-serif line-clamp-2 text-center max-w-sm">
                "{currentTrack.description}"
              </p>
            )}

            {/* Seekable Progress Bar */}
            <div className="w-full px-2 sm:px-4 my-1">
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

            {/* SPEED SELECTOR PILLS (Wrapped cleanly for narrow 320px phones) */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 my-1.5 px-2.5 sm:px-3 py-1 rounded-2xl sm:rounded-full bg-black/30 border border-white/5 text-xs max-w-full">
              <span className="text-[10px] text-white/40 font-medium flex items-center gap-1 mr-0.5">
                <Zap className="w-3 h-3 text-amber-300" /> Tốc độ:
              </span>
              {availableRates.map((rate) => {
                const isCurrent = playbackRate === rate;
                return (
                  <button
                    key={rate}
                    onClick={() => handleRateSelect(rate)}
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
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
            <div className="flex items-center justify-center gap-3 sm:gap-5 my-1.5">
              <button
                onClick={() => musicService.toggleShuffle()}
                title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isShuffled ? 'text-amber-300 bg-white/10' : 'text-white/40 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => musicService.prevTrack()}
                title="Previous track"
                className="w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => musicService.togglePlay()}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => musicService.nextTrack()}
                title="Next track"
                className="w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => musicService.toggleRepeat()}
                title={`Repeat: ${repeatMode}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
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
            <div className="flex items-center gap-2.5 w-full max-w-[240px] mt-1 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
              <Volume2 className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
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

        {/* TAB: SYNCHRONIZED LYRICS (3 LAYERS: HANZI · PINYIN · VIETNAMESE) */}
        {activeTab === 'lyrics' && (
          <div className="flex flex-col py-1 animate-fade-in">
            {/* Sub-header with Display Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate max-w-[210px] sm:max-w-[270px]">
                  {currentTrack.title}
                </div>
                <div className="text-[10px] text-white/50 truncate">
                  {lyrics.length > 0 ? 'Chạm vào câu hát để tua nhạc đến đoạn đó' : 'Bản hòa tấu không lời'}
                </div>
              </div>

              {lyrics.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    onClick={() => setShowPinyin((v) => !v)}
                    className={`px-2 py-1 rounded-full border cursor-pointer transition-all ${
                      showPinyin
                        ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    Pinyin
                  </button>
                  <button
                    onClick={() => setShowVietnamese((v) => !v)}
                    className={`px-2 py-1 rounded-full border cursor-pointer transition-all ${
                      showVietnamese
                        ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    Dịch Việt
                  </button>
                </div>
              )}
            </div>

            {lyrics.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-2xl bg-black/25 border border-white/5 space-y-3">
                <Music className="w-8 h-8 text-white/25 mx-auto" />
                <p className="text-xs text-white/60">
                  Tác phẩm <strong>{currentTrack.title}</strong> là bản hòa tấu thuần nhạc cụ không lời.
                </p>
                <button
                  onClick={() => {
                    handleCategorySelect('chinese');
                    setActiveTab('playlist');
                  }}
                  className="px-4 py-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-xs font-medium cursor-pointer transition-all"
                >
                  Xem 16 bài Nhạc Hoa Có Lời
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1 py-1">
                {lyrics.map((line, idx) => {
                  const isCurrent = idx === activeLyricIdx;
                  return (
                    <button
                      key={`${line.time}_${idx}`}
                      ref={isCurrent ? activeLyricRef : null}
                      type="button"
                      onClick={() => handleLyricClick(line.time)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-amber-400/15 border-amber-400/40 shadow-sm scale-[1.01]'
                          : 'bg-white/[0.03] border-transparent hover:bg-white/[0.08] opacity-65 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-sm sm:text-base font-medium leading-snug ${
                            isCurrent ? 'text-amber-200' : 'text-white/90'
                          }`}
                        >
                          {line.zh}
                        </span>
                        <span className="text-[10px] font-mono text-white/40 flex-shrink-0 pt-0.5">
                          {formatTime(line.time)}
                        </span>
                      </div>
                      {showPinyin && (
                        <div className="text-[11px] font-mono text-sky-200/80 mt-1">
                          {line.pinyin}
                        </div>
                      )}
                      {showVietnamese && (
                        <div className="text-xs italic text-white/70 mt-0.5">
                          {line.vi}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compact Mini Playback Bar inside Lyrics view */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={() => musicService.togglePlay()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-400 hover:bg-amber-300 text-black flex-shrink-0 cursor-pointer transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-amber-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <button
                onClick={() => musicService.nextTrack()}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex-shrink-0 cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: PLAYLIST DRAWER */}
        {activeTab === 'playlist' && (
          <div className="space-y-2 py-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1 animate-fade-in">
            {playlist.map((track, idx) => {
              const isActive = track.id === currentTrack.id;
              return (
                <div
                  key={track.id}
                  onClick={() => musicService.playTrack(idx)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer border ${
                    isActive
                      ? 'border-white/30 bg-white/15 shadow-sm'
                      : 'border-transparent hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
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
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-white/80 flex-shrink-0">
                          {track.badgeText}
                        </span>
                        {track.lyrics?.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[9px] text-emerald-300 flex-shrink-0">
                            Có lời
                          </span>
                        )}
                        <span className="truncate">{track.artist}</span>
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
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-start gap-2 text-[10px] sm:text-[11px] text-white/60">
          {currentTrack.category === 'baroque' ? (
            <>
              <Brain className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-200">Hiệu ứng Baroque Superlearning:</strong> Nhịp độ {effectiveBpm} BPM (Bach, Vivaldi, Handel, Pachelbel) kích hoạt sóng não Alpha (8-12Hz), tối ưu hóa tiếp thu tri thức!
              </span>
            </>
          ) : currentTrack.category === 'classical' ? (
            <>
              <Sparkles className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-indigo-200">Cổ Điển Trầm Lắng:</strong> Âm sắc Piano của Mozart & Satie giúp cân bằng hai bán cầu não, giảm thiểu áp lực nhận thức.
              </span>
            </>
          ) : (
            <>
              <CloudRain className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Hòa Tấu Nhạc Hoa & Lời Đồng Bộ:</strong> Thưởng thức giai điệu đàn Tranh/Piano thuần Offline kèm lời Chữ Hán · Pinyin · Dịch Việt ở tab <strong>Lời</strong>!
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
