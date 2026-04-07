import { describe, it, expect } from "vitest"
import {
  GENRE_LABELS,
  CHAPTER_STATUS_LABELS,
  CHARACTER_ROLE_LABELS,
  ARC_TYPE_LABELS,
  WORLD_CATEGORY_LABELS,
  REWRITE_MODE_LABELS,
  type Genre,
  type ChapterStatus,
  type CharacterRole,
  type ArcType,
  type WorldCategory,
  type RewriteMode,
} from "@/lib/types"

describe("常量完整性检查", () => {
  const genres: Genre[] = [
    "fantasy", "scifi", "romance", "mystery", "thriller", "horror",
    "literary", "historical", "adventure", "comedy", "drama", "urban", "other",
  ]

  it("GENRE_LABELS 覆盖所有 Genre 类型", () => {
    for (const genre of genres) {
      expect(GENRE_LABELS[genre]).toBeDefined()
      expect(typeof GENRE_LABELS[genre]).toBe("string")
      expect(GENRE_LABELS[genre].length).toBeGreaterThan(0)
    }
  })

  it("GENRE_LABELS 有 13 个条目", () => {
    expect(Object.keys(GENRE_LABELS)).toHaveLength(13)
  })

  const chapterStatuses: ChapterStatus[] = [
    "outline", "draft", "first_draft", "polished", "final",
  ]

  it("CHAPTER_STATUS_LABELS 覆盖所有 ChapterStatus 类型", () => {
    for (const status of chapterStatuses) {
      expect(CHAPTER_STATUS_LABELS[status]).toBeDefined()
      expect(typeof CHAPTER_STATUS_LABELS[status]).toBe("string")
    }
  })

  const characterRoles: CharacterRole[] = [
    "protagonist", "antagonist", "supporting", "minor",
  ]

  it("CHARACTER_ROLE_LABELS 覆盖所有 CharacterRole 类型", () => {
    for (const role of characterRoles) {
      expect(CHARACTER_ROLE_LABELS[role]).toBeDefined()
    }
  })

  const arcTypes: ArcType[] = ["positive", "flat", "negative"]

  it("ARC_TYPE_LABELS 覆盖所有 ArcType 类型", () => {
    for (const arc of arcTypes) {
      expect(ARC_TYPE_LABELS[arc]).toBeDefined()
    }
  })

  const worldCategories: WorldCategory[] = [
    "geography", "history", "politics", "culture", "power_system",
    "technology", "economy", "race", "other",
  ]

  it("WORLD_CATEGORY_LABELS 覆盖所有 WorldCategory 类型", () => {
    for (const cat of worldCategories) {
      expect(WORLD_CATEGORY_LABELS[cat]).toBeDefined()
    }
  })

  const rewriteModes: RewriteMode[] = ["expand", "condense", "describe", "tone"]

  it("REWRITE_MODE_LABELS 覆盖所有 RewriteMode 类型", () => {
    for (const mode of rewriteModes) {
      expect(REWRITE_MODE_LABELS[mode]).toBeDefined()
    }
  })
})
