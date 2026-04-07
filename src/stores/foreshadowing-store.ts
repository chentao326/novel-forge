// ============================================================
// Novel Forge - Foreshadowing Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ForeshadowingItem {
  id: string;
  project_id: string;
  chapter_id: string | null;
  description: string;
  is_resolved: boolean;
  resolved_chapter_id: string | null;
  created_at: string;
}

interface ForeshadowingState {
  items: ForeshadowingItem[];
  // Actions
  setItems: (items: ForeshadowingItem[]) => void;
  addItem: (item: ForeshadowingItem) => void;
  updateItem: (id: string, updates: Partial<ForeshadowingItem>) => void;
  removeItem: (id: string) => void;
  getItemsByProject: (projectId: string) => ForeshadowingItem[];
  getUnresolvedItems: (projectId: string) => ForeshadowingItem[];
  getResolvedItems: (projectId: string) => ForeshadowingItem[];
  getItemsByChapter: (chapterId: string) => ForeshadowingItem[];
  resolveItem: (id: string, resolvedChapterId: string) => void;
}

export const useForeshadowingStore = create<ForeshadowingState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      getItemsByProject: (projectId) => {
        return get().items.filter((i) => i.project_id === projectId);
      },

      getUnresolvedItems: (projectId) => {
        return get()
          .items.filter(
            (i) => i.project_id === projectId && !i.is_resolved
          );
      },

      getResolvedItems: (projectId) => {
        return get()
          .items.filter(
            (i) => i.project_id === projectId && i.is_resolved
          );
      },

      getItemsByChapter: (chapterId) => {
        return get().items.filter((i) => i.chapter_id === chapterId);
      },

      resolveItem: (id, resolvedChapterId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, is_resolved: true, resolved_chapter_id: resolvedChapterId }
              : i
          ),
        })),
    }),
    {
      name: "novel-forge-foreshadowing",
    }
  )
);
