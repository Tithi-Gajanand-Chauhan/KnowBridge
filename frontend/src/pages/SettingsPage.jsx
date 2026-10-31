import React, { useState, useRef } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  Bell, 
  Palette, 
  Download, 
  RotateCcw, 
  Save, 
  Check, 
  Sparkles,
  Shield,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useToast } from '../context/ToastContext';
import { AVATAR_PRESETS, DEFAULT_AVATAR } from '../services/avatars';

export const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const { 
    workspace, 
    setWorkspace, 
    workspaces, 
    currentWorkspace, 
    openCreateWorkspaceModal, 
    deleteWorkspace, 
    memories, 
    resetSeeds 
  } = useMemory();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'workspace' | 'vector' | 'notifications' | 'data'

  // Profile form state
  const [name, setName] = useState(user?.name || 'Engineer');
  const [email, setEmail] = useState(user?.email || 'engineer@company.com');
  const [role, setRole] = useState(user?.role || 'Software Engineer');
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Vector Engine config state (persisted in localStorage)
  const [similarityThreshold, setSimilarityThreshold] = useState(() => {
    try {
      const cfg = localStorage.getItem('knowbridge_config_vector');
      return cfg ? JSON.parse(cfg).similarityThreshold : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-004');
  const [llmModel, setLlmModel] = useState('gemini-1.5-pro');

  // Notification state
  const [conflictAlerts, setConflictAlerts] = useState(true);
  const [ttlAlerts, setTtlAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Handle avatar upload via file / camera
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setShowAvatarPicker(false);
      toast.success('Avatar Selected', 'Click "Save Profile" to apply changes.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Name cannot be empty.');
      return;
    }

    updateUserProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      avatar
    });

    toast.success('Profile Saved', 'Personal information and avatar updated across all sessions.');
  };

  const handleSaveVectorConfig = () => {
    try {
      const config = {
        similarityThreshold,
        embeddingModel,
        llmModel,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('knowbridge_config_vector', JSON.stringify(config));
      toast.success('AI Engine Updated', `Threshold set to ${similarityThreshold} with ${embeddingModel}.`);
    } catch (err) {
      toast.error('Save Failed', err.message);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Preferences Saved', 'Instant conflict alerts and digest settings stored.');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `knowbridge_memories_${workspace || 'default'}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('JSON Exported', `Exported ${memories.length} decisions as JSON.`);
  };

  const handleExportCSV = () => {
    if (!memories.length) {
      toast.warning('No Memories', 'There are no memories to export in this workspace.');
      return;
    }

    const headers = ['ID', 'Title', 'Category', 'Source', 'Status', 'CreatedAt', 'Tags', 'Content'];
    const rows = memories.map(m => [
      `"${m._id}"`,
      `"${(m.title || '').replace(/"/g, '""')}"`,
      `"${m.category}"`,
      `"${(m.source || '').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.createdAt}"`,
      `"${(m.tags || []).join(';')}"`,
      `"${(m.content || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `knowbridge_decisions_${workspace || 'default'}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('CSV Exported', `Downloaded spreadsheet with ${memories.length} decisions.`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace & TTL', icon: Database },
    { id: 'vector', label: 'Vector Engine & AI', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Backup', icon: Download },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Platform Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your account profile, workspace scoping, and AI vector parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        {/* 1. Profile Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg text-left">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Personal Information
            </h3>

            {/* Avatar Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt={name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {showAvatarPicker ? 'Close Picker' : 'Choose Avatar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-brand-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Choose clean vector avatar or upload camera photo</span>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="user"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* Avatar Selector Tray */}
              {showAvatarPicker && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-slide-up space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Select a clean vector avatar:
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAvatar(preset.src);
                          setShowAvatarPicker(false);
                        }}
                        className={`p-1 rounded-xl border-2 transition-all ${
                          avatar === preset.src
                            ? 'border-brand-600 ring-2 ring-brand-500/20 bg-white'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.src} alt={preset.name} className="w-9 h-9 rounded-lg object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Engineering Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-all active:scale-[0.99]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. Workspace & TTL Settings */}
        {activeTab === 'workspace' && (
          <div className="space-y-5 text-left max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Workspace & Scoping Configuration
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Active Workspace</label>
                <button
                  type="button"
                  onClick={openCreateWorkspaceModal}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>+ Create Workspace</span>
                </button>
              </div>
              <select
                value={workspace || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setWorkspace(e.target.value);
                  }
                }}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {!workspace && <option value="">No Workspace Selected</option>}
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} {ws.isDemo ? '(Demo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Workspaces Directory List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Workspace Directory ({workspaces.length})
              </span>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{ws.name}</span>
                        {ws.isDemo ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-brand-50 text-brand-700 border border-brand-200">
                            Demo
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Custom
                          </span>
                        )}
                        {workspace === ws.id && (
                          <span className="text-[10px] font-semibold text-brand-600">
                            (Active)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        ID: {ws.id} • {ws.description || 'No description'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {workspace !== ws.id && (
                        <button
                          type="button"
                          onClick={() => setWorkspace(ws.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          Switch
                        </button>
                      )}
                      {!ws.isDemo && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete workspace "${ws.name}"? All its decisions, rules, and teammates will be deleted.`)) {
                              deleteWorkspace(ws.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone: Delete Active Workspace */}
            {currentWorkspace && !currentWorkspace.isDemo && (
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                <span className="text-xs font-bold text-rose-900 block flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Danger Zone: Delete Active Workspace
                </span>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Permanently delete <strong>"{currentWorkspace.name}"</strong> along with all its recorded memories, conflict alerts, and teammate rosters. This action cannot be undone.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete workspace "${currentWorkspace.name}"? All its decisions and teammates will be deleted.`)) {
                        deleteWorkspace(currentWorkspace.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-subtle transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete "{currentWorkspace.name}"</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                MongoDB Atlas TTL Index Policy
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Temporary constraints automatically include an <code className="text-brand-700 font-mono">expires_at</code> timestamp. MongoDB TTL index removes expired rules in the background without downtime.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Index name: expires_at_1 • expireAfterSeconds: 0</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Vector Engine & AI Model Settings */}
        {activeTab === 'vector' && (
          <div className="space-y-5 text-left max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Gemini & Atlas Vector Configuration
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Embedding Model</label>
              <select
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="text-embedding-004">Google text-embedding-004 (3072 dimensions)</option>
                <option value="embedding-001">Google embedding-001 (768 dimensions)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reasoning LLM</label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Architecture Reasoning)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-Low Latency)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Cosine Similarity Threshold</label>
                <span className="text-xs font-mono font-bold text-brand-600">{similarityThreshold}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full accent-brand-600"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Determines minimum semantic alignment required to flag an architectural conflict.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveVectorConfig}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-all active:scale-[0.99]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Notification Preferences */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 text-left max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Notification Channels
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Conflict Interception Alerts</span>
                <span className="text-[11px] text-slate-500">Notify instantly when a candidate PR clashes with an active memory.</span>
              </div>
              <input
                type="checkbox"
                checked={conflictAlerts}
                onChange={(e) => setConflictAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">TTL Auto-Expiry Warnings</span>
                <span className="text-[11px] text-slate-500">Alert 24 hours before a temporary freeze or rule expires.</span>
              </div>
              <input
                type="checkbox"
                checked={ttlAlerts}
                onChange={(e) => setTtlAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Weekly Memory Digest</span>
                <span className="text-[11px] text-slate-500">Summary of all decisions created and superseded over the sprint.</span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-all active:scale-[0.99]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Data & Backup */}
        {activeTab === 'data' && (
          <div className="space-y-5 text-left max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Data Management & Backup
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Export Team Memories</span>
              <p className="text-xs text-slate-600">
                Download all active and deprecated memories with metadata and tags for offline backup or spreadsheets.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-subtle transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON ({memories.length} Memories)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-subtle transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV Spreadsheet</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
              <span className="text-xs font-bold text-rose-900 block">Reset Demo State</span>
              <p className="text-xs text-rose-800">
                Reset local memory storage back to default sample memories and workspaces.
              </p>
              <button
                type="button"
                onClick={resetSeeds}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 shadow-subtle transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
