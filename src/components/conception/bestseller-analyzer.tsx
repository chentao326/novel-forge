'use client'

import { useState, useCallback } from 'react'
import {
  Scissors,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStreamCompletion } from '@/hooks/use-stream-completion'
import { GENRE_LABELS, type Genre } from '@/lib/types'

interface BestsellerAnalyzerProps {
  projectId?: string
  synopsis?: string | null
}

interface AnalysisSection {
  key: string
  title: string
  icon: string
  content: string
}

const SECTION_META: Array<{ key: string; title: string; icon: string }> = [
  { key: '核心结构', title: '核心结构', icon: '🏗️' },
  { key: '节奏分析', title: '节奏分析', icon: '📊' },
  { key: '爽点分布', title: '爽点分布', icon: '✨' },
  { key: '角色设计', title: '角色设计', icon: '👤' },
  { key: '世界观特色', title: '世界观特色', icon: '🌍' },
  { key: '写作技巧', title: '写作技巧', icon: '🖊️' },
  { key: '可借鉴元素', title: '可借鉴元素', icon: '💡' },
]

export default function BestsellerAnalyzer({
  projectId,
  synopsis,
}: BestsellerAnalyzerProps) {
  const [inputMode, setInputMode] = useState<'text' | 'title'>('text')
  const [novelText, setNovelText] = useState('')
  const [novelTitle, setNovelTitle] = useState('')
  const [genre, setGenre] = useState<Genre | ''>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [analysisSections, setAnalysisSections] = useState<AnalysisSection[]>([])
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const { completion, isLoading: isAIStreaming, complete, stop } = useStreamCompletion({
    api: '/api/conception/bestseller-analyze',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        const sections: AnalysisSection[] = SECTION_META.map((meta) => ({
          key: meta.key,
          title: meta.title,
          icon: meta.icon,
          content: parsed[meta.key] || '暂无分析结果',
        }))
        setAnalysisSections(sections)
        // Expand all sections by default
        setExpandedSections(new Set(SECTION_META.map((s) => s.key)))
      } catch {
        console.error('Failed to parse bestseller analysis results')
      }
    },
  })

  const handleAnalyze = useCallback(() => {
    if (inputMode === 'text' && !novelText.trim()) return
    if (inputMode === 'title' && !novelTitle.trim()) return

    setAnalysisSections([])
    setExpandedSections(new Set())

    complete('', {
      body: JSON.stringify({
        text: inputMode === 'text' ? novelText : '',
        title: inputMode === 'title' ? novelTitle : '',
        genre: genre || undefined,
        projectId: projectId || '',
      }),
    })
  }, [inputMode, novelText, novelTitle, genre, projectId, complete])

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const handleCopySection = useCallback(async (section: AnalysisSection) => {
    try {
      await navigator.clipboard.writeText(
        `【${section.title}】\n${section.content}`
      )
      setCopiedSection(section.key)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }, [])

  const handleApplyToProject = useCallback((section: AnalysisSection) => {
    // Copy the insight to clipboard for user to paste into their project notes
    handleCopySection(section)
  }, [handleCopySection])

  const isAnalyzing = isAIStreaming && analysisSections.length === 0

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="size-5" />
            爆款拆解
          </CardTitle>
          <CardDescription>
            分析畅销小说的成功要素，学习借鉴优秀作品的创作技巧
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 输入模式切换 */}
          <div className="flex gap-2">
            <Button
              variant={inputMode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('text')}
            >
              <BookOpen className="size-3.5" />
              粘贴文本
            </Button>
            <Button
              variant={inputMode === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('title')}
            >
              输入书名
            </Button>
          </div>

          {/* 类型选择 */}
          <div className="space-y-2">
            <Label className="text-sm">小说类型</Label>
            <Select
              value={genre}
              onValueChange={(val) => setGenre(val as Genre)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENRE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 文本输入 */}
          {inputMode === 'text' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">小说内容</Label>
                <span className="text-xs text-muted-foreground">
                  {novelText.length}/5000
                </span>
              </div>
              <Textarea
                placeholder="粘贴小说简介、大纲或样章内容..."
                value={novelText}
                onChange={(e) =>
                  setNovelText(e.target.value.slice(0, 5000))
                }
                rows={8}
                className="text-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm">小说标题</Label>
              <Input
                placeholder="输入小说标题，AI 将基于其知识库进行分析"
                value={novelTitle}
                onChange={(e) => setNovelTitle(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          {/* 分析按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={
                isAIStreaming ||
                (inputMode === 'text' && !novelText.trim()) ||
                (inputMode === 'title' && !novelTitle.trim())
              }
            >
              {isAIStreaming ? (
                <>
                  <Sparkles className="size-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  开始拆解
                </>
              )}
            </Button>
            {isAIStreaming && (
              <Button variant="outline" onClick={stop}>
                停止
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 加载状态 */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 animate-spin" />
              AI 正在深度分析作品...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SECTION_META.map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 分析结果 */}
      {analysisSections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            分析结果（共 {analysisSections.length} 个维度）
          </h3>
          {analysisSections.map((section) => {
            const isExpanded = expandedSections.has(section.key)
            const isCopied = copiedSection === section.key

            return (
              <Card key={section.key} size="sm">
                <button
                  className="flex items-center justify-between w-full p-4 text-left"
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{section.title}</p>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <Separator className="mb-3" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleCopySection(section)}
                      >
                        {isCopied ? (
                          <>
                            <Check className="size-3" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            复制
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleApplyToProject(section)}
                      >
                        应用到我的作品
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* 流式输出（解析前） */}
      {isAIStreaming && completion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 animate-spin" />
              正在生成分析...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-96 overflow-auto">
              {completion}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
