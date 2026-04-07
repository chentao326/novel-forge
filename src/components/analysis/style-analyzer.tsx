"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useChapterStore } from "@/stores/chapter-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, BarChart3, FileText, Type, Quote, BookOpen } from "lucide-react";

// Common Chinese words to exclude from frequency analysis
const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一", "一个",
  "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好",
  "自己", "这", "他", "她", "它", "们", "那", "里", "把", "被", "让", "给", "从",
  "对", "而", "但", "又", "与", "或", "如", "却", "还", "已", "之", "以", "于",
  "中", "来", "过", "下", "能", "可以", "这个", "那个", "什么", "怎么", "为什么",
  "因为", "所以", "如果", "虽然", "但是", "可是", "然而", "不过", "只是", "然后",
  "于是", "接着", "之后", "之前", "时候", "起来", "出来", "下来", "上去", "过去",
  "回来", "进来", "出去", "知道", "觉得", "认为", "应该", "可能", "已经", "正在",
  "一些", "这些", "那些", "这样", "那样", "这么", "那么", "多么", "非常", "十分",
  "比较", "更", "最", "太", "真", "真的", "吗", "呢", "吧", "啊", "呀", "哦",
  "嗯", "哈", "嘿", "哎", "唉", "喔", "嘛", "啦", "呗", "喽", "只", "才", "都",
  "再", "又", "也", "还", "就", "都", "便", "即", "则", "乃", "且", "并", "而",
  "所", "其", "此", "该", "每", "各", "某", "任何", "所有", "其他", "另外",
]);

interface AnalysisResult {
  totalWords: number;
  totalChars: number;
  avgSentenceLength: number;
  dialogueRatio: number;
  avgParagraphLength: number;
  vocabularyDiversity: number;
  topWords: { word: string; count: number }[];
  paragraphLengths: number[];
}

