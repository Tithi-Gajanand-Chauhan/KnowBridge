import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Search, 
  AlertOctagon, 
  Users, 
  Activity, 
  Settings, 
  Plus, 
  ChevronDown, 
  Database, 
  LogOut, 
  Check, 
  Sparkles,
  Zap,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_AVATAR } from '../services/avatars';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const { 
    workspace, 
    setWorkspace, 
    workspaces, 
    currentWorkspace, 
    openCreateWorkspaceModal, 
    deleteWorkspace,
    pendingConflictsCount, 
    openAddModal, 
    resetSeeds 
  } = useMemory();
  const { user, logout, availablePersonas, switchPersona } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Memory Explorer', path: '/app/explorer', icon: FolderKanban },
    { name: 'AI Memory Search', path: '/app/search', icon: Search, badge: 'Q&A' },
    { 
      name: 'Conflict Detection', 
      path: '/app/conflicts', 
      icon: AlertOctagon, 
      count: pendingConflictsCount,
      badgeColor: 'bg-rose-500 text-white'
    },
    { name: 'Team', path: '/app/team', icon: Users },
    { name: 'Activity Log', path: '/app/activity', icon: Activity },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const userWorkspaces = workspaces.filter((w) => !w.isDemo);
  const demoWorkspaces = workspaces.filter((w) => w.isDemo);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <NavLink to="/app" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-900 tracking-tight block leading-none">
                  KnowBridge
                </span>
                <span className="text-[10px] font-mono text-brand-600 font-semibold tracking-wider uppercase">
                  Agentic Memory
                </span>
              </div>
            </NavLink>
          </div>

          {/* Workspace Selector */}
          <div className="p-3">
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors text-left text-xs ${
                  !workspace
                    ? 'border-amber-300 bg-amber-50/60 hover:bg-amber-100/50'
                    : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                    !workspace ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <Database className={`w-3.5 h-3.5 ${!workspace ? 'text-amber-600' : 'text-brand-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-medium">
                      Workspace
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {currentWorkspace?.name || 'No Workspace Selected'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>

              {/* Workspace Dropdown */}
              {showWorkspaceMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-dropdown z-50 p-2 animate-slide-up max-h-80 overflow-y-auto">
                  {/* User Workspaces Section */}
                  {userWorkspaces.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Your Workspaces
                      </span>
                      {userWorkspaces.map((ws) => (
                        <div
                          key={ws.id}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors group ${
                            workspace === ws.id
                              ? 'bg-brand-50 text-brand-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setWorkspace(ws.id);
                              setShowWorkspaceMenu(false);
                            }}
                            className="flex-1 text-left truncate flex items-center gap-1.5 min-w-0"
                          >
                            <span className="truncate">{ws.name}</span>
                            {workspace === ws.id && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently delete workspace "${ws.name}"? All its decisions, rules, and teammates will be deleted.`)) {
                                deleteWorkspace(ws.id);
                              }
                            }}
                            title="Delete workspace"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 opacity-60 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Demo Workspaces Section */}
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Sample / Demo Workspaces
                    </span>
                    {demoWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setWorkspace(ws.id);
                          setShowWorkspaceMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          workspace === ws.id
                            ? 'bg-brand-50 text-brand-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {workspace === ws.id && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Create Workspace Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        openCreateWorkspaceModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Memory Action */}
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                openAddModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-subtle transition-all duration-150 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Decision / Memory</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 pt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                    <span>{item.name}</span>
                  </div>

                  {item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.count}
                    </span>
                  )}

                  {item.badge && !item.count && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-brand-50 text-brand-700 border border-brand-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Sample Seeds + Persona Switcher */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Quick Reset Demo button */}
          <button
            onClick={resetSeeds}
            title="Reset to default sample seed data"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Restore Demo Seeds</span>
          </button>

          {/* Persona Card */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user?.avatar?.includes('unsplash') ? DEFAULT_AVATAR : (user?.avatar || DEFAULT_AVATAR)}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate">
                    {user?.name || 'Soham'}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {user?.role || 'Frontend Lead'}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Switcher Dropdown */}
            {showPersonaMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-dropdown z-50 p-2 animate-slide-up space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Switch Demo Persona
                </span>
                {availablePersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                      user?.id === p.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                      <div className="truncate text-left">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="block text-[10px] text-slate-400 truncate">{p.role}</span>
                      </div>
                    </div>
                    {user?.id === p.id && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}

                <div className="pt-1 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
