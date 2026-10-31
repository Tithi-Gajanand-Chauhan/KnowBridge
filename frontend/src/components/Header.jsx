import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Header = ({ onOpenMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAddModal, workspace, pendingConflictsCount } = useMemory();
  const { user } = useAuth();
  const toast = useToast();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/app/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Page title mapping
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/app':
        return { title: 'Dashboard', subtitle: 'Autonomous team memory overview & health' };
      case '/app/explorer':
        return { title: 'Memory Explorer', subtitle: 'Search, filter, and inspect verified decisions' };
      case '/app/search':
        return { title: 'AI Memory Search', subtitle: 'Grounded question answering with memory citations' };
      case '/app/conflicts':
        return { title: 'Conflict Detection', subtitle: 'Review and resolve contradictory architecture proposals' };
      case '/app/team':
        return { title: 'Team & Contributors', subtitle: 'Engineering team members and knowledge activity' };
      case '/app/activity':
        return { title: 'Activity Audit Log', subtitle: 'Complete chronological history of decisions and Q&A' };
      case '/app/settings':
        return { title: 'Settings', subtitle: 'Configure vector models, TTL rules, and workspace preferences' };
      default:
        return { title: 'KnowBridge', subtitle: 'Persistent Team Memory' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {pageInfo.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Global Quick Search Input Trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <div
          onClick={() => navigate('/app/search')}
          className="group flex items-center justify-between w-full px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-all text-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
            <Search className="w-3.5 h-3.5" />
            <span className="truncate">Ask AI anything or search decisions...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Engine Status Pill + Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend & Vector Status Indicator */}
        <div 
          title="MongoDB Atlas Vector Search with Gemini 3072-dim embeddings"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Atlas Vector Ready</span>
        </div>

        {/* Notifications / Conflicts Alert */}
        <button
          onClick={() => {
            if (pendingConflictsCount > 0) {
              navigate('/app/conflicts');
            } else {
              toast.info('Notifications', 'All systems aligned • Zero active contradictions detected.');
            }
          }}
          title={pendingConflictsCount > 0 ? `${pendingConflictsCount} pending conflicts flagged` : 'Zero active contradictions'}
          className={`p-2 rounded-xl relative border transition-colors ${
            pendingConflictsCount > 0
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          {pendingConflictsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Quick Log Decision Button */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Memory</span>
        </button>
      </div>
    </header>
  );
};
