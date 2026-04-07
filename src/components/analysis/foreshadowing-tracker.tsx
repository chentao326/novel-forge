"use client";

import React, { useState, useCallback, useRef } from "react";
import { useForeshadowingStore } from "@/stores/foreshadowing-store";
import { useChapterStore } from "@/stores/chapter-store";
import { useProjectStore } from "@/stores/project-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, X, Sparkles, Loader2, Search, Eye, EyeOff } from "lucide-react";
import type { ForeshadowingItem } from "@/stores/foreshadowing-store";

type FilterType = "all" | "planted" | "resolved" | "unresolved";

export function ForeshadowingTracker() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );
  const items = useForeshadowingStore((s) =>
    currentProjectId
      ? s.items.filter((i) => i.project_id === currentProjectId)
      : []
  );
  const addItem = useForeshadowingStore((s) => s.addItem);
  const updateItem = useForeshadowingStore((s) => s.updateItem);
  const removeItem = useForeshadowingStore((s) => s.removeItem);
  const resolveItem = useForeshadowingStore((s) => s.resolveItem);

  const [filter, setFilter] = useState<FilterType>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ForeshadowingItem | null>(null);
  const [resolvingItem, setResolvingItem] = useState<ForeshadowingItem | null>(null);

  // Form state
  const [formChapterId, setFormChapterId] = useState<string>("");
  const [formDescription, setFormDescription] = useState("");
  const [resolveChapterId, setResolveChapterId] = useState<string>("");

  // AI suggestion
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sortedChapters = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

  const filteredItems = items.filter((item) => {
    switch (filter) {
      case "planted":
        return !item.is_resolved;
      case "resolved":
        return item.is_resolved;
      case "unresolved":
        return !item.is_resolved;
      default:
        return true;
    }
  });

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormChapterId("");
    setFormDescription("");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentProjectId || !formDescription.trim()) return;

    if (editingItem) {
      updateItem(editingItem.id, {
        chapter_id: formChapterId || null,
        description: formDescription.trim(),
      });
    } else {
      addItem({
        id: crypto.randomUUID(),
        project_id: currentProjectId,
        chapter_id: formChapterId || null,
        description: formDescription.trim(),
        is_resolved: false,
        resolved_chapter_id: null,
        created_at: new Date().toISOString(),
      });
    }
    setDialogOpen(false);
  };

  const handleResolve = () => {
    if (!resolvingItem || !resolveChapterId) return;
    resolveItem(resolvingItem.id, resolveChapterId);
    setResolveDialogOpen(false);
    setResolvingItem(null);
    setResolveChapterId("");
  };

  const handleAISuggest = useCallback(async () => {
    if (isSuggesting || chapters.length === 0) return;
    setIsSuggesting(true);
    setAiSuggestion("");

    try {
      abortRef.current = new AbortController();
      const response = await fetch("/api/analysis/foreshadow-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProjectId,
          chapters: sortedChapters.map((c) => ({
            title: c.title,
            content: c.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error("分析失败");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAiSuggestion(accumulated);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("AI suggest error:", error);
      setAiSuggestion("分析失败，请重试。");
    } finally {
      setIsSuggesting(false);
    }
  }, [chapters, currentProjectId, isSuggesting, sortedChapters]);

  const counts = {
    all: items.length,
    planted: items.filter((i) => !i.is_resolved).length,
    resolved: items.filter((i) => i.is_resolved).length,
    unresolved: items.filter((i) => !i.is_resolved).length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "all", label: "全部" },
              { key: "planted", label: "已埋设" },
              { key: "resolved", label: "已回收" },
              { key: "unresolved", label: "未解决" },
            ] as const
          ).map(({ key, label }) => (
            <Button
              key={key}
              size="xs"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
            >
              {label}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                {counts[key]}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAISuggest} disabled={isSuggesting || chapters.length === 0}>
            {isSuggesting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            AI 建议
          </Button>
          <Button size="sm" onClick={handleOpenNew}>
            <Plus className="size-4" />添加伏笔
          </Button>
        </div>
      </div>

      {/* AI suggestion */}
      {aiSuggestion && (
        <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI 伏笔建议</span>
            <Button size="icon-xs" variant="ghost" onClick={() => setAiSuggestion("")}>
              <X className="size-3" />
            </Button>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
            {aiSuggestion}
          </div>
        </div>
      )}

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {filter === "all"
            ? "还没有伏笔记录，点击上方按钮添加"
            : "没有匹配的伏笔记录"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const chapter = item.chapter_id ? chapterMap.get(item.chapter_id) : null;
            const resolvedChapter = item.resolved_chapter_id
              ? chapterMap.get(item.resolved_chapter_id)
              : null;

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 space-y-1.5 ${
                  item.is_resolved ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {item.is_resolved ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                    ) : (
                      <Search className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {chapter && (
                          <Badge variant="outline" className="text-[10px]">
                            埋设于: {chapter.title}
                          </Badge>
                        )}
                        {resolvedChapter && (
                          <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                            回收于: {resolvedChapter.title}
                          </Badge>
                        )}
                        <Badge
                          variant={item.is_resolved ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {item.is_resolved ? "已回收" : "未回收"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!item.is_resolved && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => {
                          setResolvingItem(item);
                          setResolveChapterId("");
                          setResolveDialogOpen(true);
                        }}
                        title="标记为已回收"
                      >
                        <Check className="size-3" />
                      </Button>
                    )}
                    {item.is_resolved && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => {
                          updateItem(item.id, {
                            is_resolved: false,
                            resolved_chapter_id: null,
                          });
                        }}
                        title="取消回收"
                      >
                        <EyeOff className="size-3" />
                      </Button>
                    )}
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      title="删除"
                    >
                      <X className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "编辑伏笔" : "添加伏笔"}</DialogTitle>
            <DialogDescription>
              记录故事中的伏笔和铺垫
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>所在章节</Label>
              <Select value={formChapterId} onValueChange={(v) => v && setFormChapterId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择章节（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {sortedChapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>伏笔描述 *</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="描述这个伏笔的内容..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!formDescription.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>标记伏笔为已回收</DialogTitle>
            <DialogDescription>
              选择伏笔被回收的章节
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {resolvingItem && (
              <div className="rounded-md bg-muted p-3 text-sm">
                {resolvingItem.description}
              </div>
            )}
            <div className="space-y-2">
              <Label>回收章节 *</Label>
              <Select value={resolveChapterId} onValueChange={(v) => v && setResolveChapterId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择回收章节" />
                </SelectTrigger>
                <SelectContent>
                  {sortedChapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleResolve} disabled={!resolveChapterId}>
              确认回收
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
