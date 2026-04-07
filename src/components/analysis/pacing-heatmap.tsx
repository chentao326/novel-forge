"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useChapterStore } from "@/stores/chapter-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Sparkles, Loader2, Activity } from "lucide-react";

// ---- Intensity Score Heuristic ----

interface ChapterIntensity {
  chapterId: string;
  title: string;
  score: number;
  dialogueRatio: number;
  avgSentenceLength: number;
  exclamationCount: number;
  actionVerbCount: number;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function calculateIntensity(content: string): Omit<ChapterIntensity, "chapterId" | "title"> {
  const plain = stripHtml(content);
  if (!plain) {
    return { score: 0, dialogueRatio: 0, avgSentenceLength: 0, exclamationCount: 0, actionVerbCount: 0 };
  }

  const chineseChars = plain.replace(/[^\u4e00-\u9fff]/g, "");
  const totalChars = chineseChars.length;

  // Dialogue ratio
  const dialogueMatches = plain.match(/[""「」『』][^"""「」『』]*[""「」『』]/g);
  const dialogueChars = dialogueMatches
    ? dialogueMatches.join("").replace(/[""「」『』]/g, "").length
    : 0;
  const dialogueRatio = totalChars > 0 ? dialogueChars / totalChars : 0;

  // Sentence length variance
  const sentences = plain.split(/[。！？.!?\n]+/).map((s) => s.trim()).filter(Boolean);
  const sentenceLengths = sentences.map((s) => s.replace(/[^\u4e00-\u9fff]/g, "").length);
  const avgSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;
  const variance =
    sentenceLengths.length > 1
      ? sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) /
        sentenceLengths.length
      : 0;
  const normalizedVariance = Math.min(variance / 500, 1);

  // Exclamation marks
  const exclamationCount = (plain.match(/[！!]/g) || []).length;
  const normalizedExclamations = Math.min(exclamationCount / 10, 1);

  // Action verbs (common Chinese action verbs)
  const actionVerbs = [
    "冲", "跑", "打", "砍", "杀", "追", "逃", "跳", "飞", "摔",
    "抓", "踢", "推", "拉", "砸", "刺", "闪", "躲", "扑", "撞",
    "撕", "咬", "吼", "叫", "哭", "怒", "惊", "怕", "战", "抖",
    "拔", "挥", "劈", "扫", "射", "爆", "燃", "碎", "裂", "破",
  ];
  let actionVerbCount = 0;
  for (const verb of actionVerbs) {
    const matches = plain.match(new RegExp(verb, "g"));
    if (matches) actionVerbCount += matches.length;
  }
  const normalizedActionVerbs = Math.min(actionVerbCount / 20, 1);

  // Composite score (0-100)
  const score = Math.round(
    dialogueRatio * 25 +
    normalizedVariance * 20 +
    normalizedExclamations * 25 +
    normalizedActionVerbs * 30
  );

  return {
    score: Math.min(score, 100),
    dialogueRatio: Math.round(dialogueRatio * 1000) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    exclamationCount,
    actionVerbCount,
  };
}

function getScoreColor(score: number): string {
  if (score <= 25) return "bg-blue-400";
  if (score <= 50) return "bg-green-400";
  if (score <= 75) return "bg-yellow-400";
  return "bg-red-400";
}

function getScoreLabel(score: number): string {
  if (score <= 25) return "平静";
  if (score <= 50) return "舒缓";
  if (score <= 75) return "紧张";
  return "高潮";
}

// ---- AI Types ----

interface PacingSuggestion {
  chapter: string;
  suggestion: string;
}

// ---- Component ----

export function PacingHeatmap() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );

  const [aiSuggestions, setAiSuggestions] = useState<PacingSuggestion[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.sort_order - b.sort_order),
    [chapters]
  );

  const intensities = useMemo<ChapterIntensity[]>(() => {
    return sortedChapters.map((chapter) => ({
      chapterId: chapter.id,
      title: chapter.title,
      ...calculateIntensity(chapter.content),
    }));
  }, [sortedChapters]);

  const maxScore = useMemo(
    () => Math.max(...intensities.map((i) => i.score), 1),
    [intensities]
  );

  const handleAIAnalysis = useCallback(async () => {
    if (sortedChapters.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiSuggestions([]);
    setAiAnalysis("");

    try {
      abortRef.current = new AbortController();
      const response = await fetch("/api/analysis/pacing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapters: sortedChapters.map((c) => ({
            id: c.id,
            title: c.title,
            content: c.content,
            word_count: c.word_count,
          })),
          projectId: currentProjectId,
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
        setAiAnalysis(accumulated);
      }

      // Parse suggestions from AI response
      try {
        const parsed = JSON.parse(accumulated);
        if (parsed.suggestions) {
          setAiSuggestions(parsed.suggestions);
          setAiAnalysis(parsed.summary || "");
        }
      } catch {
        // AI returned plain text, just show it
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("AI pacing analysis error:", error);
      setAiAnalysis("分析失败，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  }, [sortedChapters, currentProjectId, isAnalyzing]);

  if (chapters.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        暂无章节数据，请先创建章节
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heatmap Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">节奏强度热力图</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-sm bg-blue-400" />
              平静
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-sm bg-green-400" />
              舒缓
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-sm bg-yellow-400" />
              紧张
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-sm bg-red-400" />
              高潮
            </span>
          </div>
        </div>

        {/* Y-axis label */}
        <div className="flex gap-2">
          <div className="flex w-12 items-end justify-end pb-7">
            <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap origin-center">
              强度 (0-100)
            </span>
          </div>

          <div className="flex-1">
            {/* Chart area */}
            <div className="relative h-48 rounded-lg border bg-muted/20 p-3">
              {/* Y-axis grid lines */}
              <div className="absolute inset-x-3 top-3 bottom-7 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="relative">
                    <span className="absolute -left-1 -top-2 text-[10px] text-muted-foreground">
                      {val}
                    </span>
                    <div className="w-full border-b border-dashed border-muted-foreground/20" />
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-x-3 top-3 bottom-7 flex items-end gap-1">
                {intensities.map((item, index) => {
                  const height = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
                  return (
                    <TooltipProvider key={item.chapterId}>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <div
                              className={`flex-1 min-w-[8px] rounded-t transition-all cursor-default ${getScoreColor(item.score)}`}
                              style={{ height: `${Math.max(height, 3)}%` }}
                            />
                          }
                        />
                        <TooltipContent side="top">
                          <div className="text-center">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-muted-foreground">
                              强度: {item.score} ({getScoreLabel(item.score)})
                            </div>
                            <div className="text-muted-foreground">
                              对话占比: {item.dialogueRatio}% | 平均句长: {item.avgSentenceLength}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>

              {/* X-axis chapter labels */}
              <div className="absolute inset-x-3 bottom-0 flex gap-1 overflow-x-auto">
                {intensities.map((item, index) => (
                  <div
                    key={item.chapterId}
                    className="flex-1 min-w-[8px] text-center text-[9px] text-muted-foreground truncate"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis label */}
            <div className="mt-1 text-center text-xs text-muted-foreground">
              章节编号
            </div>
          </div>
        </div>
      </div>

      {/* Chapter intensity details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">各章节强度详情</h4>
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className="w-8">章节</span>
            <span>强度条</span>
            <span className="w-10 text-right">分数</span>
            <span className="w-10 text-right">状态</span>
          </div>
          {intensities.map((item, index) => (
            <div
              key={item.chapterId}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center border-t px-3 py-2 text-sm"
            >
              <span className="w-8 text-muted-foreground text-xs">{index + 1}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-24">
                  {item.title}
                </span>
              </div>
              <span className="w-10 text-right text-xs tabular-nums">{item.score}</span>
              <span className={`w-10 text-right text-xs ${item.score > 75 ? "text-red-500 font-medium" : item.score > 50 ? "text-yellow-600" : "text-muted-foreground"}`}>
                {getScoreLabel(item.score)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Button */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || sortedChapters.length === 0}
          >
            {isAnalyzing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            AI分析节奏
          </Button>
          {isAnalyzing && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => abortRef.current?.abort()}
            >
              停止
            </Button>
          )}
        </div>

        {/* AI Summary */}
        {aiAnalysis && (
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-primary" />
              <span className="text-sm font-medium">AI 节奏分析</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI 改进建议</h4>
            <div className="space-y-1.5">
              {aiSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                >
                  <span className="shrink-0 mt-0.5 size-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium">{s.chapter}</span>
                    <span className="text-muted-foreground ml-1">{s.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
