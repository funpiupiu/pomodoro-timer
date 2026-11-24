import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Download,
  Trash2,
  Lightbulb,
  Key,
  HelpCircle,
  Calendar,
  Tag,
} from 'lucide-react';
import { storageService, TASK_TAGS } from '../services/storageService';
import { audioService } from '../services/audioService';

export default function KnowledgeLogModal({
  isOpen,
  onClose,
  knowledgeLogs,
  onUpdateLogs,
  theme,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  if (!isOpen) return null;

  // Filter logs by search query and tag
  const filteredLogs = knowledgeLogs.filter((log) => {
    const matchesTag = selectedTag === 'all' || log.tag === selectedTag;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTag;

    const matchesSearch =
      (log.taskTitle || '').toLowerCase().includes(query) ||
      (log.simpleExplanation || '').toLowerCase().includes(query) ||
      (log.keyTakeaway || '').toLowerCase().includes(query) ||
      (log.nextObstacle || '').toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  const handleDelete = (id) => {
    audioService.playClick();
    const updated = storageService.deleteKnowledgeLog(id);
    if (onUpdateLogs) onUpdateLogs(updated);
  };

  const handleExportMarkdown = () => {
    audioService.playClick();
    const md = storageService.exportKnowledgeAsMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenfocus_knowledge_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-2xl p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl ${theme.surfaceClass} border border-white/10 shadow-2xl relative max-h-[90vh] sm:max-h-[92vh] flex flex-col pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2.5 sm:hidden flex-shrink-0" />
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Knowledge Log & Syntheses</h2>
              <p className="text-[11px] text-white/50">
                {knowledgeLogs.length} total learning reflections captured
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Export all reflections as a clean Markdown (.md) file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar: Search + Tag pills */}
        <div className="my-3 flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-1 overflow-x-auto w-full pb-1">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              All
            </button>
            {TASK_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  selectedTag === tag.id
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  borderLeft: selectedTag === tag.id ? `3px solid ${tag.color}` : 'none',
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-xs italic text-white/40 flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 opacity-20" />
              <span>No reflection logs matching your criteria.</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const tagObj = TASK_TAGS.find((t) => t.id === log.tag) || TASK_TAGS[0];
              const dateStr = log.createdAt
                ? new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all group relative"
                >
                  {/* Top line: Task title, tag, date and delete */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-white truncate max-w-sm">
                        {log.taskTitle || 'Focus Session'}
                      </span>
                      {log.tag && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md font-mono"
                          style={{
                            backgroundColor: `${tagObj.color}20`,
                            color: tagObj.color,
                          }}
                        >
                          {tagObj.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </span>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded transition-all cursor-pointer"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2 text-xs">
                    {log.simpleExplanation && (
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/80 mr-1.5">Simplified:</span>
                          <span className="text-white/70 leading-relaxed font-sans">
                            {log.simpleExplanation}
                          </span>
                        </div>
                      </div>
                    )}

                    {log.keyTakeaway && (
                      <div className="flex items-start gap-2">
                        <Key className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/80 mr-1.5">Key Takeaway:</span>
                          <span className="text-white/70 leading-relaxed font-sans">
                            {log.keyTakeaway}
                          </span>
                        </div>
                      </div>
                    )}

                    {log.nextObstacle && (
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/80 mr-1.5">Next Challenge:</span>
                          <span className="text-white/70 leading-relaxed font-sans">
                            {log.nextObstacle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
