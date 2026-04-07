'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Wand2,
  Sparkles,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useStreamCompletion } from '@/hooks/use-stream-completion'
import type { Beat } from '@/lib/types'

interface BeatSheetEditorProps {
  projectId?: string
  synopsis?: string | null
  framework?: string | null
  initialBeats?: Beat[]
  onSave?: (beats: Beat[]) => void
}

interface EditableBeat {
  id: string
  name: string
  position_pct: number
  description: string
  characters: string
  emotion_tone: string
}

export default function BeatSheetEditor({
  projectId,
  synopsis,
  framework,
  initialBeats = [],
  onSave,
}: BeatSheetEditorProps) {
  const [beats, setBeats] = useState<EditableBeat[]>(
    initialBeats.map((b) => ({
      id: b.id,
      name: b.name,
      position_pct: b.position_pct,
      description: b.description || '',
      characters: (b.characters || []).join('、'),
      emotion_tone: b.emotion_tone || '',
    }))
  )

  const { isLoading: isAIStreaming, complete } = useStreamCompletion({
    api: '/api/conception/structure',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
          const newBeats: EditableBeat[] = parsed.map(
            (item: {
              beatIndex: number
              name: string
              content: string
              characters: string[]
              emotionTone: string
            }) => ({
              id: `beat-${item.beatIndex}-${Date.now()}`,
              name: item.name,
              position_pct: (item.beatIndex / (parsed.length - 1)) * 100,
              description: item.content,
              characters: item.characters.join('、'),
              emotion_tone: item.emotionTone,
            })
          )
          setBeats(newBeats)
        }
      } catch {
        console.error('Failed to parse AI beat suggestions')
      }
    },
  })

  const addBeat = useCallback(() => {
    const newBeat: EditableBeat = {
      id: `beat-new-${Date.now()}`,
      name: '',
      position_pct: beats.length > 0 ? Math.min(...beats.map((b) => b.position_pct)) + 10 : 0,
      description: '',
      characters: '',
      emotion_tone: '',
    }
    setBeats((prev) => [...prev, newBeat])
  }, [beats])

  const removeBeat = useCallback((index: number) => {
    setBeats((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const moveBeat = useCallback((index: number, direction: 'up' | 'down') => {
    setBeats((prev) => {
      const next = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= next.length) return prev
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }, [])

  const updateBeat = useCallback(
    (index: number, field: keyof EditableBeat, value: string | number) => {
      setBeats((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    []
  )

  const handleAISuggest = useCallback(() => {
    if (!synopsis || !framework) return

    complete('', {
      body: JSON.stringify({
        framework,
        synopsis,
      }),
    })
  }, [synopsis, framework, complete])

  const handleSave = useCallback(() => {
    const convertedBeats: Beat[] = beats.map((b, index) => ({
      id: b.id,
      project_id: projectId || '',
      structure_id: '',
      name: b.name,
      position_pct: b.position_pct,
      description: b.description || null,
      characters: b.characters
        ? b.characters
            .split(/[、,，]/)
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
      emotion_tone: b.emotion_tone || null,
      sort_order: index,
    }))
    onSave?.(convertedBeats)
  }, [beats, projectId, onSave])

  const handleExport = useCallback(() => {
    if (beats.length === 0) return

    const lines = beats.map((beat, index) => {
      return [
        `${index + 1}. ${beat.name || '未命名节拍'}`,
        `   位置: ${beat.position_pct}%`,
        `   描述: ${beat.description || '无'}`,
        `   角色: ${beat.characters || '无'}`,
        `   情绪: ${beat.emotion_tone || '无'}`,
      ].join('\n')
    })

    const text = `节拍表 - ${framework || '未选择框架'}\n${'='.repeat(40)}\n\n${lines.join('\n\n')}`

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `节拍表-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [beats, framework])

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">节拍表编辑器</CardTitle>
          <CardDescription>
            编辑故事节拍，定义每个关键转折点的内容、角色和情绪走向
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAISuggest}
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
                AI 建议
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={addBeat}>
            <Plus className="size-3.5" />
            添加节拍
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={beats.length === 0}>
            <Download className="size-3.5" />
            导出文本
          </Button>
          <Button size="sm" onClick={handleSave} disabled={beats.length === 0}>
            保存节拍表
          </Button>
        </CardFooter>
      </Card>

      {/* 可视化进度条 */}
      {beats.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="relative h-10 bg-muted rounded-full overflow-hidden">
              {beats.map((beat, index) => {
                const left = `${Math.min(beat.position_pct, 100)}%`
                return (
                  <div
                    key={beat.id}
                    className="absolute top-0 h-full flex items-center"
                    style={{ left }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary-foreground"
                      style={{ marginLeft: '-8px' }}
                      title={`${index + 1}. ${beat.name}`}
                    >
                      {index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">0%</span>
              <span className="text-[10px] text-muted-foreground">25%</span>
              <span className="text-[10px] text-muted-foreground">50%</span>
              <span className="text-[10px] text-muted-foreground">75%</span>
              <span className="text-[10px] text-muted-foreground">100%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 生成加载状态 */}
      {isAIStreaming && beats.length === 0 && (
        <Card>
          <CardContent className="pt-4 space-y-3">
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

      {/* 节拍表格 */}
      {beats.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          {/* 表头 */}
          <div className="hidden lg:grid grid-cols-[auto_2fr_1fr_3fr_2fr_1.5fr_auto] gap-2 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
            <span className="w-8">序号</span>
            <span>节拍名称</span>
            <span>位置(%)</span>
            <span>内容描述</span>
            <span>涉及角色</span>
            <span>情绪走向</span>
            <span className="w-20">操作</span>
          </div>

          <Separator />

          {/* 节拍行 */}
          <div className="divide-y">
            {beats.map((beat, index) => (
              <div
                key={beat.id}
                className="grid grid-cols-1 lg:grid-cols-[auto_2fr_1fr_3fr_2fr_1.5fr_auto] gap-2 p-3 items-start hover:bg-muted/30 transition-colors"
              >
                {/* 序号 */}
                <div className="hidden lg:flex items-center gap-1 w-8">
                  <GripVertical className="size-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                </div>

                {/* 移动端序号 */}
                <div className="flex lg:hidden items-center gap-2">
                  <GripVertical className="size-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({beat.position_pct}%)
                  </span>
                </div>

                {/* 节拍名称 */}
                <Input
                  value={beat.name}
                  onChange={(e) => updateBeat(index, 'name', e.target.value)}
                  placeholder="节拍名称"
                  className="h-7 text-sm"
                />

                {/* 位置 */}
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={beat.position_pct}
                  onChange={(e) =>
                    updateBeat(index, 'position_pct', Number(e.target.value))
                  }
                  className="h-7 text-sm w-20"
                />

                {/* 内容描述 */}
                <Textarea
                  value={beat.description}
                  onChange={(e) =>
                    updateBeat(index, 'description', e.target.value)
                  }
                  placeholder="描述此节拍的具体内容..."
                  rows={2}
                  className="text-sm"
                />

                {/* 涉及角色 */}
                <Input
                  value={beat.characters}
                  onChange={(e) =>
                    updateBeat(index, 'characters', e.target.value)
                  }
                  placeholder="角色名，用顿号分隔"
                  className="h-7 text-sm"
                />

                {/* 情绪走向 */}
                <Input
                  value={beat.emotion_tone}
                  onChange={(e) =>
                    updateBeat(index, 'emotion_tone', e.target.value)
                  }
                  placeholder="情绪基调"
                  className="h-7 text-sm"
                />

                {/* 操作 */}
                <div className="flex items-center gap-0.5 w-20">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveBeat(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveBeat(index, 'down')}
                    disabled={index === beats.length - 1}
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeBeat(index)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {beats.length === 0 && !isAIStreaming && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">还没有节拍</p>
          <p className="text-xs mt-1">
            点击"添加节拍"手动创建，或使用"AI 建议"自动生成
          </p>
        </div>
      )}
    </div>
  )
}
