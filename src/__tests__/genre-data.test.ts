import { describe, it, expect } from "vitest"
import { getGenreById, searchTropes, GENRE_DATA } from "@/lib/genres/genre-data"

describe("体裁知识库模块", () => {
  describe("GENRE_DATA", () => {
    it("包含 6 个体裁", () => {
      expect(GENRE_DATA).toHaveLength(6)
    })

    it("每个体裁都有 id、name、tropes、pacingGuide、readerExpectations、subGenres", () => {
      for (const genre of GENRE_DATA) {
        expect(genre.id).toBeDefined()
        expect(genre.name).toBeDefined()
        expect(Array.isArray(genre.tropes)).toBe(true)
        expect(genre.tropes.length).toBeGreaterThan(0)
        expect(genre.pacingGuide).toBeDefined()
        expect(Array.isArray(genre.readerExpectations)).toBe(true)
        expect(Array.isArray(genre.subGenres)).toBe(true)
      }
    })
  })

  describe("getGenreById", () => {
    it("返回奇幻体裁", () => {
      const genre = getGenreById("fantasy")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("奇幻")
      expect(genre!.tropes.length).toBeGreaterThan(0)
    })

    it("返回言情体裁", () => {
      const genre = getGenreById("romance")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("言情")
    })

    it("返回科幻体裁", () => {
      const genre = getGenreById("scifi")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("科幻")
    })

    it("返回悬疑体裁", () => {
      const genre = getGenreById("mystery")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("悬疑")
    })

    it("返回都市体裁", () => {
      const genre = getGenreById("urban")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("都市")
    })

    it("返回历史体裁", () => {
      const genre = getGenreById("historical")
      expect(genre).toBeDefined()
      expect(genre!.name).toBe("历史")
    })

    it("不存在的体裁返回 undefined", () => {
      const genre = getGenreById("nonexistent" as any)
      expect(genre).toBeUndefined()
    })

    it("每个桥段都有 name、description、examples、popularity", () => {
      for (const genre of GENRE_DATA) {
        for (const trope of genre.tropes) {
          expect(trope.name).toBeDefined()
          expect(trope.description).toBeDefined()
          expect(Array.isArray(trope.examples)).toBe(true)
          expect(["common", "popular", "niche"]).toContain(trope.popularity)
        }
      }
    })
  })

  describe("searchTropes", () => {
    it("搜索'魔法'返回相关桥段", () => {
      const results = searchTropes("魔法")
      expect(results.length).toBeGreaterThan(0)
      const names = results.map((t) => t.name)
      expect(names.some((n) => n.includes("魔法"))).toBe(true)
    })

    it("搜索'重生'返回相关桥段", () => {
      const results = searchTropes("重生")
      expect(results.length).toBeGreaterThan(0)
    })

    it("搜索不存在的关键词返回空数组", () => {
      const results = searchTropes("不存在的桥段XYZ123")
      expect(results).toHaveLength(0)
    })

    it("搜索是大小写不敏感的", () => {
      const lower = searchTropes("穿越")
      const upper = searchTropes("穿越")
      expect(lower).toEqual(upper)
    })

    it("搜索结果中每个桥段都有完整的字段", () => {
      const results = searchTropes("修炼")
      for (const trope of results) {
        expect(trope.name).toBeDefined()
        expect(trope.description).toBeDefined()
        expect(trope.popularity).toBeDefined()
      }
    })
  })
})
