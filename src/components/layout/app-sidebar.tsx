"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Home,
  Lightbulb,
  Globe,
  Users,
  PenTool,
  BarChart3,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useProjectStore } from "@/stores/project-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

// 导航项定义
const navItems = [
  { title: "首页", href: "/", icon: Home, requireProject: false },
  { title: "我的作品", href: "/projects", icon: BookOpen, requireProject: false },
  { title: "构思工坊", href: "/conception", icon: Lightbulb, requireProject: true },
  { title: "世界观", href: "/worldbuilding", icon: Globe, requireProject: true },
  { title: "角色", href: "/characters", icon: Users, requireProject: true },
  { title: "写作台", href: "/writing", icon: PenTool, requireProject: true },
  { title: "分析", href: "/analysis", icon: BarChart3, requireProject: true },
]

const settingsItem = { title: "设置", href: "/settings", icon: Settings, requireProject: false }

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const themeIcon =
    theme === "dark" ? <Moon className="size-4" /> :
    theme === "light" ? <Sun className="size-4" /> :
    <Monitor className="size-4" />

  const themeLabel =
    theme === "dark" ? "深色模式" :
    theme === "light" ? "浅色模式" :
    "跟随系统"

  return (
    <Button variant="ghost" size="icon-sm" onClick={cycleTheme} aria-label={themeLabel}>
      {themeIcon}
    </Button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const projects = useProjectStore((s) => s.projects)
  const currentProject = projects.find((p) => p.id === currentProjectId)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Novel Forge">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PenTool className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Novel Forge</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI 辅助小说创作
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // 如果需要项目但当前没有选中项目，则不显示
                if (item.requireProject && !currentProjectId) {
                  return null
                }

                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {currentProject && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" className="text-xs">
                  <BookOpen className="size-4" />
                  <span className="truncate">{currentProject.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          {/* 主题切换 */}
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" tooltip="切换主题">
              <ThemeToggle />
              <span className="text-xs">切换主题</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* 设置 */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={settingsItem.title}
              isActive={pathname.startsWith(settingsItem.href)}
            >
              <Link href={settingsItem.href} className="flex items-center gap-2">
                <settingsItem.icon />
                <span>{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
