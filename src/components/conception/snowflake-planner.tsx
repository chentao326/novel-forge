'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { useStreamCompletion } from '@/hooks/use-stream-completion'
import type { SnowflakeStep, Character } from '@/lib/types'

interface SnowflakePlannerProps {
  projectId?: string
  synopsis?: string | null
  characters?: Character[]
  initialStep?: SnowflakeStep | null
  onStepChange?: (step: SnowflakeStep) => void
}

interface CharacterSummary {
  name: string
  storyline: string
  motivation: string
  goal: string
  conflict: string
  epiphany: string
}

const STEP_INFO = [
  { num: 1, title: '一句话概括', description: '用一句话概括整个故事' },
  { num: 2, title: '一段话扩展', description: '将一句话扩展为包含三幕结构的段落' },
  { num: 3, title: '角色概要', description: '为每个主要角色创建概要' },
  { num: 4, title: '分幕概要', description: '将段落扩展为分幕概要' },
  { num: 5, title: '角色详档', description: '为每个角色创建详细档案' },
  { num: 6, title: '分章概要', description: '将分幕概要扩展为分章大纲' },
  { num: 7, title: '场景清单', description: '为每章生成场景清单' },
]

export default function SnowflakePlanner({
  projectId,
  synopsis,
  characters = [],
  initialStep,
  onStepChange,
}: SnowflakePlannerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [stepData, setStepData] = useState<SnowflakeStep>({
    step: initialStep?.step || 1,
    one_liner: initialStep?.one_liner || null,
    paragraph: initialStep?.paragraph || null,
    character_summaries: initialStep?.character_summaries || null,
    act_outlines: initialStep?.act_outlines || null,
    character_details: initialStep?.character_details || null,
    chapter_outlines: initialStep?.chapter_outlines || null,
    scene_list: initialStep?.scene_list || null,
  })
  const [characterList, setCharacterList] = useState<CharacterSummary[]>([])
  const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set())

  const { completion, isLoading: isAIStreaming, complete, stop } = useStreamCompletion({
    api: '/api/conception/snowflake',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        if (currentStep === 1) {
          updateStepData('one_liner', cleaned)
        } else if (currentStep === 2) {
          updateStepData('paragraph', cleaned)
        } else if (currentStep === 3) {
          const parsed = JSON.parse(cleaned)
          if (Array.isArray(parsed)) {
            setCharacterList(parsed)
            updateStepData('character_summaries', JSON.stringify(parsed))
          }
        } else if (currentStep === 4) {
          updateStepData('act_outlines', cleaned)
        } else if (currentStep === 5) {
          updateStepData('character_details', cleaned)
        } else if (currentStep === 6) {
          updateStepData('chapter_outlines', cleaned)
        } else if (currentStep === 7) {
          updateStepData('scene_list', cleaned)
        }
      } catch {
        // For non-JSON steps, use raw text
        if (currentStep === 1 || currentStep === 2 || currentStep === 4) {
          const cleaned = completion
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()
          if (currentStep === 1) updateStepData('one_liner', cleaned)
          else if (currentStep === 2) updateStepData('paragraph', cleaned)
          else updateStepData('act_outlines', cleaned)
        }
        console.error('Failed to parse snowflake results')
      }
    },
  })

  const updateStepData = useCallback(
    (field: keyof SnowflakeStep, value: string | null) => {
      setStepData((prev) => {
        const updated = { ...prev, [field]: value }
        onStepChange?.(updated)
        return updated
      })
    },
    [onStepChange]
  )

  const handleAIAssist = useCallback(() => {
    complete('', {
      body: JSON.stringify({
        step: currentStep,
        currentData: stepData,
        synopsis,
        characters,
      }),
    })
  }, [currentStep, stepData, synopsis, characters, complete])

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step)
    },
    []
  )

  const toggleCollapsed = useCallback((step: number) => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(step)) {
        next.delete(step)
      } else {
        next.add(step)
      }
      return next
    })
  }, [])

  const addCharacter = useCallback(() => {
    const newChar: CharacterSummary = {
      name: '',
      storyline: '',
      motivation: '',
      goal: '',
      conflict: '',
      epiphany: '',
    }
    setCharacterList((prev) => [...prev, newChar])
  }, [])

  const updateCharacter = useCallback(
    (index: number, field: keyof CharacterSummary, value: string) => {
      setCharacterList((prev) => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        updateStepData('character_summaries', JSON.stringify(updated))
        return updated
      })
    },
    [updateStepData]
  )

  const removeCharacter = useCallback(
    (index: number) => {
      setCharacterList((prev) => {
        const updated = prev.filter((_, i) => i !== index)
        updateStepData('character_summaries', JSON.stringify(updated))
        return updated
      })
    },
    [updateStepData]
  )

  // Auto-save on step change
  useEffect(() => {
    onStepChange?.(stepData)
  }, [stepData, onStepChange])

  const getStepContent = (step: number): string | null => {
    switch (step) {
      case 1: return stepData.one_liner
      case 2: return stepData.paragraph
      case 3: return stepData.character_summaries
      case 4: return stepData.act_outlines
      case 5: return stepData.character_details
      case 6: return stepData.chapter_outlines
      case 7: return stepData.scene_list
      default: return null
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>一句话概括</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                用不超过25个字概括整个故事，包含主角、核心冲突和利害关系
              </p>
              <Textarea
                value={stepData.one_liner || ''}
                onChange={(e) => updateStepData('one_liner', e.target.value)}
                placeholder="例如：一个失忆的侦探必须在72小时内破获一起连环杀人案，否则他将永远失去找回记忆的机会。"
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            {stepData.one_liner && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 1 - 一句话概括
                </p>
                <p className="text-sm">{stepData.one_liner}</p>
              </div>
            )}
            <div>
              <Label>一段话扩展</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                将一句话扩展为包含三幕结构的段落（5-8句话），突出因果逻辑
              </p>
              <Textarea
                value={stepData.paragraph || ''}
                onChange={(e) => updateStepData('paragraph', e.target.value)}
                placeholder="在故事的开头，..."
                rows={6}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            {stepData.one_liner && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 1 - 一句话概括
                </p>
                <p className="text-sm">{stepData.one_liner}</p>
              </div>
            )}
            {stepData.paragraph && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 2 - 一段话扩展
                </p>
                <p className="text-sm whitespace-pre-wrap">{stepData.paragraph}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>角色概要</Label>
              <Button variant="outline" size="sm" onClick={addCharacter}>
                <Plus className="size-3.5" />
                添加角色
              </Button>
            </div>

            {characterList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">还没有角色概要</p>
                <p className="text-xs mt-1">点击"添加角色"或使用 AI 辅助生成</p>
              </div>
            ) : (
              <div className="space-y-4">
                {characterList.map((char, index) => (
                  <Card key={index} size="sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={char.name}
                          onChange={(e) =>
                            updateCharacter(index, 'name', e.target.value)
                          }
                          placeholder="角色名称"
                          className="max-w-48 h-7 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeCharacter(index)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs">故事线</Label>
                        <Textarea
                          value={char.storyline}
                          onChange={(e) =>
                            updateCharacter(index, 'storyline', e.target.value)
                          }
                          placeholder="角色在故事中的发展轨迹"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">核心动机</Label>
                          <Input
                            value={char.motivation}
                            onChange={(e) =>
                              updateCharacter(index, 'motivation', e.target.value)
                            }
                            placeholder="驱动力"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">外在目标</Label>
                          <Input
                            value={char.goal}
                            onChange={(e) =>
                              updateCharacter(index, 'goal', e.target.value)
                            }
                            placeholder="想要达成的"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">核心冲突</Label>
                          <Input
                            value={char.conflict}
                            onChange={(e) =>
                              updateCharacter(index, 'conflict', e.target.value)
                            }
                            placeholder="面临的最大障碍"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">顿悟/转变</Label>
                          <Input
                            value={char.epiphany}
                            onChange={(e) =>
                              updateCharacter(index, 'epiphany', e.target.value)
                            }
                            placeholder="最终的领悟"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            {stepData.paragraph && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 2 - 一段话扩展
                </p>
                <p className="text-sm whitespace-pre-wrap">{stepData.paragraph}</p>
              </div>
            )}
            <div>
              <Label>分幕概要</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                将段落扩展为分幕概要，每幕 3-5 句话
              </p>
              <Textarea
                value={stepData.act_outlines || ''}
                onChange={(e) => updateStepData('act_outlines', e.target.value)}
                placeholder={'第一幕：...\n\n第二幕上半：...\n\n第二幕下半：...\n\n第三幕：...'}
                rows={10}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            {stepData.character_summaries && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 3 - 角色概要
                </p>
                <pre className="text-xs whitespace-pre-wrap">
                  {stepData.character_summaries}
                </pre>
              </div>
            )}
            <div>
              <Label>角色详档</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                为每个角色创建详细档案，包括外貌、性格、背景故事和角色弧线
              </p>
              <Textarea
                value={stepData.character_details || ''}
                onChange={(e) =>
                  updateStepData('character_details', e.target.value)
                }
                placeholder="角色详细描述..."
                rows={12}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            {stepData.act_outlines && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 4 - 分幕概要
                </p>
                <pre className="text-xs whitespace-pre-wrap">
                  {stepData.act_outlines}
                </pre>
              </div>
            )}
            <div>
              <Label>分章大纲</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                将分幕概要扩展为 8-15 章的详细大纲
              </p>
              <Textarea
                value={stepData.chapter_outlines || ''}
                onChange={(e) =>
                  updateStepData('chapter_outlines', e.target.value)
                }
                placeholder="第一章：标题 - 概要..."
                rows={15}
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            {stepData.chapter_outlines && (
              <div className="rounded-lg bg-muted/50 p-3 max-h-40 overflow-auto">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  步骤 6 - 分章大纲
                </p>
                <pre className="text-xs whitespace-pre-wrap">
                  {stepData.chapter_outlines}
                </pre>
              </div>
            )}
            <div>
              <Label>场景清单</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                为每章生成场景清单，包括地点、人物、目的和情绪基调
              </p>
              <Textarea
                value={stepData.scene_list || ''}
                onChange={(e) =>
                  updateStepData('scene_list', e.target.value)
                }
                placeholder="第一章 场景1：地点 - 人物 - 目的..."
                rows={18}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 步骤指示器 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">雪花法步骤</h3>
          <span className="text-xs text-muted-foreground">
            步骤 {currentStep} / 7
          </span>
        </div>
        <Progress value={((currentStep) / 7) * 100}>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <div className="flex flex-wrap gap-1.5">
          {STEP_INFO.map((info) => {
            const isCompleted = getStepContent(info.num) !== null
            const isCurrent = currentStep === info.num
            return (
              <Button
                key={info.num}
                variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'}
                size="xs"
                onClick={() => goToStep(info.num)}
              >
                {isCompleted && !isCurrent && (
                  <Check className="size-3" />
                )}
                {info.num}. {info.title}
              </Button>
            )
          })}
        </div>
      </div>

      {/* 当前步骤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {currentStep}
                </span>
                {STEP_INFO[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="mt-1">
                {STEP_INFO[currentStep - 1].description}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIAssist}
              disabled={isAIStreaming}
            >
              {isAIStreaming ? (
                <>
                  <Sparkles className="size-3.5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="size-3.5" />
                  AI 辅助
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAIStreaming && !completion && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep <= 1}
          >
            <ChevronLeft className="size-4" />
            上一步
          </Button>
          <Button
            size="sm"
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep >= 7}
          >
            下一步
            <ChevronRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* 已完成步骤概览 */}
      {currentStep > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">已完成步骤</h4>
          {STEP_INFO.slice(0, currentStep - 1).map((info) => {
            const content = getStepContent(info.num)
            if (!content) return null
            const isCollapsed = collapsedSteps.has(info.num)
            return (
              <div key={info.num} className="rounded-lg border p-3">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleCollapsed(info.num)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {info.num}
                    </Badge>
                    <span className="text-sm font-medium">{info.title}</span>
                    <Check className="size-3.5 text-green-500" />
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  )}
                </button>
                {!isCollapsed && (
                  <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap pl-9 max-h-32 overflow-auto">
                    {content.length > 500 ? content.slice(0, 500) + '...' : content}
                  </pre>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
