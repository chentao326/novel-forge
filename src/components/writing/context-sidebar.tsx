"use client";

import React, { useState, useMemo } from "react";
import { useCharacterStore } from "@/stores/character-store";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { useChapterStore } from "@/stores/chapter-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  CHARACTER_ROLE_LABELS,
  WORLD_CATEGORY_LABELS,
} from "@/lib/types";
import type { CharacterRole, WorldCategory } from "@/lib/types";
import {
  Users,
  Globe,
  ListTree,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ContextSidebarProps {
  onInsertReference?: (text: string) => void;
}

export function ContextSidebar({ onInsertReference }: ContextSidebarProps) {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const allCharacters = useCharacterStore((s) => s.characters);
  const characters = useMemo(() =>
    currentProjectId ? allCharacters.filter((c) => c.project_id === currentProjectId) : [],
    [allCharacters, currentProjectId]
  );
  const allSettingsData = useWorldStore((s) => s.settings);
  const settings = useMemo(() =>
    currentProjectId ? allSettingsData.filter((s) => s.project_id === currentProjectId) : [],
    [allSettingsData, currentProjectId]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredCharacters = useMemo(() => {
    if (!searchQuery) return characters;
    const q = searchQuery.toLowerCase();
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.background ?? "").toLowerCase().includes(q) ||
        c.personality_traits.some((t: string) => t.toLowerCase().includes(q))
    );
  }, [characters, searchQuery]);

  const filteredSettings = useMemo(() => {
    if (!searchQuery) return settings;
    const q = searchQuery.toLowerCase();
    return settings.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.content ?? "").toLowerCase().includes(q)
    );
  }, [settings, searchQuery]);

  const settingsByCategory = useMemo(() => {
    const groups: Record<string, typeof settings> = {};
    for (const s of filteredSettings) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filteredSettings]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <h3 className="mb-2 text-sm font-medium">写作参考</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索角色、设定..." className="h-7 pl-7 text-xs" />
        </div>
      </div>

      <Tabs className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-2 mt-1">
          <TabsTrigger value="characters"><Users className="size-3.5" />角色</TabsTrigger>
          <TabsTrigger value="world"><Globe className="size-3.5" />世界观</TabsTrigger>
          <TabsTrigger value="outline"><ListTree className="size-3.5" />大纲</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredCharacters.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">暂无角色信息</div>
              ) : (
                filteredCharacters.map((char) => (
                  <div key={char.id} className="rounded-lg border p-2">
                    <div className="flex cursor-pointer items-center gap-2" onClick={() => toggleExpand(char.id)}>
                      {expandedItems.has(char.id) ? <ChevronDown className="size-3 text-muted-foreground" /> : <ChevronRight className="size-3 text-muted-foreground" />}
                      <span className="flex-1 text-sm font-medium">{char.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{CHARACTER_ROLE_LABELS[char.role as CharacterRole]}</Badge>
                    </div>
                    {expandedItems.has(char.id) && (
                      <div className="mt-2 space-y-2 pl-5 text-xs">
                        {char.personality_traits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {char.personality_traits.map((trait: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{trait}</Badge>
                            ))}
                          </div>
                        )}
                        {char.background && <p className="text-muted-foreground line-clamp-3">{char.background}</p>}
                        {char.speech_style && (
                          <div><p className="mb-0.5 font-medium text-muted-foreground">说话风格</p><p className="text-muted-foreground">{char.speech_style}</p></div>
                        )}
                        <Button variant="ghost" size="xs" onClick={() => onInsertReference?.(`【${char.name}】${char.background ? " " + char.background.slice(0, 50) : ""}`)} className="mt-1">
                          <Sparkles className="size-3" />AI引用
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="world" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-2">
              {Object.keys(settingsByCategory).length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">暂无世界观设定</div>
              ) : (
                Object.entries(settingsByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{WORLD_CATEGORY_LABELS[cat as WorldCategory]}</p>
                    {items.map((setting) => (
                      <div key={setting.id} className="mb-1 rounded-lg border p-2">
                        <div className="flex cursor-pointer items-center gap-2" onClick={() => toggleExpand(setting.id)}>
                          {expandedItems.has(setting.id) ? <ChevronDown className="size-3 text-muted-foreground" /> : <ChevronRight className="size-3 text-muted-foreground" />}
                          <span className="flex-1 text-sm">{setting.name}</span>
                        </div>
                        {expandedItems.has(setting.id) && (
                          <div className="mt-2 pl-5 text-xs">
                            <p className="text-muted-foreground line-clamp-5 whitespace-pre-wrap">{setting.content ?? ""}</p>
                            {setting.rules.length > 0 && (
                              <div className="mt-1">
                                <p className="font-medium text-muted-foreground">规则：</p>
                                <ul className="list-inside list-disc text-muted-foreground">{setting.rules.map((rule, i) => <li key={i}>{rule}</li>)}</ul>
                              </div>
                            )}
                            <Button variant="ghost" size="xs" onClick={() => onInsertReference?.(`【${setting.name}】${(setting.content ?? "").slice(0, 80)}`)} className="mt-1">
                              <Sparkles className="size-3" />AI引用
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="outline" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-sm font-medium">故事结构</h4>
                <p className="text-xs text-muted-foreground">在构思阶段设置故事结构后，大纲信息将在此显示。</p>
                <div className="mt-3 space-y-1">
                  {["开篇", "触发事件", "第一转折", "中点", "第二转折", "高潮", "结局"].map((beat, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs ${i === 0 ? "bg-accent text-accent-foreground" : ""}`}>
                      <span className="size-5 rounded-full bg-muted text-center leading-5 text-[10px]">{i + 1}</span>
                      {beat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
