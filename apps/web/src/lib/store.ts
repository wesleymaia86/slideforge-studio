'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  currentWorkspaceId: string | null
  currentProjectId: string | null
  sidebarCollapsed: boolean
  setWorkspace: (id: string | null) => void
  setProject: (id: string | null) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      currentProjectId: null,
      sidebarCollapsed: false,
      setWorkspace: (id) => set({ currentWorkspaceId: id }),
      setProject: (id) => set({ currentProjectId: id }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    { name: 'slideforge-app' },
  ),
)
