// ============================================================
// Novel Forge - Character Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "@/lib/types";

interface CharacterState {
  characters: Character[];
  // Actions
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  getCharactersByProject: (projectId: string) => Character[];
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],

      setCharacters: (characters) => set({ characters }),

      addCharacter: (character) =>
        set((state) => ({ characters: [...state.characters, character] })),

      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id
              ? { ...c, ...updates, updated_at: new Date().toISOString() }
              : c
          ),
        })),

      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),

      getCharactersByProject: (projectId) => {
        return get().characters.filter((c) => c.project_id === projectId);
      },
    }),
    {
      name: "novel-forge-characters",
    }
  )
);
