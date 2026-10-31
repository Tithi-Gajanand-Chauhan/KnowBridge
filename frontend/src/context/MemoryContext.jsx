import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const MemoryContext = createContext(null);

export const MemoryProvider = ({ children }) => {
  const toast = useToast();
  const { user, setUserActiveWorkspace, removeUserWorkspace } = useAuth();

  // Workspaces state
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(() => {
    if (user?.activeWorkspace) return user.activeWorkspace;
    if (user?.isDemo) return 'default';
    return null; // Brand new users start with NO workspace
  });

  // Memories, conflicts, activities, and team members
  const [memories, setMemories] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [prefilledAddData, setPrefilledAddData] = useState(null);

  // Sync workspace if user activeWorkspace changes (e.g. login or persona switch)
  useEffect(() => {
    if (user?.activeWorkspace) {
      setWorkspace(user.activeWorkspace);
    } else if (user && !user.activeWorkspace && !user.isDemo) {
      // Check if user has existing workspaces they previously created
      const userOwned = workspaces.filter(
        (w) => !w.isDemo && (w.owner === user.id || w.ownerName === user.name || (user.workspaces && user.workspaces.includes(w.id)))
      );
      if (userOwned.length > 0) {
        const lastWs = userOwned[userOwned.length - 1];
        setWorkspace(lastWs.id);
        if (setUserActiveWorkspace) setUserActiveWorkspace(lastWs.id);
      } else {
        setWorkspace(null); // Truly new user with no workspace created yet
      }
    }
  }, [user?.activeWorkspace, user?.isDemo, user?.id, user?.name, user?.workspaces, workspaces, setUserActiveWorkspace]);

  // Load workspaces list (strictly isolated by logged-in user email)
  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await api.getWorkspaces(user?.email);
      if (res.success) {
        setWorkspaces(res.data);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Fetch memory data strictly for active workspace
  const loadData = useCallback(async () => {
    if (!workspace) {
      // User has no workspace selected yet
      setMemories([]);
      setConflicts([]);
      setTeamMembers(user ? [user] : []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [memRes, confRes, actRes, teamRes] = await Promise.all([
        api.getMemories({ workspace }),
        api.getConflicts(workspace),
        api.getActivityLog(workspace),
        api.getTeamMembers(workspace, user)
      ]);

      if (memRes.success) setMemories(memRes.data);
      if (confRes.success) setConflicts(confRes.data);
      if (actRes.success) setActivities(actRes.data);
      if (teamRes.success) setTeamMembers(teamRes.data);
    } catch (err) {
      console.error('Error loading memory data:', err);
      setError(err.message || 'Failed to load team memories');
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute pending conflicts count
  const pendingConflictsCount = conflicts.filter((c) => c.status === 'pending').length;

  // Active workspace object
  const currentWorkspace = workspaces.find((w) => w.id === workspace) || null;

  // Create Workspace
  const handleCreateWorkspace = async ({ name, description }) => {
    try {
      const res = await api.createWorkspace({
        name,
        description,
        owner: user?.id || 'user_owner',
        ownerName: user?.name || 'Engineer',
        ownerEmail: user?.email || ''
      });

      if (res.success) {
        const newWs = res.data;
        setWorkspaces((prev) => [...prev, newWs]);
        setWorkspace(newWs.id);
        if (setUserActiveWorkspace) {
          setUserActiveWorkspace(newWs.id);
        }

        toast.success(
          'Workspace Created',
          `"${newWs.name}" is ready. It starts completely clean with 0 memories.`
        );

        return { success: true, workspace: newWs };
      }
    } catch (err) {
      toast.error('Failed to create workspace', err.message);
      throw err;
    }
  };

  // Delete Workspace
  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      const targetWs = workspaces.find((w) => w.id === workspaceId);
      if (targetWs?.isDemo) {
        toast.warning('Protected Workspace', 'Core demo workspaces cannot be deleted.');
        return { success: false };
      }

      const res = await api.deleteWorkspace(workspaceId, user?.name);
      if (res.success) {
        setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));

        if (removeUserWorkspace) {
          removeUserWorkspace(workspaceId);
        }

        // If the deleted workspace was currently active, switch to next available or null
        if (workspace === workspaceId) {
          const remainingCustom = workspaces.filter((w) => w.id !== workspaceId && !w.isDemo);
          if (remainingCustom.length > 0) {
            handleSwitchWorkspace(remainingCustom[remainingCustom.length - 1].id);
          } else {
            setWorkspace(null);
          }
        }

        toast.info(
          'Workspace Deleted',
          `"${res.deletedWorkspaceName || 'Workspace'}" and its memories have been permanently deleted.`
        );
        return { success: true };
      } else {
        toast.error('Deletion Failed', res.error || 'Could not delete workspace.');
        return { success: false };
      }
    } catch (err) {
      toast.error('Failed to delete workspace', err.message);
      throw err;
    }
  };

  // Switch Workspace
  const handleSwitchWorkspace = (newWorkspaceId) => {
    setWorkspace(newWorkspaceId);
    if (setUserActiveWorkspace) {
      setUserActiveWorkspace(newWorkspaceId);
    }
    const wsObj = workspaces.find((w) => w.id === newWorkspaceId);
    toast.info('Workspace Switched', `Active workspace: ${wsObj?.name || newWorkspaceId}`);
  };

  // Add Memory
  const handleSaveMemory = async (memoryPayload) => {
    if (!workspace) {
      toast.warning('No Workspace', 'Please create or select a workspace first.');
      return { success: false };
    }

    try {
      const payloadWithUser = {
        ...memoryPayload,
        source: memoryPayload.source || `${user?.name} (${user?.role})` || 'Justin (Software Engineer)',
        workspace: memoryPayload.workspace || workspace
      };

      const res = await api.saveMemory(payloadWithUser);
      if (res.success) {
        setMemories((prev) => [res.data, ...prev]);
        toast.success(
          'Memory Preserved',
          `"${res.data.title}" saved to team memory & vector indexed.`
        );
        const actRes = await api.getActivityLog(workspace);
        if (actRes.success) setActivities(actRes.data);
        return { success: true, memory: res.data };
      }
    } catch (err) {
      toast.error('Failed to save memory', err.message);
      return { success: false, error: err.message };
    }
  };

  // Pre-save conflict check
  const handleCheckConflict = async ({ title, content }) => {
    try {
      const res = await api.checkConflict({ title, content, workspace: workspace || 'default' });
      return res.data;
    } catch (err) {
      console.error('Conflict pre-check error:', err);
      return { hasConflict: false };
    }
  };

  // Supersede memory
  const handleSupersedeMemory = async (oldMemoryId, newMemoryPayload) => {
    try {
      const payloadWithUser = {
        ...newMemoryPayload,
        source: newMemoryPayload.source || `${user?.name} (${user?.role})` || 'Justin',
        workspace: newMemoryPayload.workspace || workspace || 'default'
      };

      const res = await api.supersedeMemory(oldMemoryId, payloadWithUser);
      if (res.success) {
        await loadData();
        toast.success(
          'Decision Superseded',
          `Historical decision archived and linked to new standard.`
        );
        return { success: true, data: res.data };
      }
    } catch (err) {
      toast.error('Supersede failed', err.message);
      return { success: false, error: err.message };
    }
  };

  // Resolve conflict
  const handleResolveConflict = async (conflictId, action) => {
    try {
      const res = await api.resolveConflict(conflictId, action);
      if (res.success) {
        await loadData();
        const actionLabels = {
          supersede: 'Superseded previous rule with proposed decision.',
          reject: 'Rejected candidate proposal to protect standard.',
          exception: 'Recorded scoped architectural exception.'
        };
        toast.success('Conflict Resolved', actionLabels[action] || 'Conflict state updated.');
        return { success: true };
      }
    } catch (err) {
      toast.error('Conflict resolution failed', err.message);
      return { success: false, error: err.message };
    }
  };

  // Extract from text
  const handleExtractFromText = async (text, source) => {
    try {
      const res = await api.extractMemoriesFromText(
        text,
        source || `${user?.name} (${user?.role})`
      );
      return res;
    } catch (err) {
      toast.error('Extraction failed', err.message);
      throw err;
    }
  };

  // Ask Question
  const handleAskQuestion = async (question) => {
    try {
      const res = await api.askQuestion(question, workspace || 'default');
      const actRes = await api.getActivityLog(workspace || 'default');
      if (actRes.success) setActivities(actRes.data);
      return res.data;
    } catch (err) {
      toast.error('Query failed', err.message);
      throw err;
    }
  };

  // Add Teammate to active workspace
  const handleAddTeamMember = async (memberData) => {
    try {
      const res = await api.addTeamMember(workspace, memberData, user?.name);
      if (res.success) {
        setTeamMembers((prev) => [...prev, res.data]);
        await loadWorkspaces();
        const actRes = await api.getActivityLog(workspace);
        if (actRes.success) setActivities(actRes.data);
        toast.success(
          'Teammate Added',
          `"${res.data.name}" joined ${currentWorkspace?.name || 'the workspace'}!`
        );
        return { success: true, member: res.data };
      }
    } catch (err) {
      toast.error('Failed to add teammate', err.message);
      throw err;
    }
  };

  // Remove Teammate from workspace
  const handleRemoveTeamMember = async (memberId) => {
    try {
      const res = await api.removeTeamMember(workspace, memberId, user?.name);
      if (res.success) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
        await loadWorkspaces();
        const actRes = await api.getActivityLog(workspace);
        if (actRes.success) setActivities(actRes.data);
        toast.info('Teammate Removed', 'Teammate removed from this workspace.');
        return { success: true };
      }
    } catch (err) {
      toast.error('Failed to remove teammate', err.message);
      throw err;
    }
  };

  // Modal helpers
  const openMemoryDetail = (memory) => {
    setSelectedMemory(memory);
    setIsDetailModalOpen(true);
  };

  const closeMemoryDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedMemory(null);
  };

  const openAddModal = (initialData = null) => {
    if (!workspace) {
      toast.warning('No Workspace', 'Please create or join a workspace first.');
      setIsCreateWorkspaceModalOpen(true);
      return;
    }
    setPrefilledAddData(initialData);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setPrefilledAddData(null);
  };

  const openCreateWorkspaceModal = () => setIsCreateWorkspaceModalOpen(true);
  const closeCreateWorkspaceModal = () => setIsCreateWorkspaceModalOpen(false);

  // Reset demo seeds
  const handleResetSeeds = async () => {
    api.resetToSeedData();
    await loadWorkspaces();
    setWorkspace('default');
    if (setUserActiveWorkspace) setUserActiveWorkspace('default');
    await loadData();
    toast.info('Data Reset', 'Restored default sample memories and demo workspaces.');
  };

  return (
    <MemoryContext.Provider
      value={{
        workspaces,
        workspace,
        setWorkspace: handleSwitchWorkspace,
        currentWorkspace,
        createWorkspace: handleCreateWorkspace,
        deleteWorkspace: handleDeleteWorkspace,
        memories,
        conflicts,
        pendingConflictsCount,
        activities,
        teamMembers,
        addTeamMember: handleAddTeamMember,
        removeTeamMember: handleRemoveTeamMember,
        loading,
        error,
        refresh: loadData,
        saveMemory: handleSaveMemory,
        checkConflict: handleCheckConflict,
        supersedeMemory: handleSupersedeMemory,
        resolveConflict: handleResolveConflict,
        extractFromText: handleExtractFromText,
        askQuestion: handleAskQuestion,
        // Modal states
        isAddModalOpen,
        openAddModal,
        closeAddModal,
        prefilledAddData,
        selectedMemory,
        isDetailModalOpen,
        openMemoryDetail,
        closeMemoryDetail,
        isCreateWorkspaceModalOpen,
        openCreateWorkspaceModal,
        closeCreateWorkspaceModal,
        resetSeeds: handleResetSeeds
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
