"use client";

import React from "react";
import { useProjectStore } from "@/stores/project-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StyleAnalyzer } from "@/components/analysis/style-analyzer";
import { ForeshadowingTracker } from "@/components/analysis/foreshadowing-tracker";
import { PacingHeatmap } from "@/components/analysis/pacing-heatmap";
import { ConsistencyCheck } from "@/components/analysis/consistency-check";
import { ChapterOverview } from "@/components/analysis/chapter-overview";
import {
  BarChart3,
  Palette,
  Search,
  ShieldCheck,
  Activity,
  LayoutDashboard,
} from "lucide-react";

export default function AnalysisPage() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const currentProject = useProjectStore((s) => s.getCurrentProject());

  if (!currentProjectId || !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium">请先选择一个作品</h2>
          <p className="text-sm text-muted-foreground">
            进入作品管理页面选择或创建一个作品
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold">写作分析</h1>
        <p className="text-sm text-muted-foreground">
          {currentProject.title} - 分析你的写作风格和故事结构
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="size-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="style">
            <Palette className="size-4" />
            风格分析
          </TabsTrigger>
          <TabsTrigger value="pacing">
            <Activity className="size-4" />
            节奏分析
          </TabsTrigger>
          <TabsTrigger value="foreshadowing">
            <Search className="size-4" />
            伏笔追踪
          </TabsTrigger>
          <TabsTrigger value="consistency">
            <ShieldCheck className="size-4" />
            一致性检查
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ChapterOverview />
        </TabsContent>

        <TabsContent value="style" className="mt-4">
          <StyleAnalyzer />
        </TabsContent>

        <TabsContent value="pacing" className="mt-4">
          <PacingHeatmap />
        </TabsContent>

        <TabsContent value="foreshadowing" className="mt-4">
          <ForeshadowingTracker />
        </TabsContent>

        <TabsContent value="consistency" className="mt-4">
          <ConsistencyCheck />
        </TabsContent>
      </Tabs>
    </div>
  );
}
