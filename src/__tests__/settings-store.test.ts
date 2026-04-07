import { describe, it, expect, beforeEach } from "vitest"
import { useSettingsStore } from "@/stores/settings-store"

describe("设置 Store", () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings()
  })

  it("初始状态有正确的默认值", () => {
    const state = useSettingsStore.getState()
    expect(state.defaultProvider).toBe("deepseek")
    expect(state.temperature).toBe(0.7)
    expect(state.maxTokens).toBe(4096)
    expect(state.autoSaveInterval).toBe(60)
    expect(state.editorFontSize).toBe("medium")
    expect(state.editorLineHeight).toBe(1.8)
    expect(state.showWordCount).toBe(true)
    expect(state.showCharCount).toBe(false)
    expect(state.defaultExportFormat).toBe("txt")
    expect(state.includeChapterTitles).toBe(true)
  })

  it("updateSettings 部分更新设置", () => {
    useSettingsStore.getState().updateSettings({ temperature: 1.5 })
    const state = useSettingsStore.getState()
    expect(state.temperature).toBe(1.5)
    // 其他值不变
    expect(state.maxTokens).toBe(4096)
    expect(state.defaultProvider).toBe("deepseek")
  })

  it("updateSettings 可以更新多个字段", () => {
    useSettingsStore.getState().updateSettings({
      temperature: 0.5,
      maxTokens: 8192,
      editorFontSize: "large",
    })
    const state = useSettingsStore.getState()
    expect(state.temperature).toBe(0.5)
    expect(state.maxTokens).toBe(8192)
    expect(state.editorFontSize).toBe("large")
  })

  it("resetSettings 恢复所有默认值", () => {
    useSettingsStore.getState().updateSettings({
      temperature: 2.0,
      maxTokens: 100,
      defaultProvider: "openai",
      showWordCount: false,
    })
    useSettingsStore.getState().resetSettings()
    const state = useSettingsStore.getState()
    expect(state.temperature).toBe(0.7)
    expect(state.maxTokens).toBe(4096)
    expect(state.defaultProvider).toBe("deepseek")
    expect(state.showWordCount).toBe(true)
  })

  it("updateSettings 空对象不改变任何值", () => {
    const before = useSettingsStore.getState()
    useSettingsStore.getState().updateSettings({})
    const after = useSettingsStore.getState()
    expect(after.temperature).toBe(before.temperature)
    expect(after.maxTokens).toBe(before.maxTokens)
  })
})
