// ============================================================
// Novel Forge - Chapter Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chapter, Volume } from "@/lib/types";

interface ChapterState {
  volumes: Volume[];
  chapters: Chapter[];
  currentChapterId: string | null;
  // Volume actions
  setVolumes: (volumes: Volume[]) => void;
  addVolume: (volume: Volume) => void;
  updateVolume: (id: string, updates: Partial<Volume>) => void;
  removeVolume: (id: string) => void;
  // Chapter actions
  setChapters: (chapters: Chapter[]) => void;
  addChapter: (chapter: Chapter) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  removeChapter: (id: string) => void;
  setCurrentChapter: (id: string | null) => void;
  getCurrentChapter: () => Chapter | undefined;
  getChaptersByVolume: (volumeId: string) => Chapter[];
  getVolumesByProject: (projectId: string) => Volume[];
}

export const useChapterStore = create<ChapterState>()(
  persist(
    (set, get) => ({
      volumes: [],
      chapters: [],
      currentChapterId: null,

      // Volume actions
      setVolumes: (volumes) => set({ volumes }),

      addVolume: (volume) =>
        set((state) => ({ volumes: [...state.volumes, volume] })),

      updateVolume: (id, updates) =>
        set((state) => ({
          volumes: state.volumes.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      removeVolume: (id) =>
        set((state) => ({
          volumes: state.volumes.filter((v) => v.id !== id),
          chapters: state.chapters.filter((c) => c.volume_id !== id),
        })),

      // Chapter actions
      setChapters: (chapters) => set({ chapters }),

      addChapter: (chapter) =>
        set((state) => ({ chapters: [...state.chapters, chapter] })),

      updateChapter: (id, updates) =>
        set((state) => ({
          chapters: state.chapters.map((c) =>
            c.id === id
              ? { ...c, ...updates, updated_at: new Date().toISOString() }
              : c
          ),
        })),

      removeChapter: (id) =>
        set((state) => ({
          chapters: state.chapters.filter((c) => c.id !== id),
          currentChapterId:
            state.currentChapterId === id ? null : state.currentChapterId,
        })),

      setCurrentChapter: (id) => set({ currentChapterId: id }),

      getCurrentChapter: () => {
        const state = get();
        return state.chapters.find((c) => c.id === state.currentChapterId);
      },

      getChaptersByVolume: (volumeId) => {
        return get()
          .chapters.filter((c) => c.volume_id === volumeId)
          .sort((a, b) => a.sort_order - b.sort_order);
      },

      getVolumesByProject: (projectId) => {
        return get()
          .volumes.filter((v) => v.project_id === projectId)
          .sort((a, b) => a.sort_order - b.sort_order);
      },
    }),
    {
      name: "novel-forge-chapters",
    }
  )
);
