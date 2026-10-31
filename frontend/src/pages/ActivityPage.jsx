import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  GitCommit, 
  Clock, 
  Search, 
  Filter,
  History,
  Download,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useToast } from '../context/ToastContext';

export const ActivityPage = () => {
  const { activities, workspace, currentWorkspace, openAddModal } = useMemory();
  const toast = useToast();
  const [filterType, setFilterType] = useState('all');

  const filtered = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.type === filterType || (a.badgeType && a.badgeType === filterType));

  const handleExportCSV = () => {
    if (!activities.length) {
      toast.warning('No Records', 'There are no activity logs to export.');
      return;
    }

    const headers = ['ID', 'Actor', 'Event', 'Badge', 'Timestamp'];
    const rows = activities.map(a => [
      `"${a.id || ''}"`,
      `"${(a.actor || '').replace(/"/g, '""')}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      `"${a.badge || ''}"`,
      `"${a.timestamp || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `knowbridge_audit_log_${workspace || 'workspace'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Audit Log Exported', `Downloaded ${activities.length} activity records.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700 mb-1.5">
            <span>Workspace: {currentWorkspace?.name || workspace || 'No Workspace'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Activity & Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable chronological audit record of all memory extractions, conflict interceptions, and queries.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Event Types ({activities.length})</option>
            <option value="warning">Conflict Interceptions</option>
            <option value="success">Memory Creations</option>
            <option value="brand">Q&A Queries</option>
            <option value="info">TTL & System Updates</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-subtle"
            title="Export audit log to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        {filtered.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {filtered.map((item, idx) => {
              const dotColor = {
                warning: 'bg-amber-500 ring-4 ring-amber-100',
                success: 'bg-emerald-500 ring-4 ring-emerald-100',
                brand: 'bg-brand-600 ring-4 ring-brand-100',
                info: 'bg-blue-500 ring-4 ring-blue-100',
                neutral: 'bg-slate-400 ring-4 ring-slate-100',
              }[item.badgeType] || 'bg-slate-400 ring-4 ring-slate-100';

              return (
                <div key={item.id || idx} className="relative group text-xs text-left">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full ${dotColor}`} />

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.actor}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs sm:text-[13px]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No audit events found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {filterType !== 'all' 
                ? 'No activities match the selected event filter.'
                : 'This workspace has no recorded activities yet. Any memory logged or conflict resolved will be preserved here in append-only history.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {filterType !== 'all' ? (
                <button
                  onClick={() => setFilterType('all')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Clear Filter
                </button>
              ) : (
                <button
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log First Memory</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
