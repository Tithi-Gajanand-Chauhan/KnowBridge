import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';
import { CategoryBadge, StatusBadge } from './Badge';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Database, 
  GitCommit, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  AlertTriangle,
  History,
  Clock,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const MemoryDetailModal = () => {
  const { isDetailModalOpen, closeMemoryDetail, selectedMemory, memories, openAddModal, openMemoryDetail } = useMemory();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!isDetailModalOpen || !selectedMemory) return null;

  // Find superseded memory or newer memory if available
  const supersededByMemory = selectedMemory.superseded_by 
    ? memories.find(m => m._id === selectedMemory.superseded_by)
    : null;

  const previousMemory = memories.find(m => m.superseded_by === selectedMemory._id);

  const handleCopyCitation = () => {
    const citation = `[KnowBridge Memory #${selectedMemory._id}]\nTitle: ${selectedMemory.title}\nCategory: ${selectedMemory.category}\nLogged by: ${selectedMemory.source}\nDate: ${new Date(selectedMemory.createdAt).toLocaleDateString()}\nDetails: ${selectedMemory.content}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.info('Citation Copied', 'Formatted markdown citation copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSupersedeClick = () => {
    closeMemoryDetail();
    openAddModal({
      supersedingId: selectedMemory._id,
      title: `Update: ${selectedMemory.title}`,
      category: selectedMemory.category,
      workspace: selectedMemory.workspace,
      tags: (selectedMemory.tags || []).join(', ')
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full border border-slate-200/90 shadow-dropdown overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CategoryBadge category={selectedMemory.category} size="md" />
              <StatusBadge status={selectedMemory.status} expiresAt={selectedMemory.expires_at} />
              <span className="text-xs font-mono text-slate-400">
                ID: {selectedMemory._id}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {selectedMemory.title}
            </h2>
          </div>

          <button
            onClick={closeMemoryDetail}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Rationale / Content */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Decision & Architectural Context
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMemory.content}
            </div>
          </div>

          {/* Superseded Warning / Notice */}
          {selectedMemory.status === 'deprecated' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <span className="font-semibold block text-sm mb-1 text-amber-900">
                  This decision has been deprecated
                </span>
                {supersededByMemory ? (
                  <p>
                    Superseded by newer decision:{' '}
                    <button
                      onClick={() => openMemoryDetail(supersededByMemory)}
                      className="font-medium underline hover:text-amber-950 inline-flex items-center gap-1"
                    >
                      "{supersededByMemory.title}" <ExternalLink className="w-3 h-3" />
                    </button>
                  </p>
                ) : (
                  <p>Preserved in the audit log for historical lineage and debugging reference.</p>
                )}
              </div>
            </div>
          )}

          {/* If this memory superseded a previous one */}
          {previousMemory && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>
                  Superseded legacy decision:{' '}
                  <strong>"{previousMemory.title}"</strong>
                </span>
              </div>
              <button
                onClick={() => openMemoryDetail(previousMemory)}
                className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
              >
                Inspect Previous <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">Source / Contributor</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span className="truncate">{selectedMemory.source || 'Engineering Lead'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">Workspace</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-mono">{selectedMemory.workspace || 'default'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">Vector Embedding</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">3072-dim (Gemini)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">Created At</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(selectedMemory.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">TTL Auto-Expiry</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {selectedMemory.expires_at 
                    ? new Date(selectedMemory.expires_at).toLocaleDateString()
                    : 'Permanent (No TTL)'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-1">Atlas Index</span>
              <div className="font-medium text-emerald-700 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>vector_index</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {selectedMemory.tags && selectedMemory.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Knowledge Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMemory.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-subtle"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
          </button>

          <div className="flex items-center gap-2">
            {selectedMemory.status === 'active' && (
              <button
                onClick={handleSupersedeClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Supersede / Update</span>
              </button>
            )}
            <button
              onClick={closeMemoryDetail}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
