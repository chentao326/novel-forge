"use client";

import React, { useState, useCallback } from "react";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  X,
  Loader2,
  Clock,
  Sparkles,
  Save,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Swords,
  Lightbulb,
  Flag,
  AlertTriangle,
  Building,
} from "lucide-react";

// ---- Types ----

export interface TimelineEvent {
  id: string;
  date_label: string;
  title: string;
  description: string;
  category: EventCategory;
}

export type EventCategory =
  | "war"
  | "discovery"
  | "founding"
  | "disaster"
  | "cultural"
  | "political"
  | "other";

export const EVENT_CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; icon: React.ElementType }
> = {
  war: { label: "战争", color: "bg-red-500", icon: Swords },
  discovery: { label: "发现", color: "bg-blue-500", icon: Lightbulb },
  founding: { label: "建立", color: "bg-green-500", icon: Flag },
  disaster: { label: "灾难", color: "bg-orange-500", icon: AlertTriangle },
  cultural: { label: "文化", color: "bg-purple-500", icon: Building },
  political: { label: "政治", color: "bg-amber-500", icon: Building },
  other: { label: "其他", color: "bg-gray-500", icon: Clock },
};

function createEmptyEvent(): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    date_label: "",
    title: "",
    description: "",
    category: "other",
  };
}

// ---- Main Component ----

export function TimelineEditor() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addSetting = useWorldStore((s) => s.addSetting);
  const projectSettings = useWorldStore((s) =>
    currentProjectId
      ? s.settings.filter((s) => s.project_id === currentProjectId)
      : []
  );

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  const handleAddEvent = () => {
    const newEvent = createEmptyEvent();
    setEvents((prev) => [...prev, newEvent]);
    setEditingEvent(newEvent.id);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (editingEvent === id) setEditingEvent(null);
  };

  const handleUpdateEvent = (
    id: string,
    field: keyof TimelineEvent,
    value: string
  ) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleMoveEvent = (id: string, direction: "up" | "down") => {
    setEvents((prev) => {
      const index = prev.findIndex((e) => e.id === id);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;
      const newEvents = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newEvents[index], newEvents[swapIndex]] = [
        newEvents[swapIndex],
        newEvents[index],
      ];
      return newEvents;
    });
  };

  const handleAIGenerate = async () => {
    if (!currentProjectId) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/worldbuilding/timeline-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProjectId,
          existingSettings: projectSettings.map((s) => ({
            name: s.name,
            content: (s.content || "").slice(0, 200),
          })),
        }),
      });
      if (!response.ok || !response.body) throw new Error("生成失败");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      // Parse AI response into events
      // Expected format: lines with "日期 | 标题 | 描述 | 类别"
      const lines = result.split("\n").filter(Boolean);
      const newEvents: TimelineEvent[] = lines.map((line) => {
        const parts = line.split("|").map((s) => s.trim());
        const category = Object.keys(EVENT_CATEGORY_CONFIG).find(
          (c) => c === parts[3]?.toLowerCase()
        ) as EventCategory;
        return {
          id: crypto.randomUUID(),
          date_label: parts[0] || "",
          title: parts[1] || "",
          description: parts[2] || "",
          category: category || "other",
        };
      });

      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents]);
      }
    } catch (error) {
      console.error("Timeline generate error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToWorld = () => {
    if (!currentProjectId || events.length === 0) return;

    const content = events
      .map(
        (e) =>
          `[${e.date_label}] ${e.title}（${EVENT_CATEGORY_CONFIG[e.category].label}）\n${e.description}`
      )
      .join("\n\n");

    const rules = events.map(
      (e) => `${e.date_label} - ${e.title}: ${EVENT_CATEGORY_CONFIG[e.category].label}`
    );

    const now = new Date().toISOString();
    addSetting({
      id: crypto.randomUUID(),
      project_id: currentProjectId,
      name: "世界时间线",
      category: "history",
      parent_id: null,
      content,
      rules,
      created_at: now,
      updated_at: now,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-blue-500" />
          <h3 className="text-lg font-semibold">世界时间线</h3>
          <Badge variant="secondary">{events.length} 个事件</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            AI生成历史事件
          </Button>
          <Button size="sm" onClick={handleAddEvent}>
            <Plus className="size-4" />
            添加事件
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSaveToWorld}
            disabled={events.length === 0}
          >
            <Save className="size-4" />
            导入到世界设定
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="mb-3 size-12 text-muted-foreground/30" />
          <h3 className="mb-1 text-lg font-medium">还没有时间线事件</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            添加历史事件来构建你的世界时间线，或使用AI自动生成
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddEvent}>
              <Plus className="size-4" />
              手动添加
            </Button>
            <Button
              variant="outline"
              onClick={handleAIGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              AI生成
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

            {events.map((event, index) => {
              const config = EVENT_CATEGORY_CONFIG[event.category];
              const Icon = config.icon;
              const isEditing = editingEvent === event.id;

              return (
                <div key={event.id} className="relative mb-6">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-5 top-2 size-3 rounded-full ${config.color} ring-4 ring-background`}
                  />

                  {/* Event Card */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    {/* Event Header */}
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-4 text-muted-foreground shrink-0" />
                      <Badge
                        variant="outline"
                        className="shrink-0"
                        style={{ borderColor: config.color.replace("bg-", "") }}
                      >
                        <Icon className="size-3 mr-1" />
                        {config.label}
                      </Badge>
                      {isEditing ? (
                        <Input
                          value={event.date_label}
                          onChange={(e) =>
                            handleUpdateEvent(event.id, "date_label", e.target.value)
                          }
                          placeholder="日期标签，如：纪元元年"
                          className="w-40"
                        />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {event.date_label || "未设定日期"}
                        </span>
                      )}
                      <div className="ml-auto flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMoveEvent(event.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMoveEvent(event.id, "down")}
                          disabled={index === events.length - 1}
                        >
                          <ArrowDown className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setEditingEvent(isEditing ? null : event.id)
                          }
                        >
                          {isEditing ? (
                            <Save className="size-3" />
                          ) : (
                            <Badge variant="ghost" className="text-xs">
                              编辑
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveEvent(event.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    {isEditing ? (
                      <Input
                        value={event.title}
                        onChange={(e) =>
                          handleUpdateEvent(event.id, "title", e.target.value)
                        }
                        placeholder="事件标题"
                      />
                    ) : (
                      <h4 className="font-medium">
                        {event.title || "未命名事件"}
                      </h4>
                    )}

                    {/* Description */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label className="text-xs">事件描述</Label>
                        <Textarea
                          value={event.description}
                          onChange={(e) =>
                            handleUpdateEvent(
                              event.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="描述此事件的详细经过..."
                          rows={3}
                        />
                        <Label className="text-xs">事件类别</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            Object.entries(EVENT_CATEGORY_CONFIG) as [
                              EventCategory,
                              (typeof EVENT_CATEGORY_CONFIG)[EventCategory]
                            ][]
                          ).map(([key, cfg]) => (
                            <Badge
                              key={key}
                              variant={
                                event.category === key ? "default" : "outline"
                              }
                              className="cursor-pointer"
                              onClick={() =>
                                handleUpdateEvent(event.id, "category", key)
                              }
                            >
                              {cfg.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
