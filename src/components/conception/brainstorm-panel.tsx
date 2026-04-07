'use client'

import { useState, useCallback } from 'react'
import { Lightbulb, Wand2, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { GENRE_LABELS } from '@/lib/types'
import { useStreamCompletion } from '@/hooks/use-stream-completion'

interface StoryConcept {
  title: string
  coreConflict: string
  themeDirection: string
  synopsis: string
  targetAudience: string
  uniqueSellingPoint: string
}

interface BrainstormPanelProps {
  projectId?: string
  synopsis?: string | null
  characters?: Array<{ name: string; role: string; want?: string | null }>
  worldSettings?: Array<{ name: string; content: unknown }>
  onAdoptConcept?: (concept: StoryConcept) => void
}

const MOOD_OPTIONS = [
  { value: 'dark', label: '黑暗沉重' },
  { value: 'light', label: '轻松愉快' },
  { value: 'suspense', label: '悬疑紧张' },
  { value: 'romantic', label: '浪漫温馨' },
  { value: 'epic', label: '史诗壮阔' },
  { value: 'philosophical', label: '哲思深沉' },
  { value: 'humorous', label: '幽默诙谐' },
  { value: 'tragic', label: '悲剧色彩' },
]

export default function BrainstormPanel({
  projectId,
  synopsis,
  characters = [],
  worldSettings = [],
  onAdoptConcept,
}: BrainstormPanelProps) {
  const [keywords, setKeywords] = useState('')
  const [genre, setGenre] = useState<string | null>(null)
  const [mood, setMood] = useState<string | null>(null)
  const [references, setReferences] = useState('')
  const [concepts, setConcepts] = useState<StoryConcept[]>([])
  const [adoptedIndex, setAdoptedIndex] = useState<number | null>(null)

  const { completion, isLoading, complete, stop } = useStreamCompletion({
    api: '/api/conception/brainstorm',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsed = JSON.parse(cleaned) as StoryConcept[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConcepts(parsed)
        }
      } catch {
        console.error('Failed to parse brainstorm results')
      }
    },
  })

  const handleGenerate = useCallback(() => {
    if (!keywords && !genre && !mood) return

    setConcepts([])
    setAdoptedIndex(null)

    const body: Record<string, unknown> = {
      keywords,
      genre,
      mood,
      references,
      synopsis,
      characters,
      worldSettings,
    }

    complete('', { body: JSON.stringify(body) })
  }, [keywords, genre, mood, references, synopsis, characters, worldSettings, complete])

  const handleAdopt = useCallback(
    (concept: StoryConcept, index: number) => {
      setAdoptedIndex(index)
      onAdoptConcept?.(concept)
    },
    [onAdoptConcept]
  )

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-500" />
            灵感参数
          </CardTitle>
          <CardDescription>
            设置创作条件，让 AI 为你生成独特的故事概念
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">关键词</Label>
              <Input
                id="keywords"
                placeholder="例如：时间循环、平行世界、失忆..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">小说类型</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id="genre" className="w-full">
                  <SelectValue placeholder="选择类型..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GENRE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">情绪基调</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood" className="w-full">
                  <SelectValue placeholder="选择基调..." />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="references">参考作品</Label>
              <Input
                id="references"
                placeholder="例如：《三体》《盗梦空间》..."
                value={references}
                onChange={(e) => setReferences(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isLoading && (
            <Button variant="outline" onClick={stop}>
              停止生成
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || (!keywords && !genre && !mood)}
          >
            {isLoading ? (
              <>
                <Sparkles className="size-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                生成灵感
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 生成结果区域 */}
      {isLoading && concepts.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 animate-spin" />
            AI 正在为你构思故事概念...
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {concepts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="size-4" />
            为你生成了 {concepts.length} 个故事概念
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {concepts.map((concept, index) => (
              <Card
                key={index}
                className={`relative transition-all ${
                  adoptedIndex === index
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-md'
                }`}
              >
                {adoptedIndex === index && (
                  <Badge className="absolute top-3 right-3" variant="default">
                    <Check className="size-3" />
                    已采用
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{concept.title}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-1.5">
                    {concept.targetAudience && (
                      <Badge variant="secondary">{concept.targetAudience}</Badge>
                    )}
                    {concept.uniqueSellingPoint && (
                      <Badge variant="outline">{concept.uniqueSellingPoint}</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      核心冲突
                    </p>
                    <p className="text-sm">{concept.coreConflict}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      主题方向
                    </p>
                    <p className="text-sm">{concept.themeDirection}</p>
                  </div>
                  {concept.synopsis && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        故事梗概
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {concept.synopsis}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant={adoptedIndex === index ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleAdopt(concept, index)}
                    disabled={adoptedIndex === index}
                  >
                    {adoptedIndex === index ? (
                      <>
                        <Check className="size-3.5" />
                        已采用
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        采用此概念
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 流式输出展示（解析完成前） */}
      {isLoading && completion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 animate-spin" />
              正在生成...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-60 overflow-auto">
              {completion}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
