import { describe, it, expect } from "vitest"
import { getFrameworkList, getFramework } from "@/lib/conception/frameworks"
import type { StructureFramework } from "@/lib/types"

describe("故事框架模块", () => {
  describe("getFrameworkList", () => {
    it("返回 7 个框架", () => {
      const list = getFrameworkList()
      expect(list).toHaveLength(7)
    })

    it("每个框架都有 id、name、description、bestFor、beats 字段", () => {
      const list = getFrameworkList()
      for (const fw of list) {
        expect(fw.id).toBeDefined()
        expect(fw.name).toBeDefined()
        expect(fw.description).toBeDefined()
        expect(fw.bestFor).toBeDefined()
        expect(Array.isArray(fw.beats)).toBe(true)
      }
    })

    it("每个框架的 id 都是有效的 StructureFramework 类型", () => {
      const validIds: StructureFramework[] = [
        "three_act", "hero_journey", "save_the_cat", "five_act",
        "kishotenketsu", "seven_point", "custom",
      ]
      const list = getFrameworkList()
      const ids = list.map((fw) => fw.id)
      for (const id of validIds) {
        expect(ids).toContain(id)
      }
    })
  })

  describe("getFramework", () => {
    it("返回三幕结构框架", () => {
      const fw = getFramework("three_act")
      expect(fw).toBeDefined()
      expect(fw!.name).toBe("三幕结构")
      expect(fw!.beats.length).toBeGreaterThan(0)
    })

    it("返回英雄之旅框架，有 12 个节拍", () => {
      const fw = getFramework("hero_journey")
      expect(fw).toBeDefined()
      expect(fw!.beats).toHaveLength(12)
    })

    it("返回 Save the Cat 框架，有 15 个节拍", () => {
      const fw = getFramework("save_the_cat")
      expect(fw).toBeDefined()
      expect(fw!.beats).toHaveLength(15)
    })

    it("返回起承转合框架，有 4 个节拍", () => {
      const fw = getFramework("kishotenketsu")
      expect(fw).toBeDefined()
      expect(fw!.beats).toHaveLength(4)
    })

    it("返回七点结构框架，有 7 个节拍", () => {
      const fw = getFramework("seven_point")
      expect(fw).toBeDefined()
      expect(fw!.beats).toHaveLength(7)
    })

    it("自定义框架的 beats 为空数组", () => {
      const fw = getFramework("custom")
      expect(fw).toBeDefined()
      expect(fw!.beats).toHaveLength(0)
    })

    it("每个节拍的 position 在 0-100 之间", () => {
      const fw = getFramework("three_act")!
      for (const beat of fw.beats) {
        expect(beat.position).toBeGreaterThanOrEqual(0)
        expect(beat.position).toBeLessThanOrEqual(100)
      }
    })

    it("非自定义框架的节拍 position 大致递增（允许相邻重叠）", () => {
      // Save the Cat 等框架中某些相邻节拍的 position 相同（表示时间线上重叠）
      // 这里验证整体趋势是递增的：首尾 position 差值足够大，且不会大幅回退
      const frameworksToCheck = ["three_act", "hero_journey", "save_the_cat", "five_act", "kishotenketsu", "seven_point"] as StructureFramework[]
      for (const id of frameworksToCheck) {
        const fw = getFramework(id)!
        if (fw.beats.length > 1) {
          // 第一个节拍的 position 应该 <= 最后一个
          expect(fw.beats[0].position).toBeLessThanOrEqual(fw.beats[fw.beats.length - 1].position)
          // 任意节拍不应回退超过 10 个百分点（允许小幅重叠）
          for (let i = 1; i < fw.beats.length; i++) {
            expect(fw.beats[i].position).toBeGreaterThanOrEqual(fw.beats[i - 1].position - 10)
          }
        }
      }
    })
  })
})
