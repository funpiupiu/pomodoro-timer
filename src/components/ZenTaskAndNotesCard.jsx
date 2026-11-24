import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  FileText,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  List,
  CheckSquare,
  Code2,
  Sparkles,
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { storageService, TASK_TAGS } from '../services/storageService';

export default function ZenTaskAndNotesCard({
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  onTriggerFeynman,
  theme,
  settings,
}) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'notes'
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEstimate, setNewEstimate] = useState(2);
  const [newTag, setNewTag] = useState('#code');

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const currentKey = activeTaskId ? `task_${activeTaskId}` : 'general';

  // Scratchpad state
  const [scratchpadText, setScratchpadText] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load scratchpad for current key
  useEffect(() => {
    const loaded = storageService.loadScratchpad(currentKey);
    setScratchpadText(loaded);
    setIsSaved(true);
  }, [currentKey]);

  // Handle scratchpad input with debounce auto-save
  const handleNotesChange = (text) => {
    setScratchpadText(text);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      storageService.saveScratchpad(currentKey, text);
      setIsSaved(true);
    }, 400);
  };

  // Quick insertion helpers for Markdown
  const insertText = (snippet) => {
    const next = scratchpadText ? `${scratchpadText}\n${snippet}` : snippet;
    handleNotesChange(next);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (settings.soundEffects) audioService.playClick();
    onAddTask({
      id: Date.now().toString(),
      title: newTitle.trim(),
      tag: newTag,
      estimatedPomodoros: Number(newEstimate) || 1,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    setNewTitle('');
    setNewEstimate(2);
    setNewTag('#code');
    setIsAdding(false);
  };

  const handleToggle = (id) => {
    if (settings.soundEffects) audioService.playClick();
    onToggleTask(id);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div
      className={`w-full max-w-md lg:max-w-none mx-auto p-4 sm:p-5 rounded-3xl ${theme.surfaceClass} shadow-xl border transition-all duration-300`}
    >
      {/* Header with Dual Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/30 border border-white/5">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
              activeTab === 'tasks' ? theme.pillActive : 'text-white/50 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="font-medium">Tasks</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
              {completedCount}/{tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
              activeTab === 'notes' ? theme.pillActive : 'text-white/50 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">Quick Notes</span>
            {scratchpadText.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Action button on right of header */}
        {activeTab === 'tasks' ? (
          completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
            >
              Clear done
            </button>
          )
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 font-mono">
              {isSaved ? 'Saved' : 'Saving...'}
            </span>
            {onTriggerFeynman && (
              <button
                onClick={onTriggerFeynman}
                title="Open Feynman Reflection"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-[11px] text-amber-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reflect</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs italic text-white/40">
                No pending tasks. Clear mind, focused intention.
              </div>
            ) : (
              tasks.map((task) => {
                const isActive = task.id === activeTaskId;
                const tagObj = TASK_TAGS.find((t) => t.id === task.tag) || TASK_TAGS[0];

                return (
                  <div
                    key={task.id}
                    onClick={() => onSetActiveTask(task.id)}
                    className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer border ${
                      isActive
                        ? 'border-white/20 bg-white/10 shadow-sm'
                        : 'border-transparent hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(task.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                          task.isCompleted
                            ? 'bg-emerald-500/80 border-emerald-500 text-white'
                            : 'border-white/30 hover:border-white/60 bg-transparent'
                        }`}
                      >
                        {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm truncate transition-all duration-200 ${
                            task.isCompleted
                              ? 'line-through text-white/40'
                              : isActive
                              ? 'text-white font-medium'
                              : 'text-white/80'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.tag && (
                          <span
                            className="text-[10px] font-mono mt-0.5"
                            style={{ color: tagObj.color }}
                          >
                            {tagObj.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="text-xs px-2 py-0.5 rounded-full font-mono bg-black/20 text-white/70"
                        title={`Completed ${task.completedPomodoros} of ${task.estimatedPomodoros} pomodoros`}
                      >
                        {task.completedPomodoros}/{task.estimatedPomodoros}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (settings.soundEffects) audioService.playClick();
                          onDeleteTask(task.id);
                        }}
                        className="opacity-75 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {isAdding ? (
            <form onSubmit={handleTaskSubmit} className="mt-4 pt-3 border-t border-white/10">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What would you like to focus on?"
                className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all"
              />

              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
                <span className="text-[11px] text-white/50 mr-1">Tag:</span>
                {TASK_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setNewTag(tag.id)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg transition-all cursor-pointer ${
                      newTag === tag.id
                        ? 'bg-white/20 text-white font-medium shadow-sm'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    style={{
                      borderLeft: newTag === tag.id ? `3px solid ${tag.color}` : 'none',
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>Est. Pomodoros:</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newEstimate}
                    onChange={(e) => setNewEstimate(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 px-2 py-1 text-center text-xs rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${theme.buttonPrimary} shadow-sm`}
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                if (settings.soundEffects) audioService.playClick();
                setIsAdding(true);
              }}
              className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          )}
        </>
      )}

      {/* TAB CONTENT: MINDFUL SCRATCHPAD */}
      {activeTab === 'notes' && (
        <div className="animate-fade-in">
          {/* Target Header */}
          <div className="flex items-center justify-between mb-2 text-xs text-white/60">
            <span className="truncate max-w-[240px]">
              {activeTask ? `Notes for: "${activeTask.title}"` : 'General Scratchpad'}
            </span>
            <span className="font-mono text-[10px]">
              {scratchpadText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* Textarea */}
          <textarea
            value={scratchpadText}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Jot down quick ideas, formulas, code snippets, or distractions here to keep your mind clear..."
            rows={6}
            className="w-full p-3 text-xs leading-relaxed rounded-2xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all font-mono resize-none"
          />

          {/* Formatting Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/60">
              <button
                type="button"
                onClick={() => insertText('- ')}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="Insert Bullet Point"
              >
                <List className="w-3 h-3" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => insertText('[ ] ')}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="Insert Checklist Item"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Todo</span>
              </button>
              <button
                type="button"
                onClick={() => insertText('```\n\n```')}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="Insert Code Block"
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>

            {scratchpadText.trim() && (
              <button
                type="button"
                onClick={() => handleNotesChange('')}
                className="text-[11px] text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
