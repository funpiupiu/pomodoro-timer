import React, { useState, useEffect } from 'react';
import { X, Wind, Eye, Sparkles } from 'lucide-react';
import { audioService } from '../services/audioService';

const BREATH_TECHNIQUES = {
  box: {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    desc: 'Navy SEAL & Zen focus technique to reset nervous tension',
    phases: [
      { label: 'Inhale deeply', duration: 4, action: 'expand' },
      { label: 'Hold breath', duration: 4, action: 'hold' },
      { label: 'Exhale slowly', duration: 4, action: 'contract' },
      { label: 'Hold empty', duration: 4, action: 'hold' },
    ],
  },
  relax: {
    id: 'relax',
    name: 'Relaxing Breath (4-7-8)',
    desc: 'Calms amygdala and lowers pulse during restorative breaks',
    phases: [
      { label: 'Inhale through nose', duration: 4, action: 'expand' },
      { label: 'Hold breath gently', duration: 7, action: 'hold' },
      { label: 'Exhale with whoosh', duration: 8, action: 'contract' },
    ],
  },
};

export default function MindfulBreathingModal({
  isOpen,
  onClose,
  theme,
}) {
  const [techniqueKey, setTechniqueKey] = useState('box');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  const technique = BREATH_TECHNIQUES[techniqueKey];
  const currentPhase = technique.phases[phaseIndex];

  // Reset when technique changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPhaseIndex(0);
      setSecondsRemaining(technique.phases[0].duration);
      setCompletedCycles(0);
    }
  }, [isOpen, techniqueKey, technique.phases]);

  // Phase countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          const nextIdx = (phaseIndex + 1) % technique.phases.length;
          setPhaseIndex(nextIdx);
          if (nextIdx === 0) {
            setCompletedCycles(c => c + 1);
          }
          return technique.phases[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, phaseIndex, technique.phases]);

  if (!isOpen) return null;

  // Compute scale based on action
  let scaleClass = 'scale-100';
  if (currentPhase.action === 'expand') {
    scaleClass = 'scale-125';
  } else if (currentPhase.action === 'contract') {
    scaleClass = 'scale-85';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative flex flex-col items-center text-center pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5" style={{ color: theme.accentColor }} />
            <h2 className="text-base font-semibold text-white">Mindful Respiration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technique Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 border border-white/5 my-5">
          {Object.entries(BREATH_TECHNIQUES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setTechniqueKey(key);
                setPhaseIndex(0);
                setSecondsRemaining(t.phases[0].duration);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
                techniqueKey === key
                  ? theme.pillActive
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Breathing Mandala Visualization */}
        <div className="relative my-4 sm:my-8 flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64">
          {/* Subtle Outer Halo Ripples */}
          <div
            className="absolute inset-0 rounded-full transition-transform duration-1000 ease-in-out opacity-20 filter blur-xl"
            style={{
              backgroundColor: theme.accentColor,
              transform: currentPhase.action === 'expand' ? 'scale(1.35)' : 'scale(0.9)',
            }}
          />

          {/* Concentric Decorative Rings */}
          <div
            className={`w-40 h-40 sm:w-52 sm:h-52 rounded-full border-2 border-dashed transition-all duration-1000 ease-in-out flex items-center justify-center ${scaleClass}`}
            style={{ borderColor: theme.accentColor }}
          >
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/20 transition-all duration-1000 ease-in-out flex items-center justify-center backdrop-blur-md"
              style={{
                background: `radial-gradient(circle, ${theme.glowColor} 0%, rgba(255,255,255,0.03) 80%)`,
              }}
            >
              <div className="flex flex-col items-center">
                {/* Big Phase Countdown */}
                <span className="text-4xl font-light tabular-nums text-white font-['Space_Grotesk']">
                  {secondsRemaining}
                </span>
                <span className="text-xs uppercase tracking-wider text-white/70 mt-1 font-medium">
                  {currentPhase.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cycles Counter */}
        <div className="text-xs text-white/50 mb-4 font-mono">
          Completed cycles: <span className="text-white font-semibold">{completedCycles}</span>
        </div>

        {/* 20-20-20 Eye-Relax Rule Prompt */}
        <div className="w-full p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-left text-xs text-white/70">
          <Eye className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white/90">20-20-20 Eye Rest Rule</div>
            <div className="text-[11px] text-white/60">
              Gently gaze at an object 20 feet away to relax your eye muscles and ease screen fatigue.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
