"use client"

import { useState } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Menu } from "lucide-react"
import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

function HeaderThemeToggle() {
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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          {/* Desktop: use SidebarTrigger */}
          <SidebarTrigger className="-ml-1 max-md:hidden" />
          {/* Mobile: use hamburger menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="打开菜单"
            >
              <Menu className="size-4" />
            </Button>
          )}
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <HeaderThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>

      {/* Mobile sidebar sheet */}
      {isMobile && (
        <MobileSidebar
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
      )}
    </SidebarProvider>
  )
}
