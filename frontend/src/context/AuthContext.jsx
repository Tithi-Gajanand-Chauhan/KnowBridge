import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEAM_MEMBERS } from '../services/mockData';
import { DEFAULT_AVATAR } from '../services/avatars';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'knowbridge_auth_user';
const USERS_REGISTRY_KEY = 'knowbridge_users_registry';

// Helper to access persistent accounts registry
function getUsersRegistry() {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to persist user account state
function saveUserToRegistry(userData) {
  if (!userData?.email) return;
  try {
    const registry = getUsersRegistry();
    registry[userData.email.toLowerCase().trim()] = {
      ...userData,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to save user in registry:', err);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default: Unauthenticated so visitors land on the homepage/login portal
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(user));
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      saveUserToRegistry(user);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  }, [user]);

  // Clean name formatter from email (e.g. "alex.smith@company.com" -> "Alex Smith")
  const formatNameFromEmail = (email) => {
    const rawName = email.split('@')[0] || 'Engineer';
    return rawName
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || 'Engineer';
  };

  const login = (email, password, remember = true) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check if matching predefined demo persona in TEAM_MEMBERS
    const found = TEAM_MEMBERS.find((m) => m.email.toLowerCase() === trimmedEmail);
    if (found) {
      const demoUser = {
        ...found,
        activeWorkspace: 'default',
        workspaces: ['default', 'payments-core', 'mobile-app'],
        isDemo: true
      };
      setUser(demoUser);
      setIsFirstLogin(false);
      return { success: true, user: demoUser, isNew: false };
    }

    // 2. Check if this user has already registered or logged in previously
    const registry = getUsersRegistry();
    const existing = registry[trimmedEmail];
    if (existing) {
      // Restore their saved workspace and workspaces list
      let userActiveWorkspace = existing.activeWorkspace || null;
      let userWorkspaces = existing.workspaces || [];

      // Scan localStorage for any workspaces created by this user
      try {
        const rawWs = localStorage.getItem('knowbridge_workspaces');
        if (rawWs) {
          const allWs = JSON.parse(rawWs);
          const owned = allWs.filter(
            (w) => !w.isDemo && (w.owner === existing.id || w.ownerName === existing.name || (existing.workspaces && existing.workspaces.includes(w.id)))
          );
          if (owned.length > 0) {
            const ownedIds = owned.map((w) => w.id);
            userWorkspaces = Array.from(new Set([...userWorkspaces, ...ownedIds]));
            if (!userActiveWorkspace || !ownedIds.includes(userActiveWorkspace)) {
              userActiveWorkspace = ownedIds[ownedIds.length - 1]; // Restore their latest workspace
            }
          }
        }
      } catch (err) {
        console.error(err);
      }

      const restoredUser = {
        ...existing,
        activeWorkspace: userActiveWorkspace,
        workspaces: userWorkspaces,
        status: 'online'
      };

      setUser(restoredUser);
      saveUserToRegistry(restoredUser);
      setIsFirstLogin(false);
      return { success: true, user: restoredUser, isNew: false };
    }

    // 3. New user logging in fresh for the very first time
    const displayName = formatNameFromEmail(trimmedEmail);
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'KB';

    const newUser = {
      id: `user_${Date.now()}`,
      name: displayName,
      role: 'Software Engineer',
      email: trimmedEmail,
      avatar: DEFAULT_AVATAR,
      initials,
      color: 'bg-indigo-600',
      contributions: 0,
      memoriesLogged: 0,
      conflictsResolved: 0,
      queriesRun: 0,
      status: 'online',
      badges: ['New Member', 'Verified Engineer'],
      joinedAt: new Date().toISOString(),
      activeWorkspace: null, // First time: starts with no workspace so they can create or pick one!
      workspaces: [],
      isDemo: false
    };

    saveUserToRegistry(newUser);
    setUser(newUser);
    setIsFirstLogin(true);
    return { success: true, user: newUser, isNew: true };
  };

  const register = ({ name, email, role, password, invitedWorkspace }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'KB';

    const registry = getUsersRegistry();
    const existing = registry[trimmedEmail];

    const newUser = {
      id: existing?.id || `user_${Date.now()}`,
      name: name.trim(),
      role: role || 'Software Engineer',
      email: trimmedEmail,
      avatar: existing?.avatar || DEFAULT_AVATAR,
      initials,
      color: 'bg-indigo-600',
      contributions: existing?.contributions || 0,
      memoriesLogged: existing?.memoriesLogged || 0,
      conflictsResolved: existing?.conflictsResolved || 0,
      queriesRun: existing?.queriesRun || 0,
      status: 'online',
      badges: ['New Joiner', 'Core Engineer'],
      joinedAt: existing?.joinedAt || new Date().toISOString(),
      activeWorkspace: invitedWorkspace || existing?.activeWorkspace || null,
      workspaces: invitedWorkspace 
        ? Array.from(new Set([...(existing?.workspaces || []), invitedWorkspace]))
        : (existing?.workspaces || []),
      isDemo: false
    };

    saveUserToRegistry(newUser);
    setUser(newUser);
    setIsFirstLogin(!existing);
    return { success: true, user: newUser, isNew: !existing };
  };

  const updateUserProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updates
      };
      saveUserToRegistry(updated);
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false);
  };

  const dismissFirstLogin = () => {
    setIsFirstLogin(false);
  };

  const setUserActiveWorkspace = (workspaceId) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedWorkspaces = Array.isArray(prev.workspaces)
        ? Array.from(new Set([...prev.workspaces, workspaceId]))
        : [workspaceId];
      const updated = {
        ...prev,
        activeWorkspace: workspaceId,
        workspaces: updatedWorkspaces
      };
      saveUserToRegistry(updated);
      return updated;
    });
  };

  const removeUserWorkspace = (workspaceId) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedWorkspaces = (prev.workspaces || []).filter((id) => id !== workspaceId);
      const updatedActive = prev.activeWorkspace === workspaceId
        ? (updatedWorkspaces[updatedWorkspaces.length - 1] || null)
        : prev.activeWorkspace;
      const updated = {
        ...prev,
        activeWorkspace: updatedActive,
        workspaces: updatedWorkspaces
      };
      saveUserToRegistry(updated);
      return updated;
    });
  };

  const switchPersona = (memberId) => {
    const member = TEAM_MEMBERS.find((m) => m.id === memberId);
    if (member) {
      const demoUser = {
        ...member,
        activeWorkspace: 'default',
        workspaces: ['default', 'payments-core', 'mobile-app'],
        isDemo: true
      };
      setUser(demoUser);
      setIsFirstLogin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isFirstLogin,
        dismissFirstLogin,
        login,
        register,
        logout,
        switchPersona,
        updateUserProfile,
        setUserActiveWorkspace,
        removeUserWorkspace,
        availablePersonas: TEAM_MEMBERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
