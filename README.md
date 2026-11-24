# 🌿 ZenFocus 2.0 — Aesthetic Pomodoro & Mindful Flow OS

A serene, distraction-free productivity web workspace featuring a Pomodoro timer with mindful breathing animations, multi-track nature soundscapes, scientific binaural beats, box breathing guides, task tags, and productivity heatmaps.

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Web Audio API**.

---

## ✨ New & Advanced Features in v2.0

### 1. 🎛️ Multi-Track Procedural Sound Mixer
- **Layer multiple soundscapes simultaneously** with independent volume faders:
  - Gentle Rain, Ocean Waves, Forest Wind, Campfire, Brown Noise.
- **Master Dynamics Compressor** ensures zero audio clipping/distortion.
- **Zen Sound Presets:**
  - *Kyoto Rain:* Gentle Rain + Forest Wind
  - *Nordic Cabin:* Campfire + Gentle Rain
  - *Deep Code:* Brown Noise + Gentle Rain
  - *Zen Sanctuary:* Forest Wind + Ocean Waves

### 2. 🎧 Scientific Binaural Beats Synthesizer
Synthesized in real-time via dual stereo-panned oscillators (best experienced with headphones):
- **Alpha Wave (10 Hz):** Creative flow, deep reading, writing.
- **Beta Wave (18 Hz):** High alertness, analytical problem solving, complex coding.
- **Theta Wave (6 Hz):** Restorative calm, meditation, mindful breaks.

### 3. 🌬️ Mindful Respiration (Box Breathing & Mandala Guide)
- **Box Breathing (4-4-4-4):** Navy SEAL & Zen breathing to reset nervous tension.
- **Relaxing Breath (4-7-8):** Activates parasympathetic recovery during breaks.
- **Visual Mandala Animation:** Synchronized expanding/contracting orb with phase countdowns.
- **20-20-20 Eye-Rest Rule:** Reminds you to rest your eye muscles from screen fatigue.

### 4. ⚡ Flow Mode (Overtime Counting) & Rhythm Presets
- **Flow Mode:** If a session ends while you are in creative flow, the timer counts upward (`+01:23`) instead of interrupting your thoughts, letting you finish when ready.
- **Rhythm Presets:**
  - *Classic Pomodoro:* 25m Focus / 5m Break / 15m Long Break (4 cycles)
  - *Deep Sprint:* 50m Focus / 10m Break / 20m Long Break (3 cycles)
  - *Ultradian Rhythm:* 90m Peak Flow / 20m Rest / 30m Long Break (2 cycles)
  - *Quick Blitz:* 15m Focus / 3m Break / 10m Long Break (4 cycles)

### 5. 📊 Consistency Heatmap & Category Tags
- **12-Week Consistency Heatmap:** GitHub-style visual grid tracking daily focused minutes.
- **Task Category Tags:** `#Code`, `#Study`, `#Write`, `#Design`, `#Life` with colored badges and category distribution bars.
- **Day Streak Tracker & Local-First JSON Backup.**

---

## 🚀 Getting Started

```bash
# Start development server
npm run dev

# Run automated test suite
npm test

# Build production bundle
npm run build
```

---

## 🛡️ Architecture & Security
- **Local-First Architecture:** 100% private, zero telemetry, all data stays on your machine.
- **Drift-Free Timing:** Uses `Date.now()` milestone comparison rather than pure interval counters, guaranteeing accurate timekeeping even when the browser tab is backgrounded.
- **Zero-Crash Audio DSP:** Pure Web Audio API synthesis without external MP3 files or network bandwidth.
