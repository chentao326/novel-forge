import { describe, it, expect, beforeEach } from "vitest"
import { useChapterStore } from "@/stores/chapter-store"
import type { Chapter, Volume } from "@/lib/types"

const mockVolume1: Volume = {
  id: "vol-1",
  project_id: "proj-1",
  title: "第一卷",
  sort_order: 1,
}

const mockVolume2: Volume = {
  id: "vol-2",
  project_id: "proj-1",
  title: "第二卷",
  sort_order: 2,
}

const mockChapter1: Chapter = {
  id: "ch-1",
  project_id: "proj-1",
  volume_id: "vol-1",
  title: "第一章",
  content: "<p>内容1</p>",
  status: "draft",
  sort_order: 1,
  word_count: 100,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

const mockChapter2: Chapter = {
  id: "ch-2",
  project_id: "proj-1",
  volume_id: "vol-1",
  title: "第二章",
  content: "<p>内容2</p>",
  status: "draft",
  sort_order: 2,
  word_count: 200,
  created_at: "2026-01-02T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
}

const mockChapter3: Chapter = {
  id: "ch-3",
  project_id: "proj-1",
  volume_id: "vol-2",
  title: "第三章",
  content: "<p>内容3</p>",
  status: "outline",
  sort_order: 1,
  word_count: 0,
  created_at: "2026-01-03T00:00:00Z",
  updated_at: "2026-01-03T00:00:00Z",
}

describe("章节 Store", () => {
  beforeEach(() => {
    useChapterStore.setState({
      volumes: [],
      chapters: [],
      currentChapterId: null,
    })
  })

  describe("卷管理", () => {
    it("addVolume 添加卷", () => {
      useChapterStore.getState().addVolume(mockVolume1)
      expect(useChapterStore.getState().volumes).toHaveLength(1)
    })

    it("setVolumes 设置卷列表", () => {
      useChapterStore.getState().setVolumes([mockVolume1, mockVolume2])
      expect(useChapterStore.getState().volumes).toHaveLength(2)
    })

    it("removeVolume 删除卷", () => {
      useChapterStore.getState().setVolumes([mockVolume1, mockVolume2])
      useChapterStore.getState().removeVolume("vol-1")
      expect(useChapterStore.getState().volumes).toHaveLength(1)
      expect(useChapterStore.getState().volumes[0].id).toBe("vol-2")
    })

    it("removeVolume 级联删除该卷下的章节", () => {
      useChapterStore.getState().setVolumes([mockVolume1])
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2, mockChapter3])
      useChapterStore.getState().removeVolume("vol-1")
      const chapters = useChapterStore.getState().chapters
      expect(chapters).toHaveLength(1)
      expect(chapters[0].id).toBe("ch-3") // vol-2 下的章节保留
    })

    it("updateVolume 更新卷字段", () => {
      useChapterStore.getState().addVolume(mockVolume1)
      useChapterStore.getState().updateVolume("vol-1", { title: "新卷名" })
      expect(useChapterStore.getState().volumes[0].title).toBe("新卷名")
    })

    it("getVolumesByProject 返回按 sort_order 排序的卷", () => {
      useChapterStore.getState().setVolumes([mockVolume2, mockVolume1])
      const volumes = useChapterStore.getState().getVolumesByProject("proj-1")
      expect(volumes).toHaveLength(2)
      expect(volumes[0].id).toBe("vol-1")
      expect(volumes[1].id).toBe("vol-2")
    })
  })

  describe("章节管理", () => {
    it("addChapter 添加章节", () => {
      useChapterStore.getState().addChapter(mockChapter1)
      expect(useChapterStore.getState().chapters).toHaveLength(1)
    })

    it("setChapters 设置章节列表", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2])
      expect(useChapterStore.getState().chapters).toHaveLength(2)
    })

    it("setCurrentChapter 设置当前章节", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2])
      useChapterStore.getState().setCurrentChapter("ch-2")
      expect(useChapterStore.getState().currentChapterId).toBe("ch-2")
    })

    it("getCurrentChapter 返回当前章节", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2])
      useChapterStore.getState().setCurrentChapter("ch-1")
      const current = useChapterStore.getState().getCurrentChapter()
      expect(current).toBeDefined()
      expect(current!.title).toBe("第一章")
    })

    it("getCurrentChapter 无当前章节时返回 undefined", () => {
      expect(useChapterStore.getState().getCurrentChapter()).toBeUndefined()
    })

    it("updateChapter 更新章节字段", () => {
      useChapterStore.getState().addChapter(mockChapter1)
      useChapterStore.getState().updateChapter("ch-1", { title: "新标题", status: "polished" })
      const ch = useChapterStore.getState().chapters[0]
      expect(ch.title).toBe("新标题")
      expect(ch.status).toBe("polished")
    })

    it("removeChapter 删除章节", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2])
      useChapterStore.getState().removeChapter("ch-1")
      expect(useChapterStore.getState().chapters).toHaveLength(1)
      expect(useChapterStore.getState().chapters[0].id).toBe("ch-2")
    })

    it("removeChapter 删除当前章节时清空 currentChapterId", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2])
      useChapterStore.getState().setCurrentChapter("ch-1")
      useChapterStore.getState().removeChapter("ch-1")
      expect(useChapterStore.getState().currentChapterId).toBeNull()
    })

    it("getChaptersByVolume 返回指定卷的章节", () => {
      useChapterStore.getState().setChapters([mockChapter1, mockChapter2, mockChapter3])
      const chapters = useChapterStore.getState().getChaptersByVolume("vol-1")
      expect(chapters).toHaveLength(2)
      expect(chapters.every((c) => c.volume_id === "vol-1")).toBe(true)
    })

    it("getChaptersByVolume 按 sort_order 排序", () => {
      useChapterStore.getState().setChapters([mockChapter2, mockChapter1])
      const chapters = useChapterStore.getState().getChaptersByVolume("vol-1")
      expect(chapters[0].id).toBe("ch-1")
      expect(chapters[1].id).toBe("ch-2")
    })
  })
})
