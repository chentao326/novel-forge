"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChapterStore } from "@/stores/chapter-store";
import { useProjectStore } from "@/stores/project-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Type,
  FileText,
  Quote,
  Hash,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { ChapterStatus } from "@/lib/types";
import { CHAPTER_STATUS_LABELS } from "@/lib/types";

// ---- Helpers ----

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function countParagraphs(content: string): number {
  const plain = stripHtml(content);
  if (!plain) return 0;
  return plain.split(/\n\s*\n|\n/).filter((p) => p.trim().length > 0).length;
}

function calcDialogueRatio(content: string): number {
  const plain = stripHtml(content);
  if (!plain) return 0;
  const chineseChars = plain.replace(/[^\u4e00-\u9fff]/g, "");
  const totalChars = chineseChars.length;
  if (totalChars === 0) return 0;
  const dialogueMatches = plain.match(/[""「」『』][^"""「」『』]*[""「」『』]/g);
  const dialogueChars = dialogueMatches
    ? dialogueMatches.join("").replace(/[""「」『』]/g, "").length
    : 0;
  return Math.round((dialogueChars / totalChars) * 1000) / 10;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;

    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// ---- Types ----

type SortKey = "title" | "word_count" | "paragraphs" | "dialogue_ratio" | "status" | "updated_at" | "sort_order";
type SortDir = "asc" | "desc";

interface ChapterRow {
  id: string;
  title: string;
  word_count: number;
  paragraphs: number;
  dialogue_ratio: number;
  status: ChapterStatus;
  updated_at: string;
}

// ---- Component ----

export function ChapterOverview() {
  const router = useRouter();
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );

  const [sortKey, setSortKey] = useState<SortKey>("sort_order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo<ChapterRow[]>(() => {
    return chapters.map((c) => ({
      id: c.id,
      title: c.title,
      word_count: c.word_count,
      paragraphs: countParagraphs(c.content),
      dialogue_ratio: calcDialogueRatio(c.content),
      status: c.status,
      updated_at: c.updated_at,
    }));
  }, [chapters]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title, "zh-CN");
          break;
        case "word_count":
          cmp = a.word_count - b.word_count;
          break;
        case "paragraphs":
          cmp = a.paragraphs - b.paragraphs;
          break;
        case "dialogue_ratio":
          cmp = a.dialogue_ratio - b.dialogue_ratio;
          break;
        case "status": {
          const order: Record<ChapterStatus, number> = {
            outline: 0,
            draft: 1,
            first_draft: 2,
            polished: 3,
            final: 4,
          };
          cmp = order[a.status] - order[b.status];
          break;
        }
        case "updated_at":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        default: {
          // sort_order from original chapters
          const chA = chapters.find((c) => c.id === a.id);
          const chB = chapters.find((c) => c.id === b.id);
          cmp = (chA?.sort_order ?? 0) - (chB?.sort_order ?? 0);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortKey, sortDir, chapters]);

  const summary = useMemo(() => {
    const totalWords = rows.reduce((s, r) => s + r.word_count, 0);
    const totalChapters = rows.length;
    const avgWords = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;
    const longest = rows.length > 0 ? rows.reduce((max, r) => (r.word_count > max.word_count ? r : max), rows[0]) : null;
    const shortest = rows.length > 0 ? rows.reduce((min, r) => (r.word_count < min.word_count ? r : min), rows[0]) : null;
    const finalCount = rows.filter((r) => r.status === "final").length;
    const completionPct = totalChapters > 0 ? Math.round((finalCount / totalChapters) * 100) : 0;

    return {
      totalWords,
      totalChapters,
      avgWords,
      longest,
      shortest,
      finalCount,
      completionPct,
    };
  }, [rows]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleRowClick = (chapterId: string) => {
    router.push(`/desk?chapter=${chapterId}`);
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUp className="size-3 opacity-0" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    );
  };

  if (chapters.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        暂无章节数据，请先创建章节
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-3 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Type className="size-4 text-blue-500" />
            <span className="text-xs">总字数</span>
          </div>
          <div className="text-lg font-bold">
            {summary.totalWords.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="size-4 text-green-500" />
            <span className="text-xs">总章数 / 平均字数</span>
          </div>
          <div className="text-lg font-bold">
            {summary.totalChapters} 章 / {summary.avgWords.toLocaleString()} 字
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Quote className="size-4 text-amber-500" />
            <span className="text-xs">最长 / 最短章</span>
          </div>
          <div className="text-sm font-bold">
            {summary.longest ? (
              <>
                <span className="text-green-600">{summary.longest.word_count.toLocaleString()}</span>
                {" / "}
                <span className="text-red-500">{summary.shortest?.word_count.toLocaleString()}</span>
              </>
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-4 text-purple-500" />
            <span className="text-xs">完成进度</span>
          </div>
          <div className="text-lg font-bold">{summary.completionPct}%</div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${summary.completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapter Table */}
      <div className="rounded-lg border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("title")}
          >
            章节名
            <SortIcon columnKey="title" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("word_count")}
          >
            字数
            <SortIcon columnKey="word_count" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("paragraphs")}
          >
            段落数
            <SortIcon columnKey="paragraphs" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("dialogue_ratio")}
          >
            对话占比
            <SortIcon columnKey="dialogue_ratio" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("status")}
          >
            状态
            <SortIcon columnKey="status" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="justify-start font-medium -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSort("updated_at")}
          >
            最后修改
            <SortIcon columnKey="updated_at" />
          </Button>
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {sortedRows.map((row) => (
            <button
              key={row.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleRowClick(row.id)}
            >
              <span className="font-medium truncate">{row.title}</span>
              <span className="tabular-nums text-muted-foreground">
                {row.word_count.toLocaleString()}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {row.paragraphs}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {row.dialogue_ratio}%
              </span>
              <span>
                <Badge
                  variant={
                    row.status === "final"
                      ? "secondary"
                      : row.status === "polished"
                      ? "outline"
                      : "ghost"
                  }
                  className="text-[10px]"
                >
                  {CHAPTER_STATUS_LABELS[row.status]}
                </Badge>
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(row.updated_at)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
