'use client'

import { useState, useCallback } from 'react'
import {
  BookOpen,
  Wand2,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { getFrameworkList, type StoryFramework } from '@/lib/conception/frameworks'
import { useStreamCompletion } from '@/hooks/use-stream-completion'
import type { StructureFramework, Beat } from '@/lib/types'

interface StructureEngineProps {
  projectId?: string
  synopsis?: string | null
  characters?: Array<{ name: string; role: string; want?: string | null; need?: string | null; fear?: string | null }>
  selectedFramework?: StructureFramework | null
  existingBeats?: Beat[]
  onSelectFramework?: (framework: StructureFramework) => void
  onSaveStructure?: (framework: StructureFramework, beats: Beat[]) => void
}

export default function StructureEngine({
  projectId,
  synopsis,
  characters = [],
  selectedFramework,
  existingBeats = [],
  onSelectFramework,
  onSaveStructure,
}: StructureEngineProps) {
  const [localFramework, setLocalFramework] = useState<StructureFramework | null>(
    selectedFramework || null
  )
  const [expandedBeat, setExpandedBeat] = useState<number | null>(null)
  const [generatedBeats, setGeneratedBeats] = useState<Array<{
    beatIndex: number
    name: string
    content: string
    characters: string[]
    emotionTone: string
    keyEvents: string[]
  }>>([])

  const { completion, isLoading: isAIStreaming, complete, stop } = useStreamCompletion({
    api: '/api/conception/structure',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
          setGeneratedBeats(parsed)
        }
      } catch {
        console.error('Failed to parse structure results')
      }
    },
  })

  const frameworks = getFrameworkList()

  const handleSelectFramework = useCallback(
    (fw: StoryFramework) => {
      setLocalFramework(fw.id)
      setGeneratedBeats([])
      setExpandedBeat(null)
      onSelectFramework?.(fw.id)
    },
    [onSelectFramework]
  )

  const handleGenerateBeats = useCallback(() => {
    if (!localFramework || !synopsis) return

    setGeneratedBeats([])

    complete('', {
      body: JSON.stringify({
        framework: localFramework,
        synopsis,
        characters,
      }),
    })
  }, [localFramework, synopsis, characters, complete])

  const handleSave = useCallback(() => {
    if (!localFramework) return

    const framework = getFrameworkList().find((f) => f.id === localFramework)
    if (!framework) return

    const beats: Beat[] = framework.beats.map((beat, index) => {
      const generated = generatedBeats.find((g) => g.beatIndex === index)
      return {
        id: `beat-${index}-${Date.now()}`,
        project_id: projectId || '',
        structure_id: '',
        name: beat.name,
        position_pct: beat.position,
        description: generated?.content || null,
        characters: generated?.characters || [],
        emotion_tone: generated?.emotionTone || beat.emotion_tone,
        sort_order: index,
      }
    })

    onSaveStructure?.(localFramework, beats)
  }, [localFramework, generatedBeats, projectId, onSaveStructure])

  const currentFramework = frameworks.find((f) => f.id === localFramework)

  return (
    <div className="space-y-6">
      {/* 框架选择器 */}
      <div>
        <h3 className="text-sm font-medium mb-3">选择故事结构框架</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {frameworks.map((fw) => (
            <Card
              key={fw.id}
              size="sm"
              className={`cursor-pointer transition-all ${
                localFramework === fw.id
                  ? 'ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectFramework(fw)}
            >
              <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{fw.name}</CardTitle>
                  {localFramework === fw.id && (
                    <Check className="size-4 text-primary" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  {fw.beats.length} 个节拍
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">
                  {fw.description.slice(0, 60)}...
                </p>
                <div className="flex flex-wrap gap-1">
                  {fw.bestFor.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 框架详情 */}
      {currentFramework && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  {currentFramework.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentFramework.description}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBeats}
                  disabled={isAIStreaming || !synopsis}
                >
                  {isAIStreaming ? (
                    <>
                      <Sparkles className="size-3.5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-3.5" />
                      AI 生成节拍
                    </>
                  )}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!localFramework}>
                  <Save className="size-3.5" />
                  保存结构
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 时间线可视化 */}
            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">故事进度</span>
                <span className="text-xs text-muted-foreground">100%</span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                {currentFramework.beats.map((beat, index) => {
                  const left = `${beat.position}%`
                  const isExpanded = expandedBeat === index
                  return (
                    <div
                      key={index}
                      className="absolute top-0 h-full flex items-center"
                      style={{ left }}
                    >
                      <button
                        className={`w-3 h-3 rounded-full border-2 border-background transition-transform ${
                          isExpanded
                            ? 'bg-primary scale-150'
                            : 'bg-primary/70 hover:bg-primary hover:scale-125'
                        }`}
                        style={{ marginLeft: '-6px' }}
                        onClick={() =>
                          setExpandedBeat(isExpanded ? null : index)
                        }
                        title={beat.name}
                      />
                    </div>
                  )
                })}
              </div>
              {/* 节拍标签 */}
              <div className="relative h-6 mt-1">
                {currentFramework.beats.map((beat, index) => (
                  <div
                    key={index}
                    className="absolute text-[10px] text-muted-foreground whitespace-nowrap"
                    style={{ left: `${beat.position}%`, transform: 'translateX(-50%)' }}
                  >
                    {beat.name}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* 节拍详情列表 */}
            <div className="space-y-2">
              {currentFramework.beats.map((beat, index) => {
                const isExpanded = expandedBeat === index
                const generated = generatedBeats.find((g) => g.beatIndex === index)

                return (
                  <div
                    key={index}
                    className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <button
                      className="flex items-center justify-between w-full text-left"
                      onClick={() =>
                        setExpandedBeat(isExpanded ? null : index)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{beat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            位置 {beat.position}% · {beat.emotion_tone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {generated && (
                          <Badge variant="secondary" className="text-[10px]">
                            已生成
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 pl-9">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            描述模板
                          </Label>
                          <p className="text-sm mt-1">{beat.description}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            创作指导
                          </Label>
                          <p className="text-sm mt-1">{beat.guidance}</p>
                        </div>
                        {generated && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                AI 生成内容
                              </Label>
                              <Textarea
                                className="mt-1 text-sm"
                                value={generated.content}
                                onChange={(e) => {
                                  const updated = [...generatedBeats]
                                  const idx = updated.findIndex(
                                    (g) => g.beatIndex === index
                                  )
                                  if (idx !== -1) {
                                    updated[idx] = {
                                      ...updated[idx],
                                      content: e.target.value,
                                    }
                                    setGeneratedBeats(updated)
                                  }
                                }}
                                rows={3}
                              />
                            </div>
                            {generated.characters.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {generated.characters.map((char) => (
                                  <Badge key={char} variant="outline" className="text-xs">
                                    {char}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 生成加载状态 */}
      {isAIStreaming && generatedBeats.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 animate-spin" />
              AI 正在为你的故事生成节拍内容...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
