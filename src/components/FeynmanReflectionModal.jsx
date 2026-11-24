import React, { useState } from 'react';
import {
  X,
  Lightbulb,
  Key,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

export default function FeynmanReflectionModal({
  isOpen,
  onClose,
  activeTask,
  onSaved,
  theme,
}) {
  const [simpleExplanation, setSimpleExplanation] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [nextObstacle, setNextObstacle] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!simpleExplanation.trim() && !keyTakeaway.trim() && !nextObstacle.trim()) {
      onClose();
      return;
    }

    audioService.playClick();

    const newLog = {
      id: Date.now().toString(),
      taskId: activeTask ? activeTask.id : 'general',
      taskTitle: activeTask ? activeTask.title : 'Deep Focus Session',
      tag: activeTask ? activeTask.tag : '#study',
      simpleExplanation: simpleExplanation.trim(),
      keyTakeaway: keyTakeaway.trim(),
      nextObstacle: nextObstacle.trim(),
      createdAt: new Date().toISOString(),
    };

    storageService.addKnowledgeLog(newLog);
    if (onSaved) onSaved(newLog);

    // Reset fields
    setSimpleExplanation('');
    setKeyTakeaway('');
    setNextObstacle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative max-h-[90vh] sm:max-h-[92vh] overflow-y-auto pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2.5 sm:hidden flex-shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Feynman Synthesis</h2>
              <p className="text-[11px] text-white/50">
                {activeTask ? `Reflecting on: "${activeTask.title}"` : '60-second learning synthesis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with 3 Structured Prompts */}
        <form onSubmit={handleSave} className="my-4 space-y-4">
          {/* Prompt 1: Explain Simply */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>1. Explain Simply (For a 10-year-old)</span>
            </div>
            <textarea
              rows={2}
              value={simpleExplanation}
              onChange={(e) => setSimpleExplanation(e.target.value)}
              placeholder="If you had to teach what you just learned/built in simple analogies, what would you say?"
              className="w-full p-2.5 text-xs rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Prompt 2: Key Breakthrough */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>2. Key Takeaway & Pattern</span>
            </div>
            <textarea
              rows={2}
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="What core concept, formula, or architectural decision clicked for you?"
              className="w-full p-2.5 text-xs rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Prompt 3: Next Obstacle */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>3. Next Question or Obstacle</span>
            </div>
            <textarea
              rows={2}
              value={nextObstacle}
              onChange={(e) => setNextObstacle(e.target.value)}
              placeholder="What lingering question, edge case, or bug needs solving in your next session?"
              className="w-full p-2.5 text-xs rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Skip to Break
            </button>

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md ${theme.buttonPrimary}`}
            >
              <span>Save & Rest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
