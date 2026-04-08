"use client";

import React, { useState, useCallback } from "react";
import { useChapterStore } from "@/stores/chapter-store";
import { useProjectStore } from "@/stores/project-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  BookOpen,
  Trash2,
  ChevronUp,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { CHAPTER_STATUS_LABELS } from "@/lib/types";
import type { ChapterStatus, Volume, Chapter } from "@/lib/types";
import { cn, generateId } from "@/lib/utils";

export function ChapterTree() {
  const {
    volumes,
    chapters,
    currentChapterId,
    addVolume,
    updateVolume,
    removeVolume,
    addChapter,
    updateChapter,
    removeChapter,
    setCurrentChapter,
    getChaptersByVolume,
    getVolumesByProject,
  } = useChapterStore();

  const currentProjectId = useProjectStore((s) => s.currentProjectId);

  const [collapsedVolumes, setCollapsedVolumes] = useState<Set<string>>(
    new Set()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingType, setEditingType] = useState<"volume" | "chapter">(
    "volume"
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "volume" | "chapter";
    id: string;
    title: string;
  } | null>(null);

  const projectVolumes = currentProjectId
    ? getVolumesByProject(currentProjectId)
    : [];

  const toggleCollapse = (volumeId: string) => {
    setCollapsedVolumes((prev) => {
      const next = new Set(prev);
      if (next.has(volumeId)) {
        next.delete(volumeId);
      } else {
        next.add(volumeId);
      }
      return next;
    });
  };

  const startRename = (
    id: string,
    title: string,
    type: "volume" | "chapter"
  ) => {
    setEditingId(id);
    setEditingText(title);
    setEditingType(type);
  };

  const confirmRename = () => {
    if (!editingId || !editingText.trim()) return;
    if (editingType === "volume") {
      updateVolume(editingId, { title: editingText.trim() });
    } else {
      updateChapter(editingId, { title: editingText.trim() });
    }
    setEditingId(null);
    setEditingText("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleAddVolume = () => {
    if (!currentProjectId) return;
    const newVolume: Volume = {
      id: generateId(),
      project_id: currentProjectId,
      title: `卷 ${projectVolumes.length + 1}`,
      sort_order: projectVolumes.length,
      created_at: new Date().toISOString(),
    };
    addVolume(newVolume);
  };

  const handleAddChapter = (volumeId: string) => {
    if (!currentProjectId) return;
    const existing = getChaptersByVolume(volumeId);
    const newChapter: Chapter = {
      id: generateId(),
      project_id: currentProjectId,
      volume_id: volumeId,
      title: `第 ${existing.length + 1} 章`,
      content: "",
      status: "outline",
      sort_order: existing.length,
      word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addChapter(newChapter);
    setCurrentChapter(newChapter.id);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "volume") {
      removeVolume(deleteTarget.id);
    } else {
      removeChapter(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const siblings = getChaptersByVolume(chapter.volume_id);
    const idx = siblings.findIndex((c) => c.id === chapterId);
    if (direction === "up" && idx > 0) {
      const prev = siblings[idx - 1];
      updateChapter(chapterId, { sort_order: prev.sort_order });
      updateChapter(prev.id, { sort_order: chapter.sort_order });
    } else if (direction === "down" && idx < siblings.length - 1) {
      const next = siblings[idx + 1];
      updateChapter(chapterId, { sort_order: next.sort_order });
      updateChapter(next.id, { sort_order: chapter.sort_order });
    }
  };

  const getStatusColor = (status: ChapterStatus) => {
    switch (status) {
      case "outline":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      case "draft":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      case "first_draft":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400";
      case "polished":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
      case "final":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-sm font-medium">章节目录</h3>
        <Button variant="ghost" size="icon-xs" onClick={handleAddVolume}>
          <Plus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {projectVolumes.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <BookOpen className="mx-auto mb-2 size-6 opacity-50" />
              <p>暂无卷</p>
              <Button
                variant="link"
                size="sm"
                onClick={handleAddVolume}
                className="mt-1"
              >
                创建第一卷
              </Button>
            </div>
          ) : (
            projectVolumes.map((volume) => {
              const volumeChapters = getChaptersByVolume(volume.id);
              const isCollapsed = collapsedVolumes.has(volume.id);

              return (
                <div key={volume.id} className="mb-1">
                  {/* Volume header */}
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-muted/50 cursor-pointer",
                      editingId === volume.id && "bg-muted"
                    )}
                    onClick={() => toggleCollapse(volume.id)}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <BookOpen className="size-3.5 shrink-0 text-muted-foreground" />

                    {editingId === volume.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          className="h-6 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmRename();
                          }}
                        >
                          <Check className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRename();
                          }}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate">{volume.title}</span>
                        <div className="hidden items-center gap-0.5 group-hover:flex">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(volume.id, volume.title, "volume");
                            }}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddChapter(volume.id);
                            }}
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                type: "volume",
                                id: volume.id,
                                title: volume.title,
                              });
                            }}
                          >
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chapters */}
                  {!isCollapsed && (
                    <div className="ml-4">
                      {volumeChapters.length === 0 ? (
                        <div className="py-2 pl-2 text-xs text-muted-foreground">
                          暂无章节
                        </div>
                      ) : (
                        volumeChapters.map((chapter, idx) => (
                          <div
                            key={chapter.id}
                            className={cn(
                              "group flex items-center gap-1 rounded-md px-1.5 py-1 text-sm cursor-pointer hover:bg-muted/50",
                              currentChapterId === chapter.id &&
                                "bg-accent text-accent-foreground",
                              editingId === chapter.id && "bg-muted"
                            )}
                            onClick={() => setCurrentChapter(chapter.id)}
                            onDoubleClick={() =>
                              startRename(
                                chapter.id,
                                chapter.title,
                                "chapter"
                              )
                            }
                          >
                            <GripVertical className="size-3 shrink-0 text-muted-foreground/50" />
                            <FileText className="size-3.5 shrink-0 text-muted-foreground" />

                            {editingId === chapter.id ? (
                              <div className="flex flex-1 items-center gap-1">
                                <Input
                                  value={editingText}
                                  onChange={(e) =>
                                    setEditingText(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") confirmRename();
                                    if (e.key === "Escape") cancelRename();
                                  }}
                                  className="h-6 text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmRename();
                                  }}
                                >
                                  <Check className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelRename();
                                  }}
                                >
                                  <X className="size-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 truncate text-xs">
                                  {chapter.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] px-1 py-0",
                                    getStatusColor(chapter.status)
                                  )}
                                >
                                  {CHAPTER_STATUS_LABELS[chapter.status]}
                                </Badge>
                                {chapter.word_count > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {chapter.word_count}字
                                  </span>
                                )}
                                <div className="hidden items-center gap-0.5 group-hover:flex">
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveChapter(chapter.id, "up");
                                    }}
                                    disabled={idx === 0}
                                  >
                                    <ChevronUp className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveChapter(chapter.id, "down");
                                    }}
                                    disabled={
                                      idx === volumeChapters.length - 1
                                    }
                                  >
                                    <ChevronDown className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({
                                        type: "chapter",
                                        id: chapter.id,
                                        title: chapter.title,
                                      });
                                    }}
                                  >
                                    <Trash2 className="size-3 text-destructive" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除"{deleteTarget?.title}"吗？
              {deleteTarget?.type === "volume" &&
                "该卷下的所有章节也将被删除。"}
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
