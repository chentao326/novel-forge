// ============================================================
// Novel Forge - Settings Store (Zustand)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppSettings {
  // AI
  defaultProvider: "deepseek" | "qwen" | "openai" | "anthropic";
  deepseekApiKey: string;
  qwenApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  brainstormModel: string;
  continueModel: string;
  analyzeModel: string;
  temperature: number;
  maxTokens: number;
  // Writing
  defaultGenre: string;
  defaultFramework: string;
  autoSaveInterval: number;
  editorFontSize: "small" | "medium" | "large";
  editorLineHeight: number;
  showWordCount: boolean;
  showCharCount: boolean;
  // Export
  defaultExportFormat: "txt" | "markdown" | "html";
  defaultAuthorName: string;
  includeChapterTitles: boolean;
  customExportCss: string;
}

interface SettingsState extends AppSettings {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  // AI
  defaultProvider: "deepseek",
  deepseekApiKey: "",
  qwenApiKey: "",
  openaiApiKey: "",
  anthropicApiKey: "",
  brainstormModel: "deepseek-chat",
  continueModel: "deepseek-chat",
  analyzeModel: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 4096,
  // Writing
  defaultGenre: "",
  defaultFramework: "",
  autoSaveInterval: 60,
  editorFontSize: "medium",
  editorLineHeight: 1.8,
  showWordCount: true,
  showCharCount: false,
  // Export
  defaultExportFormat: "txt",
  defaultAuthorName: "",
  includeChapterTitles: true,
  customExportCss: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "novel-forge-settings",
    }
  )
);
