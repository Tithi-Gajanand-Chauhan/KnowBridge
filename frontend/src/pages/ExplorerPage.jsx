import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  ArrowUpDown, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Calendar,
  X
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { MemoryCard } from '../components/MemoryCard';
import { CategoryBadge, StatusBadge } from '../components/Badge';
import { CATEGORY_DEFINITIONS } from '../services/mockData';

export const ExplorerPage = () => {
  const { 
    memories, 
    workspace, 
    currentWorkspace, 
    openCreateWorkspaceModal, 
    setWorkspace, 
    openAddModal, 
    openMemoryDetail 
  } = useMemory();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'deprecated' | 'ttl'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'score'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter & Sort Logic
  const filteredMemories = useMemo(() => {
    let list = [...memories];

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus === 'active') {
      list = list.filter((m) => m.status === 'active');
    } else if (selectedStatus === 'deprecated') {
      list = list.filter((m) => m.status === 'deprecated');
    } else if (selectedStatus === 'ttl') {
      list = list.filter((m) => m.expires_at && new Date(m.expires_at) > new Date());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        (m.source && m.source.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      return 0;
    });

    return list;
  }, [memories, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* No Workspace Warning */}
      {!workspace && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div>
            <span className="font-bold block text-sm mb-0.5">No Workspace Selected</span>
            <span className="text-amber-800">Decisions and rules belong to an active workspace. Create your team's workspace to start.</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openCreateWorkspaceModal}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-subtle"
            >
              + Create Workspace
            </button>
            <button
              onClick={() => setWorkspace('default')}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100"
            >
              Explore Demo
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-50 text-brand-700 border border-brand-200 mb-1.5">
            <span>Workspace: {currentWorkspace?.name || workspace || 'No Workspace'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Memory Explorer
          </h2>
          <p className="text-xs text-slate-500">
            Browse, filter, and inspect verified engineering memories and decision history.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Memory</span>
        </button>
      </div>

      {/* 2. Search, Status, and Sort Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by keyword, author, or tag..."
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-8 py-2 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Status, Sort, View Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="deprecated">Deprecated / History</option>
              <option value="ttl">TTL Expiring</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="score">Sort: Relevance Score</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-brand-600 shadow-subtle' : 'hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                  viewMode === 'list' ? 'bg-white text-brand-600 shadow-subtle' : 'hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            All Categories ({memories.length})
          </button>

          {Object.entries(CATEGORY_DEFINITIONS).map(([key, def]) => {
            const count = memories.filter((m) => m.category === key).length;
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${def.color} font-semibold ring-1 ring-brand-500/20`
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${def.dot}`} />
                <span>{def.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Results Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredMemories.length}</strong> of {memories.length} memories
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 4. Memories Presentation */}
      {filteredMemories.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                onSelect={() => openMemoryDetail(memory)}
              />
            ))}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredMemories.map((memory) => (
                <div
                  key={memory._id}
                  onClick={() => openMemoryDetail(memory)}
                  className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <CategoryBadge category={memory.category} />
                      <StatusBadge status={memory.status} expiresAt={memory.expires_at} />
                      <span className="text-[11px] text-slate-400 font-mono">
                        {memory.workspace}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {memory.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {memory.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-medium text-slate-700 block truncate max-w-[120px]">
                        {memory.source}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-brand-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No memories match your filter criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Try adjusting your search terms, changing the category filter, or logging a new decision.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => openAddModal()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle"
            >
              Log New Memory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
