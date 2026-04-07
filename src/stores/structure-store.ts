import { create } from 'zustand'
import type { StoryStructure, SnowflakeStep } from '@/lib/types'

interface StructureStore {
  currentStructure: StoryStructure | null
  snowflakeData: SnowflakeStep
  setCurrentStructure: (structure: StoryStructure | null) => void
  updateSnowflakeStep: (step: Partial<SnowflakeStep>) => void
  resetSnowflakeData: () => void
}

const initialSnowflakeData: SnowflakeStep = {
  step: 1,
  one_liner: null,
  paragraph: null,
  character_summaries: null,
  act_outlines: null,
  character_details: null,
  chapter_outlines: null,
  scene_list: null,
}

export const useStructureStore = create<StructureStore>((set) => ({
  currentStructure: null,
  snowflakeData: { ...initialSnowflakeData },

  setCurrentStructure: (structure) => set({ currentStructure: structure }),

  updateSnowflakeStep: (step) =>
    set((state) => ({
      snowflakeData: { ...state.snowflakeData, ...step },
    })),

  resetSnowflakeData: () => set({ snowflakeData: { ...initialSnowflakeData } }),
}))
