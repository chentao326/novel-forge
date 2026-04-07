// ============================================================
// Novel Forge - Character Relationship Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CharacterRelationship {
  id: string;
  project_id: string;
  character_a_id: string;
  character_b_id: string;
  type: string; // e.g. '师徒', '恋人', '宿敌', '朋友', '亲人', '同盟', '对手'
  description: string;
  dynamics: string; // e.g. '权力失衡', '互相依赖'
  evolution: string; // how it changes over the story
}

interface RelationshipState {
  relationships: CharacterRelationship[];
  // Actions
  setRelationships: (relationships: CharacterRelationship[]) => void;
  addRelationship: (relationship: CharacterRelationship) => void;
  updateRelationship: (id: string, updates: Partial<CharacterRelationship>) => void;
  removeRelationship: (id: string) => void;
  getRelationshipsByProject: (projectId: string) => CharacterRelationship[];
  getRelationshipsForCharacter: (characterId: string) => CharacterRelationship[];
  getRelationshipBetween: (characterAId: string, characterBId: string) => CharacterRelationship | undefined;
}

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set, get) => ({
      relationships: [],

      setRelationships: (relationships) => set({ relationships }),

      addRelationship: (relationship) =>
        set((state) => ({
          relationships: [...state.relationships, relationship],
        })),

      updateRelationship: (id, updates) =>
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeRelationship: (id) =>
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        })),

      getRelationshipsByProject: (projectId) => {
        return get().relationships.filter((r) => r.project_id === projectId);
      },

      getRelationshipsForCharacter: (characterId) => {
        return get().relationships.filter(
          (r) => r.character_a_id === characterId || r.character_b_id === characterId
        );
      },

      getRelationshipBetween: (characterAId, characterBId) => {
        return get().relationships.find(
          (r) =>
            (r.character_a_id === characterAId && r.character_b_id === characterBId) ||
            (r.character_a_id === characterBId && r.character_b_id === characterAId)
        );
      },
    }),
    {
      name: "novel-forge-relationships",
    }
  )
);
