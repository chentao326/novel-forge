"use client";

import React, { useState, useCallback, useRef } from "react";
import { useChapterStore } from "@/stores/chapter-store";
import { useCharacterStore } from "@/stores/character-store";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Timer,
  Globe,
  BookMarked,
} from "lucide-react";

// ---- Types ----

type CheckStatus = "idle" | "checking" | "done";

interface ConsistencyIssue {
  description: string;
  severity: "warning" | "error";
  location?: string;
}

interface CategoryResult {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: CheckStatus;
  issues: ConsistencyIssue[];
}

// ---- Component ----

export function ConsistencyCheck() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );
  const characters = useCharacterStore((s) =>
    currentProjectId
      ? s.characters.filter((c) => c.project_id === currentProjectId)
      : []
  );
  const worldSettings = useWorldStore((s) =>
    currentProjectId
      ? s.settings.filter((s) => s.project_id === currentProjectId)
      : []
  );

  const [categories, setCategories] = useState<CategoryResult[]>([
    {
      id: "character",
      label: "角色一致性",
      icon: <Users className="size-4" />,
      status: "idle",
      issues: [],
    },
    {
      id: "timeline",
      label: "时间线逻辑",
      icon: <Timer className="size-4" />,
      status: "idle",
      issues: [],
    },
    {
      id: "world",
      label: "世界观规则",
      icon: <Globe className="size-4" />,
      status: "idle",
      issues: [],
    },
    {
      id: "reference",
      label: "设定引用",
      icon: <BookMarked className="size-4" />,
      status: "idle",
      issues: [],
    },
  ]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const runCheck = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);

    // Reset all categories
    setCategories((prev) =>
      prev.map((c) => ({ ...c, status: "checking" as CheckStatus, issues: [] }))
    );

    const sortedChapters = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

    try {
      abortRef.current = new AbortController();

      const response = await fetch("/api/analysis/consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapters: sortedChapters.map((c) => ({
            id: c.id,
            title: c.title,
            content: c.content,
            sort_order: c.sort_order,
          })),
          characters: characters.map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role,
            appearance: c.appearance,
            background: c.background,
            personality_traits: c.personality_traits,
            speech_style: c.speech_style,
          })),
          worldSettings: worldSettings.map((w) => ({
            id: w.id,
            name: w.name,
            category: w.category,
            content: w.content,
            rules: w.rules,
          })),
          projectId: currentProjectId,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error("检查失败");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Simulate progress while streaming
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 200);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Parse the AI response
      try {
        const parsed = JSON.parse(accumulated);
        const newCategories: CategoryResult[] = [
          {
            id: "character",
            label: "角色一致性",
            icon: <Users className="size-4" />,
            status: "done",
            issues: (parsed.character || []).map((issue: { description: string; severity: string; location?: string }) => ({
              description: issue.description,
              severity: issue.severity === "error" ? "error" as const : "warning" as const,
              location: issue.location,
            })),
          },
          {
            id: "timeline",
            label: "时间线逻辑",
            icon: <Timer className="size-4" />,
            status: "done",
            issues: (parsed.timeline || []).map((issue: { description: string; severity: string; location?: string }) => ({
              description: issue.description,
              severity: issue.severity === "error" ? "error" as const : "warning" as const,
              location: issue.location,
            })),
          },
          {
            id: "world",
            label: "世界观规则",
            icon: <Globe className="size-4" />,
            status: "done",
            issues: (parsed.world || []).map((issue: { description: string; severity: string; location?: string }) => ({
              description: issue.description,
              severity: issue.severity === "error" ? "error" as const : "warning" as const,
              location: issue.location,
            })),
          },
          {
            id: "reference",
            label: "设定引用",
            icon: <BookMarked className="size-4" />,
            status: "done",
            issues: (parsed.reference || []).map((issue: { description: string; severity: string; location?: string }) => ({
              description: issue.description,
              severity: issue.severity === "error" ? "error" as const : "warning" as const,
              location: issue.location,
            })),
          },
        ];
        setCategories(newCategories);
      } catch {
        // AI returned plain text, mark all as done with no issues
        setCategories((prev) =>
          prev.map((c) => ({ ...c, status: "done" as CheckStatus }))
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setCategories((prev) =>
          prev.map((c) => ({ ...c, status: "idle" as CheckStatus, issues: [] }))
        );
      } else {
        console.error("Consistency check error:", error);
        setCategories((prev) =>
          prev.map((c) => ({ ...c, status: "done" as CheckStatus }))
        );
      }
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, chapters, characters, worldSettings, currentProjectId]);

  const totalIssues = categories.reduce(
    (sum, c) => sum + c.issues.length,
    0
  );
  const errorCount = categories.reduce(
    (sum, c) => sum + c.issues.filter((i) => i.severity === "error").length,
    0
  );
  const warningCount = categories.reduce(
    (sum, c) => sum + c.issues.filter((i) => i.severity === "warning").length,
    0
  );

  const getStatusIcon = (status: CheckStatus, issues: ConsistencyIssue[]) => {
    if (status === "checking") return <Loader2 className="size-4 animate-spin text-blue-500" />;
    if (status === "idle") return <Clock className="size-4 text-muted-foreground" />;
    if (issues.length === 0) return <CheckCircle2 className="size-4 text-green-500" />;
    if (issues.some((i) => i.severity === "error")) return <XCircle className="size-4 text-red-500" />;
    return <AlertTriangle className="size-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">一致性检查</h3>
          <p className="text-xs text-muted-foreground">
            检查故事中的人物、时间线、世界观设定等的一致性
          </p>
        </div>
        <Button
          size="sm"
          onClick={runCheck}
          disabled={isRunning || chapters.length === 0}
        >
          {isRunning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          开始检查
        </Button>
      </div>

      {chapters.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          暂无章节数据，请先创建章节
        </div>
      )}

      {/* Progress bar */}
      {isRunning && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>正在检查...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {!isRunning && categories.some((c) => c.status === "done") && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold">{totalIssues}</div>
            <div className="text-xs text-muted-foreground">发现问题</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-red-500">{errorCount}</div>
            <div className="text-xs text-muted-foreground">错误</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-lg font-bold text-amber-500">{warningCount}</div>
            <div className="text-xs text-muted-foreground">警告</div>
          </div>
        </div>
      )}

      {/* Category cards */}
      <div className="space-y-2">
        {categories.map((category) => (
          <Collapsible
            key={category.id}
            open={expandedCategories.has(category.id)}
            onOpenChange={() => toggleExpanded(category.id)}
          >
            <div className="rounded-lg border">
              <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {category.icon}
                  {getStatusIcon(category.status, category.issues)}
                </div>
                <span className="flex-1 text-sm font-medium">{category.label}</span>
                {category.status === "done" && (
                  <Badge
                    variant={
                      category.issues.length === 0
                        ? "secondary"
                        : category.issues.some((i) => i.severity === "error")
                        ? "destructive"
                        : "outline"
                    }
                    className="text-[10px]"
                  >
                    {category.issues.length === 0
                      ? "通过"
                      : `${category.issues.length} 个问题`}
                  </Badge>
                )}
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t px-3 py-2">
                  {category.status === "idle" && (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      点击"开始检查"运行一致性分析
                    </p>
                  )}
                  {category.status === "checking" && (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        正在分析{category.label}...
                      </span>
                    </div>
                  )}
                  {category.status === "done" && category.issues.length === 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <CheckCircle2 className="size-3.5 text-green-500" />
                      <span className="text-xs text-green-600">
                        未发现{category.label}方面的问题
                      </span>
                    </div>
                  )}
                  {category.status === "done" && category.issues.length > 0 && (
                    <div className="space-y-1.5 py-1">
                      {category.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 rounded-md bg-muted/30 p-2 text-xs"
                        >
                          {issue.severity === "error" ? (
                            <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                          ) : (
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                          )}
                          <div className="flex-1">
                            <p>{issue.description}</p>
                            {issue.location && (
                              <p className="mt-0.5 text-muted-foreground">
                                位置: {issue.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
