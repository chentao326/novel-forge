import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("合并多个类名字符串", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("合并包含空格的字符串", () => {
    expect(cn("foo bar", "baz")).toBe("foo bar baz")
  })

  it("处理 undefined 和 null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })

  it("处理空字符串", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar")
  })

  it("处理条件类名（对象语法）", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })

  it("处理数组语法", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz")
  })

  it("处理 Tailwind 冲突类名（后者覆盖前者）", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("无参数时返回空字符串", () => {
    expect(cn()).toBe("")
  })
})
