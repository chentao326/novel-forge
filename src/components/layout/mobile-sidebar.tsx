"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Lightbulb,
  Globe,
  Users,
  PenTool,
  BarChart3,
  BookOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 导航项定义（与 app-sidebar 保持一致）
const navItems = [
  { title: "首页", href: "/", icon: Home, requireProject: false },
  { title: "我的作品", href: "/projects", icon: BookOpen, requireProject: false },
  { title: "构思工坊", href: "/conception", icon: Lightbulb, requireProject: true },
  { title: "世界观", href: "/worldbuilding", icon: Globe, requireProject: true },
  { title: "角色", href: "/characters", icon: Users, requireProject: true },
  { title: "写作台", href: "/writing", icon: PenTool, requireProject: true },
  { title: "分析", href: "/analysis", icon: BarChart3, requireProject: true },
];

const settingsItem = { title: "设置", href: "/settings", icon: Settings, requireProject: false };

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const projects = useProjectStore((s) => s.projects);
  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PenTool className="size-3.5" />
            </div>
            <span className="text-base font-semibold">Novel Forge</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            移动端导航菜单
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            // 如果需要项目但当前没有选中项目，则不显示
            if (item.requireProject && !currentProjectId) {
              return null;
            }

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {currentProject && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <BookOpen className="size-3.5" />
                <span className="truncate">{currentProject.title}</span>
              </div>
            </>
          )}

          <Separator className="my-2" />

          <Link
            href={settingsItem.href}
            onClick={() => onOpenChange(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname.startsWith(settingsItem.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <settingsItem.icon className="size-4 shrink-0" />
            <span>{settingsItem.title}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
