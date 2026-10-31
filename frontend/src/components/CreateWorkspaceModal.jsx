import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Layers, 
  Users, 
  Building2,
  Loader2 
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CreateWorkspaceModal = () => {
  const { isCreateWorkspaceModalOpen, closeCreateWorkspaceModal, createWorkspace } = useMemory();
  const { user } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Core Engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateWorkspaceModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Workspace name must be at least 2 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createWorkspace({
        name: name.trim(),
        description: description.trim() || `${category} decisions and architectural rules.`
      });
      setName('');
      setDescription('');
      closeCreateWorkspaceModal();
    } catch (err) {
      console.error(err);
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-dropdown overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Create Team Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up an isolated shared memory workspace for your team's decisions.
              </p>
            </div>
          </div>

          <button
            onClick={closeCreateWorkspaceModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Workspace Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Justin's Team or Platform Infrastructure"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              autoFocus
              required
            />
          </div>

          {/* Department / Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engineering Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="Core Engineering">Core Engineering</option>
              <option value="Frontend Architecture">Frontend Architecture</option>
              <option value="Backend & APIs">Backend & APIs</option>
              <option value="Payments & Billing">Payments & Billing</option>
              <option value="Mobile Engineering">Mobile Engineering</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this workspace's scope, services, or repository..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Workspace Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Workspace Scope Preview
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Database className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <span className="font-bold text-slate-800">
                  {name.trim() || "Your Workspace"}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Clean (0 Memories)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Created by {user?.name || 'You'} • Isolated MongoDB vector namespace
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeCreateWorkspaceModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
