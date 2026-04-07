'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Heart,
  Sparkles,
  Trash2,
  Undo2,
  MousePointer2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStreamCompletion } from '@/hooks/use-stream-completion'
import { useEmotionCurveStore, type EmotionPoint } from '@/stores/emotion-curve-store'
import { GENRE_LABELS, type Genre } from '@/lib/types'

// ---- Constants ----
const SVG_WIDTH = 800
const SVG_HEIGHT = 400
const PADDING = { top: 30, right: 40, bottom: 50, left: 60 }
const CHART_W = SVG_WIDTH - PADDING.left - PADDING.right
const CHART_H = SVG_HEIGHT - PADDING.top - PADDING.bottom

function generateId(): string {
  return `ep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ---- Templates ----
interface CurveTemplate {
  name: string
  description: string
  points: Array<{ position: number; intensity: number; label: string }>
}

const TEMPLATES: CurveTemplate[] = [
  {
    name: '经典弧线',
    description: '低起点 → 逐步上升 → 高潮 → 回落收束',
    points: [
      { position: 0, intensity: -1, label: '开篇引入' },
      { position: 10, intensity: 0, label: '日常世界' },
      { position: 20, intensity: 1, label: '冒险召唤' },
      { position: 35, intensity: 2, label: '初步成长' },
      { position: 50, intensity: -1, label: '至暗时刻' },
      { position: 65, intensity: 3, label: '觉醒蜕变' },
      { position: 80, intensity: 5, label: '最终高潮' },
      { position: 95, intensity: 3, label: '尘埃落定' },
      { position: 100, intensity: 2, label: '新世界' },
    ],
  },
  {
    name: '过山车',
    description: '交替的高低起伏，持续刺激读者',
    points: [
      { position: 0, intensity: 0, label: '开场' },
      { position: 12, intensity: 4, label: '首次高潮' },
      { position: 25, intensity: -3, label: '重大挫折' },
      { position: 40, intensity: 5, label: '惊天逆转' },
      { position: 55, intensity: -4, label: '背叛危机' },
      { position: 70, intensity: 3, label: '绝地反击' },
      { position: 85, intensity: -2, label: '最终考验' },
      { position: 100, intensity: 5, label: '终极胜利' },
    ],
  },
  {
    name: '稳步上升',
    description: '从低谷逐渐攀升到高潮，持续正向激励',
    points: [
      { position: 0, intensity: -3, label: '困境起点' },
      { position: 15, intensity: -1, label: '初见希望' },
      { position: 30, intensity: 0, label: '稳步前行' },
      { position: 45, intensity: 1, label: '小有成就' },
      { position: 60, intensity: 2, label: '突破瓶颈' },
      { position: 75, intensity: 3, label: '势不可挡' },
      { position: 90, intensity: 4, label: '巅峰对决' },
      { position: 100, intensity: 5, label: '功成名就' },
    ],
  },
  {
    name: '悲剧弧线',
    description: '高起点逐渐滑落，令人唏嘘',
    points: [
      { position: 0, intensity: 4, label: '辉煌起点' },
      { position: 15, intensity: 3, label: '风光无限' },
      { position: 30, intensity: 2, label: '隐患初现' },
      { position: 45, intensity: 1, label: '命运转折' },
      { position: 60, intensity: 0, label: '无力回天' },
      { position: 75, intensity: -2, label: '坠入深渊' },
      { position: 90, intensity: -4, label: '万念俱灰' },
      { position: 100, intensity: -5, label: '悲剧终章' },
    ],
  },
  {
    name: '反转惊喜',
    description: '平静开局 → 突然坠落 → 戏剧性崛起',
    points: [
      { position: 0, intensity: 1, label: '平静日常' },
      { position: 15, intensity: 2, label: '美好时光' },
      { position: 30, intensity: 1, label: '暗流涌动' },
      { position: 45, intensity: -4, label: '惊天变故' },
      { position: 55, intensity: -5, label: '谷底挣扎' },
      { position: 65, intensity: -2, label: '发现真相' },
      { position: 80, intensity: 3, label: '绝地反击' },
      { position: 95, intensity: 5, label: '终极反转' },
      { position: 100, intensity: 4, label: '全新开始' },
    ],
  },
]

// ---- Helper: SVG coordinate conversion ----
function positionToX(position: number): number {
  return PADDING.left + (position / 100) * CHART_W
}

function intensityToY(intensity: number): number {
  // intensity: -5 (bottom) to +5 (top)
  return PADDING.top + ((5 - intensity) / 10) * CHART_H
}

function xToPosition(x: number): number {
  const pos = ((x - PADDING.left) / CHART_W) * 100
  return Math.round(Math.max(0, Math.min(100, pos)))
}

function yToIntensity(y: number): number {
  const intensity = 5 - ((y - PADDING.top) / CHART_H) * 10
  return Math.round(Math.max(-5, Math.min(5, intensity * 2)) / 2) // snap to 0.5
}

// ---- Catmull-Rom to Bezier conversion for smooth curves ----
function catmullRomToBezier(
  points: Array<{ x: number; y: number }>
): string {
  if (points.length < 2) return ''

  const tension = 0.3
  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

// ---- Component ----
interface EmotionCurveEditorProps {
  projectId?: string
  synopsis?: string | null
  genre?: Genre | null
}

export default function EmotionCurveEditor({
  projectId = '',
  synopsis,
  genre,
}: EmotionCurveEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [editingPointId, setEditingPointId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null)
  const [aiGenre, setAiGenre] = useState<Genre | ''>(genre || '')

  const {
    getCurve,
    setCurve,
    addPoint,
    updatePoint,
    removePoint,
    clearCurve,
    setTemplate,
  } = useEmotionCurveStore()

  const curve = getCurve(projectId)
  const points = curve?.points || []

  const { completion, isLoading: isAIStreaming, complete, stop } = useStreamCompletion({
    api: '/api/conception/emotion-curve-suggest',
    onFinish: (_prompt, completion) => {
      try {
        const cleaned = completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
          const newPoints: EmotionPoint[] = parsed.map(
            (p: { position: number; intensity: number; label: string }) => ({
              id: generateId(),
              position: Math.max(0, Math.min(100, p.position)),
              intensity: Math.max(-5, Math.min(5, p.intensity)),
              label: p.label || '',
            })
          )
          setCurve(projectId, {
            project_id: projectId,
            points: newPoints,
            template: 'AI 建议',
          })
        }
      } catch {
        console.error('Failed to parse emotion curve suggestion')
      }
    },
  })

  // Convert points to SVG coordinates for rendering
  const svgPoints = useMemo(
    () =>
      points
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((p) => ({
          id: p.id,
          x: positionToX(p.position),
          y: intensityToY(p.intensity),
          label: p.label,
          position: p.position,
          intensity: p.intensity,
        })),
    [points]
  )

  const curvePath = useMemo(() => {
    if (svgPoints.length < 2) return ''
    return catmullRomToBezier(svgPoints)
  }, [svgPoints])

  // Gradient area path (fill under the curve)
  const areaPath = useMemo(() => {
    if (svgPoints.length < 2) return ''
    const linePath = catmullRomToBezier(svgPoints)
    const zeroY = intensityToY(0)
    return `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${zeroY} L ${svgPoints[0].x} ${zeroY} Z`
  }, [svgPoints])

  // ---- Handlers ----
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || draggingPointId) return

      const rect = svgRef.current.getBoundingClientRect()
      const scaleX = SVG_WIDTH / rect.width
      const scaleY = SVG_HEIGHT / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      // Only add if clicking within chart area
      if (
        x < PADDING.left ||
        x > SVG_WIDTH - PADDING.right ||
        y < PADDING.top ||
        y > SVG_HEIGHT - PADDING.bottom
      ) {
        return
      }

      const position = xToPosition(x)
      const intensity = yToIntensity(y)
      const newPoint: EmotionPoint = {
        id: generateId(),
        position,
        intensity,
        label: '',
      }

      addPoint(projectId, newPoint)
      setEditingPointId(newPoint.id)
      setEditLabel('')
    },
    [projectId, draggingPointId, addPoint]
  )

  const handleDragStart = useCallback(
    (pointId: string) => (e: React.MouseEvent) => {
      e.stopPropagation()
      setDraggingPointId(pointId)
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingPointId || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const scaleX = SVG_WIDTH / rect.width
      const scaleY = SVG_HEIGHT / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const position = xToPosition(x)
      const intensity = yToIntensity(y)

      updatePoint(projectId, draggingPointId, { position, intensity })
    },
    [projectId, draggingPointId, updatePoint]
  )

  const handleMouseUp = useCallback(() => {
    setDraggingPointId(null)
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingPointId(null)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const handleEditLabel = useCallback(
    (pointId: string) => {
      if (editLabel.trim()) {
        updatePoint(projectId, pointId, { label: editLabel.trim() })
      }
      setEditingPointId(null)
      setEditLabel('')
    },
    [projectId, editLabel, updatePoint]
  )

  const handleApplyTemplate = useCallback(
    (template: CurveTemplate) => {
      const newPoints: EmotionPoint[] = template.points.map((p) => ({
        id: generateId(),
        position: p.position,
        intensity: p.intensity,
        label: p.label,
      }))
      setCurve(projectId, {
        project_id: projectId,
        points: newPoints,
        template: template.name,
      })
    },
    [projectId, setCurve]
  )

  const handleAISuggest = useCallback(() => {
    if (!synopsis) return

    complete('', {
      body: JSON.stringify({
        synopsis,
        genre: aiGenre || genre || undefined,
        existingPoints: points.length > 0 ? points : undefined,
        projectId,
      }),
    })
  }, [synopsis, aiGenre, genre, points, projectId, complete])

  const handleClear = useCallback(() => {
    clearCurve(projectId)
  }, [projectId, clearCurve])

  // ---- Y-axis labels ----
  const yLabels = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
  const xLabels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5" />
            情感曲线编辑器
          </CardTitle>
          <CardDescription>
            规划读者的情感旅程，点击图表添加情感节点，拖拽调整位置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 模板选择 */}
          <div className="space-y-2">
            <Label className="text-sm">预设模板</Label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.name}
                  variant={curve?.template === t.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApplyTemplate(t)}
                  title={t.description}
                >
                  {t.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* AI 建议 */}
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label className="text-sm">AI 情感曲线建议</Label>
              <Select
                value={aiGenre}
                onValueChange={(val) => setAiGenre(val as Genre)}
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
            <Button
              onClick={handleAISuggest}
              disabled={isAIStreaming || !synopsis}
            >
              {isAIStreaming ? (
                <>
                  <Sparkles className="size-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  AI 建议
                </>
              )}
            </Button>
            {isAIStreaming && (
              <Button variant="outline" onClick={stop}>
                停止
              </Button>
            )}
          </div>

          {/* 操作提示 */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MousePointer2 className="size-3" />
              点击图表添加节点
            </span>
            <span>拖拽节点调整位置</span>
            <span>双击节点编辑标签</span>
          </div>
        </CardContent>
      </Card>

      {/* SVG 图表 */}
      <Card>
        <CardContent className="p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-auto cursor-crosshair select-none"
            onClick={handleSvgClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              {/* Positive gradient (green → gold) */}
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              {/* Negative gradient (blue → purple) */}
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
              {/* Curve stroke gradient */}
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#9ca3af" />
                <stop offset="60%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Background regions */}
            {/* Positive area (above zero line) */}
            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={CHART_W}
              height={CHART_H / 2}
              fill="url(#positiveGradient)"
              rx="4"
            />
            {/* Negative area (below zero line) */}
            <rect
              x={PADDING.left}
              y={PADDING.top + CHART_H / 2}
              width={CHART_W}
              height={CHART_H / 2}
              fill="url(#negativeGradient)"
              rx="4"
            />

            {/* Grid lines */}
            {yLabels.map((val) => (
              <g key={`y-${val}`}>
                <line
                  x1={PADDING.left}
                  y1={intensityToY(val)}
                  x2={SVG_WIDTH - PADDING.right}
                  y2={intensityToY(val)}
                  stroke={val === 0 ? '#6b7280' : '#e5e7eb'}
                  strokeWidth={val === 0 ? 1.5 : 0.5}
                  strokeDasharray={val === 0 ? 'none' : '4,4'}
                />
                <text
                  x={PADDING.left - 8}
                  y={intensityToY(val)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground"
                  fontSize="11"
                >
                  {val > 0 ? `+${val}` : val}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {xLabels.map((val) => (
              <g key={`x-${val}`}>
                <line
                  x1={positionToX(val)}
                  y1={PADDING.top}
                  x2={positionToX(val)}
                  y2={SVG_HEIGHT - PADDING.bottom}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
                <text
                  x={positionToX(val)}
                  y={SVG_HEIGHT - PADDING.bottom + 20}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="11"
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={SVG_WIDTH / 2}
              y={SVG_HEIGHT - 5}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="12"
            >
              故事进度
            </text>
            <text
              x={15}
              y={SVG_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="12"
              transform={`rotate(-90, 15, ${SVG_HEIGHT / 2})`}
            >
              情感强度
            </text>

            {/* Area fill under curve */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#curveGradient)"
                opacity={0.15}
              />
            )}

            {/* Curve line */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Control points */}
            {svgPoints.map((point) => {
              const isEditing = editingPointId === point.id
              const isDragging = draggingPointId === point.id
              const isPositive = point.intensity >= 0

              return (
                <g key={point.id}>
                  {/* Label */}
                  {point.label && !isEditing && (
                    <text
                      x={point.x}
                      y={point.y + (isPositive ? -16 : 20)}
                      textAnchor="middle"
                      className="fill-foreground"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {point.label}
                    </text>
                  )}

                  {/* Editing input (foreignObject) */}
                  {isEditing && (
                    <foreignObject
                      x={point.x - 60}
                      y={point.y + (isPositive ? -40 : 12)}
                      width={120}
                      height={28}
                    >
                      <Input
                        autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onBlur={() => handleEditLabel(point.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditLabel(point.id)
                          if (e.key === 'Escape') setEditingPointId(null)
                        }}
                        placeholder="添加标签"
                        className="h-7 text-xs"
                      />
                    </foreignObject>
                  )}

                  {/* Point circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isDragging ? 8 : 6}
                    fill={isPositive ? '#22c55e' : '#3b82f6'}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-grab active:cursor-grabbing"
                    onMouseDown={handleDragStart(point.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      setEditingPointId(point.id)
                      setEditLabel(point.label)
                    }}
                  />

                  {/* Delete button (shown on hover) */}
                  <g
                    className="opacity-0 hover:opacity-100 transition-opacity"
                    style={{ pointerEvents: 'all' }}
                  >
                    <circle
                      cx={point.x + 14}
                      cy={point.y - 14}
                      r={8}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth={1.5}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePoint(projectId, point.id)
                      }}
                    />
                    <text
                      x={point.x + 14}
                      y={point.y - 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      x
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>
        </CardContent>
      </Card>

      {/* 节点列表 */}
      {points.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                情感节点（{points.length} 个）
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleClear}>
                  <Trash2 className="size-3" />
                  清空
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {points
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((point) => (
                  <Badge
                    key={point.id}
                    variant={point.intensity >= 0 ? 'default' : 'secondary'}
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      setEditingPointId(point.id)
                      setEditLabel(point.label)
                    }}
                  >
                    {point.position}%{' '}
                    {point.intensity > 0 ? '+' : ''}
                    {point.intensity}
                    {point.label ? ` ${point.label}` : ''}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 生成加载状态 */}
      {isAIStreaming && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 animate-spin" />
              AI 正在为你规划情感曲线...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
