import React, { useState, useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Database, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Clock,
  Plus
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../services/mockData';

export const AddMemoryModal = () => {
  const { 
    isAddModalOpen, 
    closeAddModal, 
    prefilledAddData, 
    saveMemory, 
    checkConflict, 
    supersedeMemory, 
    extractFromText, 
    workspace: activeWorkspace,
    workspaces,
    teamMembers
  } = useMemory();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'extract'

  // Manual Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('technical_decision');
  const [tags, setTags] = useState('');
  const [workspace, setWorkspace] = useState(activeWorkspace || 'default');
  const [author, setAuthor] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [supersedingId, setSupersedingId] = useState(null);

  // AI Conflict Pre-Check State
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extraction State
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMemories, setExtractedMemories] = useState([]);

  // Populate prefilled data if any
  useEffect(() => {
    if (prefilledAddData) {
      setTitle(prefilledAddData.title || '');
      setContent(prefilledAddData.content || '');
      setCategory(prefilledAddData.category || 'technical_decision');
      setWorkspace(prefilledAddData.workspace || activeWorkspace || 'default');
      setTags(prefilledAddData.tags || '');
      setSupersedingId(prefilledAddData.supersedingId || null);
      setActiveTab('manual');
    } else {
      // Reset defaults
      setTitle('');
      setContent('');
      setCategory('technical_decision');
      setWorkspace(activeWorkspace || 'default');
      setTags('');
      setHasExpiry(false);
      setExpiresAt('');
      setSupersedingId(null);
      setConflictResult(null);
      setRawText('');
      setExtractedMemories([]);
    }
  }, [prefilledAddData, isAddModalOpen, activeWorkspace]);

  if (!isAddModalOpen) return null;

  // Real-time or manual conflict check
  const handlePreCheckConflict = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsCheckingConflict(true);
    try {
      const res = await checkConflict({ title, content, workspace });
      setConflictResult(res);
      if (res?.hasConflict) {
        toast.warning(
          'Contradiction Detected',
          'AI Engine found a clash with an existing team memory.'
        );
      } else {
        toast.info(
          'Clean Decision',
          'No architectural conflicts detected with active team memories.'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Validation Error', 'Please provide both title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const defaultSource = user?.name ? `${user.name} (${user.role || 'Engineer'})` : 'Engineer';
      const payload = {
        title,
        content,
        category,
        workspace,
        tags: tagList,
        source: author || defaultSource,
        expires_at: hasExpiry && expiresAt ? new Date(expiresAt).toISOString() : null
      };

      if (supersedingId) {
        await supersedeMemory(supersedingId, payload);
      } else {
        await saveMemory(payload);
      }
      closeAddModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run AI extraction
  const handleExtract = async () => {
    if (!rawText.trim()) {
      toast.error('Empty Notes', 'Please paste conversation notes or transcript to analyze.');
      return;
    }
    setIsExtracting(true);
    try {
      const res = await extractFromText(rawText);
      if (res.success && res.data.length > 0) {
        setExtractedMemories(res.data);
        toast.success(
          'Extraction Successful',
          `AI Engine extracted ${res.data.length} architectural decisions.`
        );
      } else {
        toast.info(
          'No High-Signal Decisions',
          'No significant architectural decisions detected. Try pasting technical discussions.'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveExtractedItem = async (item) => {
    try {
      await saveMemory({
        ...item,
        workspace,
        source: item.source || `${user?.name} (${user?.role})`
      });
      // Remove from candidate list
      setExtractedMemories(prev => prev.filter(m => m !== item));
      if (extractedMemories.length <= 1) {
        closeAddModal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sample templates to demo
  const samplePrompts = [
    {
      label: "Redis Cache Policy",
      text: "During sprint planning, Priya emphasized: Team, under no circumstance run FLUSHALL on our Redis cluster in production between 10am-6pm. Please use cursor scan-and-delete in batches of 500 to prevent event loop blocks."
    },
    {
      label: "PostgreSQL Ledger Decision",
      text: "Rahul (Tech Lead): We have decided to migrate the ledger service to PostgreSQL instead of Mongo. We require ACID transactions and strict foreign key integrity across multi-currency accounts."
    },
    {
      label: "Diwali Code Freeze",
      text: "Engineering Notice: Q4 Code Freeze is in effect on payments microservices until Nov 7. No non-critical PRs to production without VP signoff."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full border border-slate-200/90 shadow-dropdown overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-50 text-brand-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {supersedingId ? 'Supersede & Update Decision' : 'Preserve Team Memory'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {supersedingId
                ? 'Creates a new active standard while preserving the previous decision in the audit trail.'
                : 'Extract or record technical decisions with automated Gemini 3072-dim vector embedding.'}
            </p>
          </div>

          <button
            onClick={closeAddModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!supersedingId && (
          <div className="px-6 pt-3 border-b border-slate-100 flex gap-4">
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'manual'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual Entry & Pre-Check</span>
            </button>
            <button
              onClick={() => setActiveTab('extract')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'extract'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Extraction from Notes / Chat</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-700 font-mono">
                Smart
              </span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmitManual} className="space-y-4">
              {/* Category & Workspace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {Object.entries(CATEGORY_DEFINITIONS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Workspace Scope
                  </label>
                  <select
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Author / Decision Owner */}
              {teamMembers && teamMembers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Decision Lead / Contributor
                  </label>
                  <select
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">
                      {user?.name ? `${user.name} (${user.role}) [You]` : 'Current Engineer'}
                    </option>
                    {teamMembers
                      .filter((m) => m.id !== user?.id)
                      .map((member) => (
                        <option key={member.id} value={`${member.name} (${member.role})`}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Decision / Rule Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Standardize RS256 JWT Tokens for Microservices"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              {/* Content / Rationale */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Detailed Context & Rationale <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePreCheckConflict}
                    disabled={isCheckingConflict || (!title && !content)}
                    className="text-[11px] font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isCheckingConflict ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Run Conflict Pre-Check</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Explain why this decision was made, what trade-offs were considered, and rules to enforce..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              {/* Conflict Pre-Check Alert Card */}
              {conflictResult && conflictResult.hasConflict && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Potential Architectural Contradiction Detected!</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    <strong>Reason:</strong> {conflictResult.reason}
                  </p>
                  {conflictResult.conflictingMemory && (
                    <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200/60">
                      <span className="text-slate-500 text-[11px] block">Clashes with active memory:</span>
                      <strong className="text-slate-800 block text-xs">
                        "{conflictResult.conflictingMemory.title}"
                      </strong>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Logged by {conflictResult.conflictingMemory.source}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-amber-700 italic">
                    💡 Tip: If you intend to overturn this past decision, click "Save & Supersede" to deprecate the old rule and keep the audit trail intact.
                  </p>
                </div>
              )}

              {conflictResult && !conflictResult.hasConflict && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Verified: No conflicting decisions found in the knowledge base.</span>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. auth, security, jwt, microservices"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Optional TTL Expiry */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Schedule Time-To-Live (TTL Auto-Expiry)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Automatically cleans up temporary rules via MongoDB TTL index.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasExpiry}
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                </div>

                {hasExpiry && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Embedding...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {supersedingId
                          ? 'Save & Supersede Memory'
                          : conflictResult?.hasConflict
                          ? 'Save Anyway (Keep Both)'
                          : 'Save Memory'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* AI Extraction Tab */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paste Raw Conversation / Meeting Notes
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste unstructured notes, Slack thread discussions, or incident summaries. KnowBridge AI will discard chatter and isolate formal architectural decisions..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Sample Templates */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  Or load a sample engineering transcript:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawText(s.text)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extract Button */}
              <div>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isExtracting || !rawText.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini Semantic Engine Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze & Extract Decisions</span>
                    </>
                  )}
                </button>
              </div>

              {/* Extracted Results List */}
              {extractedMemories.length > 0 && (
                <div className="pt-3 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Candidate Decisions Found ({extractedMemories.length})
                  </h4>

                  {extractedMemories.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 transition-all flex flex-col justify-between gap-3 text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                            {item.category?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Source: {item.source}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <div className="flex gap-1">
                          {(item.tags || []).map((t, i) => (
                            <span key={i} className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveExtractedItem(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-subtle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Save to Memory</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
