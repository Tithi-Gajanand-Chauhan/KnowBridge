import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Plus, 
  AlertOctagon, 
  Layers, 
  Users, 
  Clock, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Database,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Cpu,
  Building2,
  HelpCircle
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { MemoryCard } from '../components/MemoryCard';
import { CategoryBadge, StatusBadge } from '../components/Badge';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    workspace, 
    setWorkspace, 
    workspaces, 
    currentWorkspace, 
    openCreateWorkspaceModal, 
    memories, 
    conflicts, 
    activities, 
    teamMembers,
    pendingConflictsCount, 
    openAddModal, 
    openMemoryDetail 
  } = useMemory();
  const { user, isFirstLogin, dismissFirstLogin } = useAuth();

  const [quickSearch, setQuickSearch] = useState('');

  // Active memories
  const activeMemories = memories.filter((m) => m.status === 'active');
  const deprecatedMemories = memories.filter((m) => m.status === 'deprecated');
  const ttlMemories = memories.filter((m) => m.expires_at && new Date(m.expires_at) > new Date());

  const isDemoWorkspace = currentWorkspace?.isDemo || workspace === 'default';
  const teamMemberCount = isDemoWorkspace ? 5 : (teamMembers?.length || 1);
  const teamMembersSubtitle = isDemoWorkspace 
    ? 'Tithi, Krisha, Soham, Rahul, Priya' 
    : (teamMembers && teamMembers.length > 0 
        ? teamMembers.map(m => m.name.split(' ')[0]).join(', ') 
        : (user?.name || 'You'));

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(quickSearch)}`);
    } else {
      navigate('/app/search');
    }
  };

  // If user has NO workspace created or selected yet (e.g. fresh registration like Justin)
  if (!workspace) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100 shadow-sm mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to KnowBridge, {user?.name || 'Engineer'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            You don't have an active workspace yet. KnowBridge organizes team knowledge into isolated spaces. Create a fresh workspace for your team or explore the demo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Create a Fresh Workspace */}
          <div className="p-6 rounded-2xl bg-white border border-brand-200 ring-2 ring-brand-500/10 shadow-card flex flex-col justify-between space-y-5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3 shadow-sm">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 font-mono block mb-1">
                Fresh Workspace
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                Create My Team Workspace
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Start clean with 0 decisions. Record your own team's technical choices, best practices, and temporary rules with AI conflict protection.
              </p>
            </div>

            <button
              onClick={openCreateWorkspaceModal}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Explore Sample Demo Workspace */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <Database className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                Sample Data
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                Explore Demo Workspace
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluate KnowBridge using pre-seeded engineering decisions (PostgreSQL ledger, JWT tokens, Redis rules) and live conflict alerts.
              </p>
            </div>

            <button
              onClick={() => setWorkspace('default')}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.99]"
            >
              <span>Explore Core Engineering (Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fresh User First-Time Welcome Banner */}
      {isFirstLogin && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-card animate-slide-up relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
                <span>🎉 New Workspace Member</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Welcome to KnowBridge, {user?.name}!
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Your workspace <strong>"{currentWorkspace?.name || workspace}"</strong> is ready. Capture decisions with automated Gemini 3072-dim embeddings, or ask AI copilot questions.
              </p>
            </div>

            <button
              onClick={dismissFirstLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-700 hover:bg-indigo-50 transition-colors shadow-subtle self-start md:self-center flex-shrink-0"
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      )}

      {/* 1. Welcome & Stats Banner */}
      <div className="relative rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-card overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-brand-50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-brand-50 text-brand-700 border border-brand-200 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Workspace: {currentWorkspace?.name || workspace}</span>
              {isDemoWorkspace && (
                <span className="ml-1 text-[10px] bg-brand-200 text-brand-900 px-1.5 py-0.2 rounded font-sans">
                  Demo
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good afternoon, {user?.name || 'Engineer'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {activeMemories.length === 0 ? (
                <span className="text-slate-600 font-medium">
                  0 decisions recorded in this workspace. Ready for your first architectural decision!
                </span>
              ) : (
                <>
                  {activeMemories.length} verified decisions active in this workspace.{' '}
                  {pendingConflictsCount > 0 ? (
                    <span className="text-amber-700 font-semibold">
                      {pendingConflictsCount} architectural conflict requires review.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      Zero contradictions detected across your services.
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-subtle hover:shadow-card active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Decision</span>
            </button>
            <button
              onClick={() => navigate('/app/search')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Quick Natural Language Search Bar */}
        <form onSubmit={handleQuickSearchSubmit} className="relative mt-6 z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Ask a technical question or search memory (e.g. 'Why did we choose PostgreSQL for billing?')..."
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200/90 pl-10 pr-24 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-subtle"
            />
            <button
              type="submit"
              className="absolute inset-y-1.5 right-1.5 px-3 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-1"
            >
              <span>Search</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => navigate('/app/explorer')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Memories
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {activeMemories.length}
            </span>
            {activeMemories.length > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14%
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {deprecatedMemories.length} preserved in history
          </span>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => navigate('/app/conflicts')}
          className={`p-5 rounded-2xl bg-white border shadow-card transition-all cursor-pointer group ${
            pendingConflictsCount > 0
              ? 'border-amber-200 hover:border-amber-300 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Conflicts
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              pendingConflictsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${
              pendingConflictsCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {pendingConflictsCount}
            </span>
            {pendingConflictsCount > 0 ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Action needed
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600">Clean state</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Proactive anti-tech debt
          </span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => navigate('/app/team')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Team
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {teamMemberCount}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {teamMemberCount === 1 ? 'Engineer' : 'Engineers'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {teamMembersSubtitle}
          </span>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => navigate('/app/explorer?category=temporary_constraint')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              TTL Constraints
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {ttlMemories.length}
            </span>
            <span className="text-[11px] font-medium text-rose-600">
              Auto-expiring
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            MongoDB native TTL Index
          </span>
        </div>
      </div>

      {/* 3. Conflict Alert Banner (If pending conflicts) */}
      {pendingConflictsCount > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Architectural Conflict Flagged
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  High Severity
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                Candidate proposal: "Adopt Firebase Auth for Mobile Flutter App" directly contradicts established decision #mem_002 (Custom JWT Standard).
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/conflicts')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-subtle flex-shrink-0"
          >
            <span>Resolve Conflict</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Split Section: Recent Memories & Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Memories */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Decisions & Rules
              </h3>
              <p className="text-xs text-slate-500">
                Latest verified memories stored with vector embeddings
              </p>
            </div>

            {memories.length > 0 && (
              <button
                onClick={() => navigate('/app/explorer')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cards Grid or Clean Empty State */}
          {memories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.slice(0, 4).map((memory) => (
                <MemoryCard
                  key={memory._id}
                  memory={memory}
                  onSelect={() => openMemoryDetail(memory)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
                <Database className="w-6 h-6 text-brand-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                "{currentWorkspace?.name || workspace}" is completely clean!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                There are 0 decisions or conflicts in this workspace. Start capturing your team's architectural choices, or paste meeting notes to test AI extraction.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log First Decision</span>
                </button>
                <button
                  onClick={() => setWorkspace('default')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Switch to Demo Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Activity Stream */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Audit Stream
              </h3>
              <p className="text-xs text-slate-500">
                Live team activity & engine events
              </p>
            </div>

            <button
              onClick={() => navigate('/app/activity')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              History
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-slate-800 truncate">
                        {act.actor}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed line-clamp-2">
                      {act.description}
                    </p>
                    {act.badge && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {act.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <Clock className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-700">No activity yet</p>
                <p className="text-[11px] text-slate-400">Events and decisions logged in this workspace will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
