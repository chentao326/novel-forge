"use client";

import React, { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, FileCode, Globe, BookOpen } from "lucide-react";
import {
  exportToTxt,
  exportToMarkdown,
  exportToHtml,
  exportToEpubViaApi,
} from "@/lib/export/export-utils";
import type { Chapter } from "@/lib/types";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "txt" | "markdown" | "html" | "epub";

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const currentProject = useProjectStore((s) => s.getCurrentProject());
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );

  const [format, setFormat] = useState<ExportFormat>("txt");
  const [includeTitles, setIncludeTitles] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.sort_order - b.sort_order),
    [chapters]
  );

  const totalWordCount = useMemo(
    () => chapters.reduce((sum, c) => sum + c.word_count, 0),
    [chapters]
  );

  const handleExport = async () => {
    if (chapters.length === 0) return;
    setIsExporting(true);

    try {
      let blob: Blob;
      let filename: string;
      const title = currentProject?.title || "未命名作品";

      switch (format) {
        case "txt":
          blob = await exportToTxt(chapters, { includeTitles });
          filename = `${title}.txt`;
          break;
        case "markdown":
          blob = await exportToMarkdown(chapters, { includeTitles });
          filename = `${title}.md`;
          break;
        case "html":
          blob = await exportToHtml(chapters, title, {
            includeTitles,
            authorName: authorName || undefined,
          });
          filename = `${title}.html`;
          break;
        case "epub":
          blob = await exportToEpubViaApi(chapters, title, {
            includeTitles,
            authorName: authorName || undefined,
          });
          filename = `${title}.epub`;
          break;
      }

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions: {
    value: ExportFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "txt",
      label: "纯文本 (TXT)",
      description: "简单的纯文本格式，兼容所有设备",
      icon: <FileText className="size-5" />,
    },
    {
      value: "markdown",
      label: "Markdown (MD)",
      description: "保留基本格式，适合发布到博客或笔记",
      icon: <FileCode className="size-5" />,
    },
    {
      value: "html",
      label: "HTML 网页",
      description: "带样式的网页文档，可直接在浏览器中打开",
      icon: <Globe className="size-5" />,
    },
    {
      value: "epub",
      label: "电子书 (EPUB)",
      description: "标准电子书格式，可在阅读器中打开",
      icon: <BookOpen className="size-5" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导出作品</DialogTitle>
          <DialogDescription>
            将作品导出为不同格式的文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>导出格式</Label>
            <div className="grid gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    format === opt.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setFormat(opt.value)}
                >
                  {opt.icon}
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-titles">包含章节标题</Label>
              <Switch
                id="include-titles"
                checked={includeTitles}
                onCheckedChange={setIncludeTitles}
              />
            </div>

            {(format === "html" || format === "epub") && (
              <div className="space-y-2">
                <Label htmlFor="author-name">作者署名</Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="输入作者名称（可选）"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground">导出预览</div>
            <div className="text-sm">
              <span className="font-medium">{currentProject?.title || "未命名作品"}</span>
              <span className="text-muted-foreground"> - {chapters.length} 章 / {totalWordCount} 字</span>
            </div>
            {sortedChapters.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {sortedChapters.slice(0, 3).map((c) => c.title).join("、")}
                {sortedChapters.length > 3 && ` 等 ${sortedChapters.length} 章`}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={chapters.length === 0 || isExporting}
          >
            <Download className="size-4" />
            {isExporting ? "导出中..." : "下载"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
