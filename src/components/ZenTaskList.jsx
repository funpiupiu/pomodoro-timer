import React, { useState } from 'react';
import { Check, Plus, Trash2, Target } from 'lucide-react';
import { audioService } from '../services/audioService';
import { TASK_TAGS } from '../services/storageService';

export default function ZenTaskList({
  tasks,
  activeTaskId,
  onSetActiveTask,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  theme,
  settings,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEstimate, setNewEstimate] = useState(2);
  const [newTag, setNewTag] = useState('#code');

  const handleSubmit = (e) => {
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

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className={`w-full max-w-md mx-auto p-5 rounded-3xl ${theme.surfaceClass} shadow-xl border transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: theme.accentColor }} />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-white/90">
            Mindful Tasks
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
            {completedCount}/{tasks.length}
          </span>
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
          >
            Clear done
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs italic text-white/40">
            No pending tasks. Clear mind, focused intention.
          </div>
        ) : (
          tasks.map((task) => {
            const isActive = task.id === activeTaskId;
            const tagObj = TASK_TAGS.find(t => t.id === task.tag) || TASK_TAGS[0];

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
                {/* Left: Checkbox, Title & Tag */}
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

                {/* Right: Pomodoro count & Delete */}
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
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/40 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
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

      {/* Add Task Form or Button */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-white/10">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What would you like to focus on?"
            className="w-full px-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all"
          />

          {/* Tag Selector */}
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

          <div className="flex items-center justify-between mt-3">
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
    </div>
  );
}
