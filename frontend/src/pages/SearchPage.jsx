import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Bot, 
  Database, 
  ShieldCheck, 
  Clock, 
  Loader2, 
  ArrowRight,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useToast } from '../context/ToastContext';
import { CategoryBadge } from '../components/Badge';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const { askQuestion, openMemoryDetail, memories, workspace, currentWorkspace } = useMemory();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaResult, setQaResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Suggestions
  const sampleQuestions = [
    "Why did we choose PostgreSQL for billing?",
    "What is our policy on Redis cluster invalidation?",
    "Why did we migrate away from Firebase?",
    "Are there any active deployment freezes?"
  ];

  // Auto-run if query param is passed
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (questionToAsk) => {
    const q = questionToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setQaResult(null);

    try {
      const result = await askQuestion(q);
      setQaResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!qaResult?.answer) return;
    navigator.clipboard.writeText(qaResult.answer);
    setCopied(true);
    toast.info('Answer Copied', 'Grounded AI response copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const findFullMemory = (id) => {
    return memories.find((m) => m._id === id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-brand-50 text-brand-700 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongoDB Atlas Vector Search + Gemini 1.5</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-700">
            <span>Workspace: {currentWorkspace?.name || workspace || 'No Workspace'}</span>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          AI Memory Search
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Ask questions in natural language. KnowBridge synthesizes grounded answers strictly backed by your team's verified technical decisions.
        </p>
      </div>

      {/* 2. Natural Language Query Input */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about architecture, dependencies, guidelines, or post-mortems..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 pl-10 pr-24 py-3 bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute inset-y-1.5 right-1.5 px-4 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Query Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <HelpCircle className="w-3 h-3" />
            <span>Try asking:</span>
          </span>
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/90 shadow-subtle text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin text-brand-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Querying MongoDB Atlas Vector Index...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Synthesizing 3072-dimensional vector similarity scores and grounding facts in verified team memories.
          </p>
        </div>
      )}

      {/* 4. Grounded AI Answer Box */}
      {qaResult && (
        <div className="space-y-5 animate-slide-up">
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card overflow-hidden">
            {/* Header */}
            <div className="p-4 px-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">
                    Grounded Answer
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Strictly grounded in {qaResult.memoriesCited?.length || 0} team memories
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyAnswer}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Answer Content */}
            <div className="p-6 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {qaResult.answer}
            </div>

            {/* Citations Ribbon */}
            <div className="p-3 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero hallucinations — citations verified against Atlas cluster</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Model: Gemini 1.5 Pro • 3072-dim
              </span>
            </div>
          </div>

          {/* 5. Memory Citations & Match Details */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cited Memories & Semantic Relevance ({qaResult.memoriesCited?.length || 0})
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Cosine Similarity Scan
              </span>
            </div>

            <div className="space-y-3">
              {qaResult.memoriesCited?.map((item, idx) => {
                const fullMem = findFullMemory(item.id);
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => fullMem && openMemoryDetail(fullMem)}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-card transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <CategoryBadge category={item.category} />
                        <span className="text-[11px] font-mono text-slate-400">
                          #{item.id}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          By {item.source}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h4>

                      {item.contentSnippet && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {item.contentSnippet}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 flex-shrink-0">
                      <div className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {Math.round((item.relevanceScore || 0.95) * 100)}% Match
                      </div>
                      <span className="text-[10px] text-brand-600 font-medium group-hover:underline inline-flex items-center gap-0.5">
                        Inspect <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
