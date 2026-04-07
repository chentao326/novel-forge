"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useChapterStore } from "@/stores/chapter-store";
import { TipTapEditor } from "@/components/writing/editor";
import { ChapterTree } from "@/components/writing/chapter-tree";
import { ContextSidebar } from "@/components/writing/context-sidebar";
import { ExportDialog } from "@/components/writing/export-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Download,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WritingPage() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const currentProject = useProjectStore((s) => s.getCurrentProject());
  const currentChapter = useChapterStore((s) => s.getCurrentChapter());
  const updateChapter = useChapterStore((s) => s.updateChapter);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );

  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileChapterSheetOpen, setMobileChapterSheetOpen] = useState(false);

  // Calculate total word count
  const totalWordCount = chapters.reduce((sum, c) => sum + c.word_count, 0);

  const handleEditorUpdate = useCallback(
    (content: string, wordCount: number) => {
      if (currentChapter) {
        updateChapter(currentChapter.id, {
          content,
          word_count: wordCount,
          status:
            currentChapter.status === "outline"
              ? "draft"
              : currentChapter.status,
        });
      }
    },
    [currentChapter, updateChapter]
  );

  const handleInsertReference = useCallback(
    (text: string) => {
      // This would insert text at cursor position in the editor
      // For now, we just log it
      console.log("Insert reference:", text);
    },
    []
  );

  const handleExport = useCallback(() => {
    setExportOpen(true);
  }, []);

  const handleAIContinue = useCallback(() => {
    // Triggered from mobile bottom toolbar - the editor handles this internally
    // This is a placeholder for future mobile AI integration
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+E: open export dialog
      if ((event.ctrlKey || event.metaKey) && event.key === "e") {
        event.preventDefault();
        setExportOpen(true);
      }
      // Ctrl+Shift+F: toggle zen mode
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "F") {
        event.preventDefault();
        setZenMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  if (!currentChapter) {
    return (
      <div className="flex h-full">
        {/* Left panel still visible - hidden on mobile */}
        <div
          className={cn(
            "shrink-0 border-r transition-all duration-200 max-md:hidden",
            leftPanelOpen ? "w-64" : "w-0 overflow-hidden"
          )}
        >
          {leftPanelOpen && <ChapterTree />}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center px-4">
            <h2 className="mb-2 text-lg font-medium">
              {currentProject.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              请从左侧目录选择或创建一个章节开始写作
            </p>
            {/* Mobile: show button to open chapter sheet */}
            <Button
              variant="outline"
              className="mt-4 md:hidden"
              onClick={() => setMobileChapterSheetOpen(true)}
            >
              <BookOpen className="size-4" />
              打开章节目录
            </Button>
          </div>
        </div>

        {/* Mobile chapter sheet */}
        <Sheet open={mobileChapterSheetOpen} onOpenChange={setMobileChapterSheetOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>章节目录</SheetTitle>
              <SheetDescription>选择章节开始写作</SheetDescription>
            </SheetHeader>
            <ChapterTree />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", zenMode && "overflow-hidden")}>
      {/* Left Panel - Chapter Tree (hidden on mobile, use Sheet instead) */}
      {!zenMode && (
        <div
          className={cn(
            "shrink-0 border-r transition-all duration-200 max-md:hidden",
            leftPanelOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
          )}
        >
          {leftPanelOpen && <ChapterTree />}
        </div>
      )}

      {/* Center - Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with panel toggles */}
        {!zenMode && (
          <div className="flex items-center gap-1 border-b px-2 py-1">
            {/* Desktop: left panel toggle */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="max-md:hidden"
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              title={leftPanelOpen ? "收起目录" : "展开目录"}
            >
              {leftPanelOpen ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeftOpen className="size-4" />
              )}
            </Button>
            {/* Mobile: chapter list button */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="md:hidden"
              onClick={() => setMobileChapterSheetOpen(true)}
              title="章节目录"
            >
              <BookOpen className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex-1 truncate text-sm font-medium">
              {currentProject.title} / {currentChapter.title}
            </span>
            {/* Word count display */}
            <span className="hidden text-xs text-muted-foreground sm:inline-block">
              共 {totalWordCount.toLocaleString()} 字
            </span>
            <Separator orientation="vertical" className="mx-1 h-4 max-sm:hidden" />
            {/* Export button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleExport}
              title="导出 (Ctrl+E)"
            >
              <Download className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-4 max-md:hidden" />
            {/* Desktop: right panel toggle */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="max-md:hidden"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              title={rightPanelOpen ? "收起参考" : "展开参考"}
            >
              {rightPanelOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </Button>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <TipTapEditor
            content={currentChapter.content}
            chapterId={currentChapter.id}
            projectId={currentProjectId}
            onUpdate={handleEditorUpdate}
            zenMode={zenMode}
            onToggleZen={() => setZenMode(!zenMode)}
            onExport={handleExport}
          />
        </div>

        {/* Mobile bottom toolbar */}
        <div className="flex items-center justify-around border-t bg-background py-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileChapterSheetOpen(true)}
            className="flex-col gap-0.5 h-auto py-1 px-3"
          >
            <BookOpen className="size-4" />
            <span className="text-[10px]">目录</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Trigger AI panel via a custom event the editor can listen to
              window.dispatchEvent(new CustomEvent("mobile-ai-continue"));
            }}
            className="flex-col gap-0.5 h-auto py-1 px-3 text-amber-500"
          >
            <Sparkles className="size-4" />
            <span className="text-[10px]">AI助手</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="flex-col gap-0.5 h-auto py-1 px-3"
          >
            <Download className="size-4" />
            <span className="text-[10px]">导出</span>
          </Button>
        </div>
      </div>

      {/* Right Panel - Context Sidebar (hidden on mobile) */}
      {!zenMode && (
        <div
          className={cn(
            "shrink-0 border-l transition-all duration-200 max-md:hidden",
            rightPanelOpen ? "w-72" : "w-0 overflow-hidden border-l-0"
          )}
        >
          {rightPanelOpen && (
            <ContextSidebar onInsertReference={handleInsertReference} />
          )}
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />

      {/* Mobile chapter sheet */}
      <Sheet open={mobileChapterSheetOpen} onOpenChange={setMobileChapterSheetOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>章节目录</SheetTitle>
            <SheetDescription>选择章节开始写作</SheetDescription>
          </SheetHeader>
          <ChapterTree />
        </SheetContent>
      </Sheet>
    </div>
  );
}