function analyzeText(text: string): AnalysisResult {
  // Strip HTML tags
  const plainText = text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  if (!plainText) {
    return {
      totalWords: 0,
      totalChars: 0,
      avgSentenceLength: 0,
      dialogueRatio: 0,
      avgParagraphLength: 0,
      vocabularyDiversity: 0,
      topWords: [],
      paragraphLengths: [],
    };
  }

  // Total characters (Chinese characters)
  const chineseChars = plainText.replace(/[^\u4e00-\u9fff]/g, "");
  const totalChars = chineseChars.length;

  // Total words (Chinese characters count as words)
  const totalWords = totalChars;

  // Sentences (split by Chinese/English sentence endings)
  const sentences = plainText
    .split(/[。！？.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const avgSentenceLength =
    sentences.length > 0 ? totalWords / sentences.length : 0;

  // Dialogue detection (count text within quotation marks)
  const dialogueMatches = plainText.match(/[""「」『』《》][^"""「」『』《》]*[""「」『』《》]/g);
  const dialogueChars = dialogueMatches
    ? dialogueMatches.join("").replace(/[""「」『』《》]/g, "").length
    : 0;
  const dialogueRatio = totalChars > 0 ? dialogueChars / totalChars : 0;

  // Paragraphs
  const paragraphs = plainText
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const paragraphLengths = paragraphs.map((p) => p.replace(/[^\u4e00-\u9fff]/g, "").length);
  const avgParagraphLength =
    paragraphLengths.length > 0
      ? paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
      : 0;

  // Vocabulary diversity
  const charArray = chineseChars.split("");
  const uniqueChars = new Set(charArray);
  const vocabularyDiversity =
    charArray.length > 0 ? uniqueChars.size / charArray.length : 0;

  // Word frequency (bigrams for Chinese)
  const wordFreq = new Map<string, number>();
  // Single characters
  for (const char of charArray) {
    if (!STOP_WORDS.has(char)) {
      wordFreq.set(char, (wordFreq.get(char) || 0) + 1);
    }
  }
  // Bigrams
  for (let i = 0; i < charArray.length - 1; i++) {
    const bigram = charArray[i] + charArray[i + 1];
    if (!STOP_WORDS.has(bigram) && !STOP_WORDS.has(charArray[i]) && !STOP_WORDS.has(charArray[i + 1])) {
      wordFreq.set(bigram, (wordFreq.get(bigram) || 0) + 1);
    }
  }
  // Trigrams
  for (let i = 0; i < charArray.length - 2; i++) {
    const trigram = charArray[i] + charArray[i + 1] + charArray[i + 2];
    if (
      !STOP_WORDS.has(trigram) &&
      !STOP_WORDS.has(charArray[i]) &&
      !STOP_WORDS.has(charArray[i + 1]) &&
      !STOP_WORDS.has(charArray[i + 2])
    ) {
      wordFreq.set(trigram, (wordFreq.get(trigram) || 0) + 1);
    }
  }

  const topWords: { word: string; count: number }[] = Array.from(wordFreq.entries())
    .filter(([word]) => word.length >= 2) // Only show 2+ character words
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  return {
    totalWords,
    totalChars,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    dialogueRatio: Math.round(dialogueRatio * 1000) / 10,
    avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
    vocabularyDiversity: Math.round(vocabularyDiversity * 1000) / 10,
    topWords,
    paragraphLengths,
  };
}

export function StyleAnalyzer() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const chapters = useChapterStore((s) =>
    currentProjectId
      ? s.chapters.filter((c) => c.project_id === currentProjectId)
      : []
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
  const [customText, setCustomText] = useState("");
  const [inputMode, setInputMode] = useState<"chapter" | "custom">("chapter");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.sort_order - b.sort_order),
    [chapters]
  );

  const analysisText = useMemo(() => {
    if (inputMode === "custom") return customText;
    if (selectedChapterId === "all") {
      return sortedChapters.map((c) => c.content).join("\n\n");
    }
    const chapter = chapters.find((c) => c.id === selectedChapterId);
    return chapter?.content || "";
  }, [inputMode, customText, selectedChapterId, chapters, sortedChapters]);

  const result = useMemo(() => analyzeText(analysisText), [analysisText]);

  const handleAIAnalysis = useCallback(async () => {
    if (!analysisText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      abortRef.current = new AbortController();
      const response = await fetch("/api/analysis/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: analysisText.slice(0, 5000), // Limit text size
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
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("AI analysis error:", error);
      setAiAnalysis("分析失败，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisText, currentProjectId, isAnalyzing]);

  const maxTopCount = result.topWords.length > 0 ? result.topWords[0].count : 1;

  return (
    <div className="space-y-6">
      {/* Input selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={inputMode === "chapter" ? "default" : "outline"}
            onClick={() => setInputMode("chapter")}
          >
            <BookOpen className="size-4" />选择章节
          </Button>
          <Button
            size="sm"
            variant={inputMode === "custom" ? "default" : "outline"}
            onClick={() => setInputMode("custom")}
          >
            <FileText className="size-4" />粘贴文本
          </Button>
        </div>

        {inputMode === "chapter" ? (
          <Select value={selectedChapterId} onValueChange={(v) => v && setSelectedChapterId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择章节" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部章节</SelectItem>
              {sortedChapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title} ({c.word_count} 字)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="粘贴要分析的文本..."
            rows={6}
          />
        )}
      </div>

      {/* Analysis results */}
      {result.totalWords > 0 && (
        <div className="space-y-6">
          {/* Basic metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={<Type className="size-4 text-blue-500" />}
              label="总字数"
              value={result.totalWords.toLocaleString()}
              sublabel={`${result.totalChars} 个汉字`}
            />
            <MetricCard
              icon={<BarChart3 className="size-4 text-green-500" />}
              label="平均句长"
              value={`${result.avgSentenceLength} 字`}
              sublabel={
                result.avgSentenceLength > 50
                  ? "偏长，建议适当拆分"
                  : result.avgSentenceLength < 10
                  ? "偏短，可以增加变化"
                  : "适中"
              }
            />
            <MetricCard
              icon={<Quote className="size-4 text-amber-500" />}
              label="对话占比"
              value={`${result.dialogueRatio}%`}
              sublabel={
                result.dialogueRatio > 50
                  ? "对话较多"
                  : result.dialogueRatio < 15
                  ? "对话较少"
                  : "比例适中"
              }
            />
            <MetricCard
              icon={<BookOpen className="size-4 text-purple-500" />}
              label="平均段长"
              value={`${result.avgParagraphLength} 字`}
              sublabel={
                result.avgParagraphLength > 200
                  ? "段落偏长"
                  : result.avgParagraphLength < 50
                  ? "段落偏短"
                  : "适中"
              }
            />
            <MetricCard
              icon={<BarChart3 className="size-4 text-rose-500" />}
              label="词汇多样性"
              value={`${result.vocabularyDiversity}%`}
              sublabel={
                result.vocabularyDiversity > 70
                  ? "词汇丰富"
                  : result.vocabularyDiversity < 40
                  ? "词汇较单一"
                  : "一般"
              }
            />
          </div>

          {/* Top words */}
          {result.topWords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">高频词汇 (Top {result.topWords.length})</h4>
              <div className="space-y-1.5">
                {result.topWords.map(({ word, count }, index) => (
                  <div key={word} className="flex items-center gap-2">
                    <span className="w-6 text-right text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="w-16 text-sm font-medium">{word}</span>
                    <div className="flex-1">
                      <div className="h-4 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full rounded bg-primary/60 transition-all"
                          style={{
                            width: `${(count / maxTopCount) * 100}%`,
                            minWidth: count > 0 ? "2px" : "0",
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-xs text-muted-foreground">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paragraph length distribution */}
          {result.paragraphLengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">段落长度分布</h4>
              <div className="flex items-end gap-0.5 h-24">
                {result.paragraphLengths.slice(0, 50).map((len, i) => {
                  const maxLen = Math.max(...result.paragraphLengths.slice(0, 50));
                  const height = maxLen > 0 ? (len / maxLen) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/40 min-w-[2px] transition-all"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`段落 ${i + 1}: ${len} 字`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>段落 1</span>
                <span>
                  {Math.min(result.paragraphLengths.length, 50)} 段
                  {result.paragraphLengths.length > 50 && " (显示前50段)"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {result.totalWords === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          请选择章节或粘贴文本以开始分析
        </div>
      )}

      {/* AI Analysis */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAIAnalysis}
            disabled={!analysisText.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            AI 风格分析
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
        {aiAnalysis && (
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sublabel}</div>
    </div>
  );
}
