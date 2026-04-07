import { describe, it, expect, beforeEach } from "vitest"
import { useProjectStore } from "@/stores/project-store"
import type { Project } from "@/lib/types"

const mockProject1: Project = {
  id: "proj-1",
  user_id: "user-1",
  title: "测试小说1",
  genre: "fantasy",
  description: "一部奇幻小说",
  synopsis: "少年踏上冒险旅途",
  structure_framework: "three_act",
  settings: {},
  word_count: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

const mockProject2: Project = {
  id: "proj-2",
  user_id: "user-1",
  title: "测试小说2",
  genre: "scifi",
  description: "一部科幻小说",
  synopsis: "星际探索的故事",
  structure_framework: "hero_journey",
  settings: {},
  word_count: 5000,
  created_at: "2026-01-02T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
}

describe("项目 Store", () => {
  beforeEach(() => {
    useProjectStore.setState({
      projects: [],
      currentProjectId: null,
    })
  })

  it("初始状态为空项目列表", () => {
    const state = useProjectStore.getState()
    expect(state.projects).toEqual([])
    expect(state.currentProjectId).toBeNull()
  })

  it("addProject 添加项目", () => {
    useProjectStore.getState().addProject(mockProject1)
    const state = useProjectStore.getState()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].title).toBe("测试小说1")
  })

  it("setProjects 设置项目列表", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    const state = useProjectStore.getState()
    expect(state.projects).toHaveLength(2)
  })

  it("setCurrentProject 设置当前项目", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    useProjectStore.getState().setCurrentProject("proj-2")
    expect(useProjectStore.getState().currentProjectId).toBe("proj-2")
  })

  it("getCurrentProject 返回当前项目", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    useProjectStore.getState().setCurrentProject("proj-1")
    const current = useProjectStore.getState().getCurrentProject()
    expect(current).toBeDefined()
    expect(current!.title).toBe("测试小说1")
    expect(current!.genre).toBe("fantasy")
  })

  it("getCurrentProject 无当前项目时返回 undefined", () => {
    const current = useProjectStore.getState().getCurrentProject()
    expect(current).toBeUndefined()
  })

  it("updateProject 更新项目字段", () => {
    useProjectStore.getState().addProject(mockProject1)
    useProjectStore.getState().updateProject("proj-1", { title: "新标题", word_count: 1000 })
    const project = useProjectStore.getState().projects[0]
    expect(project.title).toBe("新标题")
    expect(project.word_count).toBe(1000)
    // updated_at 应该被自动更新
    expect(project.updated_at).toBeDefined()
  })

  it("removeProject 删除项目", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    useProjectStore.getState().removeProject("proj-1")
    const state = useProjectStore.getState()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].id).toBe("proj-2")
  })

  it("removeProject 删除当前项目时清空 currentProjectId", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    useProjectStore.getState().setCurrentProject("proj-1")
    useProjectStore.getState().removeProject("proj-1")
    expect(useProjectStore.getState().currentProjectId).toBeNull()
  })

  it("removeProject 删除非当前项目时保留 currentProjectId", () => {
    useProjectStore.getState().setProjects([mockProject1, mockProject2])
    useProjectStore.getState().setCurrentProject("proj-2")
    useProjectStore.getState().removeProject("proj-1")
    expect(useProjectStore.getState().currentProjectId).toBe("proj-2")
  })
})
