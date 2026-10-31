import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  GitCommit, 
  ArrowRight, 
  User, 
  Clock, 
  ExternalLink,
  History,
  AlertTriangle,
  FileCheck,
  Check
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { CategoryBadge } from '../components/Badge';

export const ConflictsPage = () => {
  const { conflicts, resolveConflict, openMemoryDetail, workspace, currentWorkspace } = useMemory();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'resolved'
  const [resolvingId, setResolvingId] = useState(null);

  const pendingList = conflicts.filter((c) => c.status === 'pending');
  const resolvedList = conflicts.filter((c) => c.status !== 'pending');

  const handleAction = async (conflictId, action) => {
    setResolvingId(conflictId);
    try {
      await resolveConflict(conflictId, action);
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Anti-Tech-Debt Contradiction Interceptor</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-700">
              <span>Workspace: {currentWorkspace?.name || workspace || 'No Workspace'}</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Conflict Detection & Alignment Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            KnowBridge catches architectural contradictions before they merge into code. Compare side-by-side and decide intentionally.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-100 self-start">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Review</span>
            {pendingList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {pendingList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'resolved'
                ? 'bg-white text-slate-900 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Resolved History</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({resolvedList.length})
            </span>
          </button>
        </div>
      </div>

      {/* 2. Pending Conflicts List */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingList.length > 0 ? (
            pendingList.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-white rounded-2xl border border-amber-200/90 shadow-card overflow-hidden animate-slide-up"
              >
                {/* Conflict Banner Header */}
                <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Contradiction Detected
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-200/80 text-amber-900">
                          {conflict.severity || 'High'} Severity
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800">
                        Intercepted by AI Memory Engine on {new Date(conflict.detectedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-amber-900 px-3 py-1 rounded-lg bg-amber-100/80 self-start sm:self-auto">
                    ID: {conflict.id}
                  </span>
                </div>

                {/* AI Contradiction Reason Callout */}
                <div className="p-5 bg-slate-50 border-b border-slate-200/80 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider min-w-[120px]">
                      Why Flagged:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {conflict.reason}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs pt-1">
                    <span className="font-bold text-brand-700 uppercase tracking-wider min-w-[120px]">
                      Recommended:
                    </span>
                    <p className="text-brand-900 font-medium leading-relaxed">
                      {conflict.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Side-by-Side Comparison Container */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Candidate Proposed Decision */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/20 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md">
                          Proposed New Decision
                        </span>
                        <span className="text-xs text-slate-500">Candidate</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-2">
                        {conflict.proposedDecision.title}
                      </h4>

                      <p className="text-xs text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {conflict.proposedDecision.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-rose-200/60 text-xs text-slate-500 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-medium text-slate-800">
                          {conflict.proposedDecision.source}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {conflict.proposedDecision.workspace}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Existing Active Decision */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                          Existing Active Standard
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          #{conflict.conflictingMemory._id}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-2">
                        {conflict.conflictingMemory.title}
                      </h4>

                      <p className="text-xs text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {conflict.conflictingMemory.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-blue-200/60 text-xs text-slate-500 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-medium text-slate-800">
                          {conflict.conflictingMemory.source}
                        </span>
                      </div>
                      <button
                        onClick={() => openMemoryDetail(conflict.conflictingMemory)}
                        className="text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1"
                      >
                        <span>Inspect Full</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conflict Resolution Action Bar */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Choose Resolution:</span> History is preserved — old decisions are never silently deleted.
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAction(conflict.id, 'reject')}
                      disabled={resolvingId === conflict.id}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-subtle"
                    >
                      Keep Active (Reject Change)
                    </button>

                    <button
                      onClick={() => handleAction(conflict.id, 'exception')}
                      disabled={resolvingId === conflict.id}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-subtle"
                    >
                      Approve as Scoped Exception
                    </button>

                    <button
                      onClick={() => handleAction(conflict.id, 'supersede')}
                      disabled={resolvingId === conflict.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle"
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>Supersede & Make Active</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                All Architectural Decisions Aligned!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active contradictions or conflicting technical decisions detected in this workspace.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Resolved History Tab */}
      {activeTab === 'resolved' && (
        <div className="space-y-4">
          {resolvedList.length > 0 ? (
            resolvedList.map((conflict) => (
              <div
                key={conflict.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {conflict.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {conflict.id}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    "{conflict.proposedDecision.title}" vs "{conflict.conflictingMemory.title}"
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {conflict.reason}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 text-xs text-slate-500">
                  <span className="text-slate-400 block text-[11px]">
                    Resolved on {conflict.resolvedAt ? new Date(conflict.resolvedAt).toLocaleDateString() : 'Recent'}
                  </span>
                  <span className="font-semibold text-emerald-700 block mt-0.5">
                    History Lineage Preserved
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No conflicts resolved yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
