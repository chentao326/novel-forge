"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useWorldStore } from "@/stores/world-store";
import { SettingCard } from "@/components/worldbuilding/setting-card";
import { SettingEditor } from "@/components/worldbuilding/setting-editor";
import { PowerSystemDesigner } from "@/components/worldbuilding/power-system-designer";
import { TimelineEditor } from "@/components/worldbuilding/timeline-editor";
import { ConsistencyPanel } from "@/components/worldbuilding/consistency-panel";
import { LayerBuilder } from "@/components/worldbuilding/layer-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Plus, Search, Layers, Zap, Clock, ShieldCheck } from "lucide-react";
import type { WorldSetting, WorldCategory } from "@/lib/types";
import { WORLD_CATEGORY_LABELS } from "@/lib/types";

const CATEGORY_FILTERS: Array<{ value: WorldCategory | "all"; label: string }> = [
  { value: "all", label: "全部" },
  ...Object.entries(WORLD_CATEGORY_LABELS).map(([value, label]) => ({ value: value as WorldCategory, label })),
];

export default function WorldBuildingPage() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const currentProject = useProjectStore((s) => s.getCurrentProject());
  const allSettings = useWorldStore((s) => s.settings);
  const getChildSettings = useWorldStore((s) => s.getChildSettings);

  const settings = useMemo(() =>
    currentProjectId ? allSettings.filter((s) => s.project_id === currentProjectId) : [],
    [allSettings, currentProjectId]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WorldCategory | "all">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<WorldSetting | null>(null);

  const filteredSettings = useMemo(() => {
    let result = settings;
    if (categoryFilter !== "all") result = result.filter((s) => s.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || (s.content ?? "").toLowerCase().includes(q));
    }
    return result;
  }, [settings, categoryFilter, searchQuery]);

  const groupedSettings = useMemo(() => {
    const groups: Record<string, WorldSetting[]> = {};
    for (const s of filteredSettings) { if (!groups[s.category]) groups[s.category] = []; groups[s.category].push(s); }
    return groups;
  }, [filteredSettings]);

  const handleNewSetting = () => { setEditingSetting(null); setEditorOpen(true); };
  const handleEditSetting = (setting: WorldSetting) => { setEditingSetting(setting); setEditorOpen(true); };

  if (!currentProjectId || !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center"><h2 className="mb-2 text-lg font-medium">请先选择一个作品</h2><p className="text-sm text-muted-foreground">进入作品管理页面选择或创建一个作品</p></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-xl font-bold">世界观工坊</h1><p className="text-sm text-muted-foreground">{currentProject.title} - 构建你的故事世界</p></div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="settings">
            <Globe className="size-4" />
            设定管理
          </TabsTrigger>
          <TabsTrigger value="layers">
            <Layers className="size-4" />
            分层构建
          </TabsTrigger>
          <TabsTrigger value="power">
            <Zap className="size-4" />
            力量体系
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="size-4" />
            时间线
          </TabsTrigger>
          <TabsTrigger value="consistency">
            <ShieldCheck className="size-4" />
            一致性检查
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 设定管理 (existing) */}
        <TabsContent value="settings">
          <div className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索设定..." className="pl-9" />
              </div>
              <Button onClick={handleNewSetting}><Plus className="size-4" />新建设定</Button>
            </div>
            <div className="mb-6 flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((filter) => (
                <Badge key={filter.value} variant={categoryFilter === filter.value ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategoryFilter(filter.value)}>{filter.label}</Badge>
              ))}
            </div>
            {filteredSettings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="mb-3 size-12 text-muted-foreground/30" />
                <h3 className="mb-1 text-lg font-medium">{searchQuery || categoryFilter !== "all" ? "未找到匹配的设定" : "还没有世界观设定"}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{searchQuery || categoryFilter !== "all" ? "尝试使用不同的关键词或类别筛选" : "创建你的第一个世界观设定，开始构建故事世界"}</p>
                {!searchQuery && categoryFilter === "all" && <Button onClick={handleNewSetting}><Plus className="size-4" />新建设定</Button>}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSettings).map(([cat, items]) => (
                  <div key={cat}>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">{WORLD_CATEGORY_LABELS[cat as WorldCategory]} ({items.length})</h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((s) => (<SettingCard key={s.id} setting={s} childCount={getChildSettings(s.id).length} onClick={() => handleEditSetting(s)} />))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: 分层构建 */}
        <TabsContent value="layers">
          <div className="mt-4">
            <LayerBuilder />
          </div>
        </TabsContent>

        {/* Tab 3: 力量体系 */}
        <TabsContent value="power">
          <div className="mt-4">
            <PowerSystemDesigner />
          </div>
        </TabsContent>

        {/* Tab 4: 时间线 */}
        <TabsContent value="timeline">
          <div className="mt-4">
            <TimelineEditor />
          </div>
        </TabsContent>

        {/* Tab 5: 一致性检查 */}
        <TabsContent value="consistency">
          <div className="mt-4">
            <ConsistencyPanel />
          </div>
        </TabsContent>
      </Tabs>

      <SettingEditor setting={editingSetting} open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
