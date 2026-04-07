// ============================================================
// Novel Forge - World Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorldSetting } from "@/lib/types";

interface WorldState {
  settings: WorldSetting[];
  // Actions
  setSettings: (settings: WorldSetting[]) => void;
  addSetting: (setting: WorldSetting) => void;
  updateSetting: (id: string, updates: Partial<WorldSetting>) => void;
  removeSetting: (id: string) => void;
  getSettingsByProject: (projectId: string) => WorldSetting[];
  getChildSettings: (parentId: string) => WorldSetting[];
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      settings: [],

      setSettings: (settings) => set({ settings }),

      addSetting: (setting) =>
        set((state) => ({ settings: [...state.settings, setting] })),

      updateSetting: (id, updates) =>
        set((state) => ({
          settings: state.settings.map((s) =>
            s.id === id
              ? { ...s, ...updates, updated_at: new Date().toISOString() }
              : s
          ),
        })),

      removeSetting: (id) =>
        set((state) => ({
          settings: state.settings.filter((s) => s.id !== id),
        })),

      getSettingsByProject: (projectId) => {
        return get().settings.filter((s) => s.project_id === projectId);
      },

      getChildSettings: (parentId) => {
        return get().settings.filter((s) => s.parent_id === parentId);
      },
    }),
    {
      name: "novel-forge-world",
    }
  )
);
