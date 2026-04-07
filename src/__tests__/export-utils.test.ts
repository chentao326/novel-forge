import { describe, it, expect } from "vitest"
import { exportToTxt, exportToMarkdown, exportToHtml } from "@/lib/export/export-utils"
import type { Chapter } from "@/lib/types"

const mockChapters: Chapter[] = [
  {
    id: "ch1",
    project_id: "proj1",
    volume_id: "vol1",
    title: "第一章 初入江湖",
    content: "<p>少年剑客踏上了旅途。</p>",
    status: "draft",
    sort_order: 1,
    word_count: 100,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch2",
    project_id: "proj1",
    volume_id: "vol1",
    title: "第二章 奇遇",
    content: "<p>他在森林中发现了一座古庙。</p><p>庙中有一本神秘的书。</p>",
    status: "draft",
    sort_order: 2,
    word_count: 200,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
]

async function blobToText(blob: Blob): Promise<string> {
  return blob.text()
}

describe("导出工具模块", () => {
  describe("exportToTxt", () => {
    it("导出纯文本 Blob", async () => {
      const blob = await exportToTxt(mockChapters)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe("text/plain;charset=utf-8")
    })

    it("包含章节标题", async () => {
      const blob = await exportToTxt(mockChapters, { includeTitles: true })
      const text = await blobToText(blob)
      expect(text).toContain("第一章 初入江湖")
      expect(text).toContain("第二章 奇遇")
    })

    it("不包含标题时只有纯文本内容", async () => {
      const blob = await exportToTxt(mockChapters, { includeTitles: false })
      const text = await blobToText(blob)
      expect(text).toContain("少年剑客踏上了旅途")
      expect(text).not.toContain("第一章")
    })

    it("HTML 标签被去除", async () => {
      const blob = await exportToTxt(mockChapters)
      const text = await blobToText(blob)
      expect(text).not.toContain("<p>")
      expect(text).not.toContain("</p>")
    })

    it("按 sort_order 排序", async () => {
      const reversed = [...mockChapters].reverse()
      const blob = await exportToTxt(reversed, { includeTitles: true })
      const text = await blobToText(blob)
      const idx1 = text.indexOf("第一章")
      const idx2 = text.indexOf("第二章")
      expect(idx1).toBeLessThan(idx2)
    })
  })

  describe("exportToMarkdown", () => {
    it("导出 Markdown Blob", async () => {
      const blob = await exportToMarkdown(mockChapters)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe("text/markdown;charset=utf-8")
    })

    it("包含 Markdown 标题格式", async () => {
      const blob = await exportToMarkdown(mockChapters, { includeTitles: true })
      const text = await blobToText(blob)
      expect(text).toContain("# 第一章 初入江湖")
      expect(text).toContain("# 第二章 奇遇")
    })

    it("章节之间用 --- 分隔", async () => {
      const blob = await exportToMarkdown(mockChapters)
      const text = await blobToText(blob)
      expect(text).toContain("---")
    })

    it("HTML 转为 Markdown 格式", async () => {
      const blob = await exportToMarkdown(mockChapters)
      const text = await blobToText(blob)
      expect(text).not.toContain("<p>")
      expect(text).toContain("少年剑客踏上了旅途")
    })
  })

  describe("exportToHtml", () => {
    it("导出 HTML Blob", async () => {
      const blob = await exportToHtml(mockChapters, "测试小说")
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe("text/html;charset=utf-8")
    })

    it("包含 DOCTYPE 声明", async () => {
      const blob = await exportToHtml(mockChapters, "测试小说")
      const text = await blobToText(blob)
      expect(text).toContain("<!DOCTYPE html>")
    })

    it("包含作品标题", async () => {
      const blob = await exportToHtml(mockChapters, "我的小说")
      const text = await blobToText(blob)
      expect(text).toContain("我的小说")
    })

    it("包含作者署名", async () => {
      const blob = await exportToHtml(mockChapters, "测试", { authorName: "测试作者" })
      const text = await blobToText(blob)
      expect(text).toContain("测试作者")
    })

    it("lang 属性为 zh-CN", async () => {
      const blob = await exportToHtml(mockChapters, "测试")
      const text = await blobToText(blob)
      expect(text).toContain('lang="zh-CN"')
    })
  })
})
