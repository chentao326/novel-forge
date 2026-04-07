'use client'

import { useState, useCallback } from 'react'
import { Lightbulb, BookOpen, Snowflake, ListMusic, Library, Scissors, Heart } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import BrainstormPanel from '@/components/conception/brainstorm-panel'
import StructureEngine from '@/components/conception/structure-engine'
import SnowflakePlanner from '@/components/conception/snowflake-planner'
import BeatSheetEditor from '@/components/conception/beat-sheet-editor'
import { GenreBrowser } from '@/components/conception/genre-browser'
import BestsellerAnalyzer from '@/components/conception/bestseller-analyzer'
import EmotionCurveEditor from '@/components/conception/emotion-curve-editor'
import type { StructureFramework, SnowflakeStep, Beat, Character, Genre } from '@/lib/types'

export default function ConceptionPage() {
  // 项目状态（后续接入 Zustand store 或 Supabase）
  const [projectId] = useState<string>('')
  const [synopsis, setSynopsis] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<StructureFramework | null>(null)
  const [snowflakeStep, setSnowflakeStep] = useState<SnowflakeStep | null>(null)
  const [beats, setBeats] = useState<Beat[]>([])
  const [characters] = useState<Character[]>([])

  const handleAdoptConcept = useCallback((concept: { synopsis: string }) => {
    setSynopsis(concept.synopsis)
  }, [])

  const handleSelectFramework = useCallback((framework: StructureFramework) => {
    setSelectedFramework(framework)
  }, [])

  const handleSaveStructure = useCallback((framework: StructureFramework, newBeats: Beat[]) => {
    setSelectedFramework(framework)
    setBeats(newBeats)
  }, [])

  const handleSnowflakeStepChange = useCallback((step: SnowflakeStep) => {
    setSnowflakeStep(step)
  }, [])

  const handleSaveBeats = useCallback((newBeats: Beat[]) => {
    setBeats(newBeats)
  }, [])

  const handleApplyGenre = useCallback((_genre: Genre) => {
    // Genre is applied via store inside GenreBrowser
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">构思工坊</h1>
          <p className="text-sm text-muted-foreground mt-1">
            从灵感到大纲，系统化地构建你的故事
          </p>
        </div>

        {/* 主标签页 */}
        <Tabs defaultValue="brainstorm">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="brainstorm">
              <Lightbulb className="size-4" />
              灵感激发
            </TabsTrigger>
            <TabsTrigger value="structure">
              <BookOpen className="size-4" />
              结构引擎
            </TabsTrigger>
            <TabsTrigger value="snowflake">
              <Snowflake className="size-4" />
              大纲规划
            </TabsTrigger>
            <TabsTrigger value="beatsheet">
              <ListMusic className="size-4" />
              节拍表
            </TabsTrigger>
            <TabsTrigger value="genre">
              <Library className="size-4" />
              体裁知识
            </TabsTrigger>
            <TabsTrigger value="bestseller">
              <Scissors className="size-4" />
              爆款拆解
            </TabsTrigger>
            <TabsTrigger value="emotion-curve">
              <Heart className="size-4" />
              情感曲线
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: 灵感激发 */}
          <TabsContent value="brainstorm">
            <BrainstormPanel
              projectId={projectId}
              synopsis={synopsis}
              characters={characters}
              onAdoptConcept={handleAdoptConcept}
            />
          </TabsContent>

          {/* Tab 2: 结构引擎 */}
          <TabsContent value="structure">
            <StructureEngine
              projectId={projectId}
              synopsis={synopsis}
              characters={characters}
              selectedFramework={selectedFramework}
              existingBeats={beats}
              onSelectFramework={handleSelectFramework}
              onSaveStructure={handleSaveStructure}
            />
          </TabsContent>

          {/* Tab 3: 大纲规划（雪花法） */}
          <TabsContent value="snowflake">
            <SnowflakePlanner
              projectId={projectId}
              synopsis={synopsis}
              characters={characters}
              initialStep={snowflakeStep}
              onStepChange={handleSnowflakeStepChange}
            />
          </TabsContent>

          {/* Tab 4: 节拍表 */}
          <TabsContent value="beatsheet">
            <BeatSheetEditor
              projectId={projectId}
              synopsis={synopsis}
              framework={selectedFramework}
              initialBeats={beats}
              onSave={handleSaveBeats}
            />
          </TabsContent>

          {/* Tab 5: 体裁知识 */}
          <TabsContent value="genre">
            <GenreBrowser
              projectId={projectId}
              onApplyGenre={handleApplyGenre}
            />
          </TabsContent>

          {/* Tab 6: 爆款拆解 */}
          <TabsContent value="bestseller">
            <BestsellerAnalyzer
              projectId={projectId}
              synopsis={synopsis}
            />
          </TabsContent>

          {/* Tab 7: 情感曲线 */}
          <TabsContent value="emotion-curve">
            <EmotionCurveEditor
              projectId={projectId}
              synopsis={synopsis}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
