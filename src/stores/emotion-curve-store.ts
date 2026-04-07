// ============================================================
// Novel Forge - Emotion Curve Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EmotionPoint {
  id: string;
  position: number; // 0-100, story position percentage
  intensity: number; // -5 to +5
  label: string; // e.g. "主角觉醒", "第一次失败"
}

export interface EmotionCurve {
  project_id: string;
  points: EmotionPoint[];
  template: string | null; // which template was used as base
}

interface EmotionCurveState {
  curves: Record<string, EmotionCurve>; // keyed by project_id
  // Actions
  getCurve: (projectId: string) => EmotionCurve | undefined;
  setCurve: (projectId: string, curve: EmotionCurve) => void;
  setPoints: (projectId: string, points: EmotionPoint[]) => void;
  setTemplate: (projectId: string, template: string | null) => void;
  addPoint: (projectId: string, point: EmotionPoint) => void;
  updatePoint: (projectId: string, pointId: string, updates: Partial<EmotionPoint>) => void;
  removePoint: (projectId: string, pointId: string) => void;
  clearCurve: (projectId: string) => void;
}

function generateId(): string {
  return `ep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultCurve(projectId: string): EmotionCurve {
  return {
    project_id: projectId,
    points: [],
    template: null,
  };
}

export const useEmotionCurveStore = create<EmotionCurveState>()(
  persist(
    (set, get) => ({
      curves: {},

      getCurve: (projectId) => {
        return get().curves[projectId];
      },

      setCurve: (projectId, curve) =>
        set((state) => ({
          curves: { ...state.curves, [projectId]: curve },
        })),

      setPoints: (projectId, points) =>
        set((state) => {
          const existing = state.curves[projectId] || getDefaultCurve(projectId);
          return {
            curves: {
              ...state.curves,
              [projectId]: { ...existing, points },
            },
          };
        }),

      setTemplate: (projectId, template) =>
        set((state) => {
          const existing = state.curves[projectId] || getDefaultCurve(projectId);
          return {
            curves: {
              ...state.curves,
              [projectId]: { ...existing, template },
            },
          };
        }),

      addPoint: (projectId, point) =>
        set((state) => {
          const existing = state.curves[projectId] || getDefaultCurve(projectId);
          const newPoint = { ...point, id: point.id || generateId() };
          const points = [...existing.points, newPoint].sort(
            (a, b) => a.position - b.position
          );
          return {
            curves: {
              ...state.curves,
              [projectId]: { ...existing, points },
            },
          };
        }),

      updatePoint: (projectId, pointId, updates) =>
        set((state) => {
          const existing = state.curves[projectId];
          if (!existing) return state;
          const points = existing.points
            .map((p) => (p.id === pointId ? { ...p, ...updates } : p))
            .sort((a, b) => a.position - b.position);
          return {
            curves: {
              ...state.curves,
              [projectId]: { ...existing, points },
            },
          };
        }),

      removePoint: (projectId, pointId) =>
        set((state) => {
          const existing = state.curves[projectId];
          if (!existing) return state;
          return {
            curves: {
              ...state.curves,
              [projectId]: {
                ...existing,
                points: existing.points.filter((p) => p.id !== pointId),
              },
            },
          };
        }),

      clearCurve: (projectId) =>
        set((state) => {
          const newCurves = { ...state.curves };
          delete newCurves[projectId];
          return { curves: newCurves };
        }),
    }),
    {
      name: "novel-forge-emotion-curves",
    }
  )
);
