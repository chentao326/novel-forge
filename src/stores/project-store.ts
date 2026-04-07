// ============================================================
// Novel Forge - Project Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/lib/types";

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId:
            state.currentProjectId === id ? null : state.currentProjectId,
        })),

      setCurrentProject: (id) => set({ currentProjectId: id }),

      getCurrentProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.currentProjectId);
      },
    }),
    {
      name: "novel-forge-projects",
    }
  )
);
