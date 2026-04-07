"use client"

import { useState } from "react"
import { useSettingsStore } from "@/stores/settings-store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Brain,
  PenLine,
  FileDown,
  Info,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { AppSettings } from "@/stores/settings-store"
import { GENRE_LABELS } from "@/lib/types"

// ============================================================
// AI 模型设置 Tab
// ============================================================
function AiSettingsTab() {
  const settings = useSettingsStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latency: number } | null>>({})

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const testConnection = async (provider: string, apiKey: string) => {
    if (!apiKey) return
    setTesting((prev) => ({ ...prev, [provider]: true }))
    setTestResults((prev) => ({ ...prev, [provider]: null }))

    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      })
      const data = await res.json()
      setTestResults((prev) => ({ ...prev, [provider]: data }))
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: "网络错误", latency: 0 },
      }))
    } finally {
      setTesting((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const providers: { key: keyof Pick<AppSettings, "deepseekApiKey" | "qwenApiKey" | "openaiApiKey" | "anthropicApiKey">; label: string; models: string[] }[] = [
    { key: "deepseekApiKey", label: "DeepSeek", models: ["deepseek-chat", "deepseek-reasoner"] },
    { key: "qwenApiKey", label: "通义千问 (Qwen)", models: ["qwen-turbo", "qwen-plus", "qwen-max"] },
    { key: "openaiApiKey", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"] },
    { key: "anthropicApiKey", label: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250414"] },
  ]

  return (
    <div className="space-y-6">
      {/* 默认提供商 */}
      <div className="space-y-2">
        <Label>默认模型提供商</Label>
        <Select
          value={settings.defaultProvider}
          onValueChange={(v) =>
            settings.updateSettings({
              defaultProvider: v as AppSettings["defaultProvider"],
            })
          }
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="qwen">通义千问 (Qwen)</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* API Keys */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">API 密钥</Label>
        {providers.map((p) => (
          <div key={p.key} className="space-y-2">
            <Label htmlFor={p.key}>{p.label} API Key</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 min-w-0">
                <Input
                  id={p.key}
                  type={showKeys[p.key] ? "text" : "password"}
                  value={settings[p.key]}
                  onChange={(e) =>
                    settings.updateSettings({ [p.key]: e.target.value })
                  }
                  placeholder={`输入 ${p.label} API Key`}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey(p.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys[p.key] ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(p.key, settings[p.key])}
                disabled={!settings[p.key] || testing[p.key]}
              >
                {testing[p.key] ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "测试连接"
                )}
              </Button>
            </div>
            {testResults[p.key] && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  testResults[p.key]!.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {testResults[p.key]!.success ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                <span>
                  {testResults[p.key]!.message}
                  {testResults[p.key]!.latency > 0 &&
                    ` (${testResults[p.key]!.latency}ms)`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 任务模型选择 */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">任务模型分配</Label>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>构思/头脑风暴</Label>
            <Input
              value={settings.brainstormModel}
              onChange={(e) =>
                settings.updateSettings({ brainstormModel: e.target.value })
              }
              placeholder="deepseek-chat"
            />
          </div>
          <div className="space-y-2">
            <Label>续写/正文</Label>
            <Input
              value={settings.continueModel}
              onChange={(e) =>
                settings.updateSettings({ continueModel: e.target.value })
              }
              placeholder="deepseek-chat"
            />
          </div>
          <div className="space-y-2">
            <Label>分析/检查</Label>
            <Input
              value={settings.analyzeModel}
              onChange={(e) =>
                settings.updateSettings({ analyzeModel: e.target.value })
              }
              placeholder="deepseek-chat"
            />
          </div>
        </div>
      </div>

      {/* Temperature & Max Tokens */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">生成参数</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Temperature: {settings.temperature.toFixed(1)}
            </Label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                settings.updateSettings({
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>精确 (0)</span>
              <span>平衡 (1)</span>
              <span>创意 (2)</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>最大 Token 数</Label>
            <Input
              type="number"
              min={256}
              max={32768}
              value={settings.maxTokens}
              onChange={(e) =>
                settings.updateSettings({
                  maxTokens: parseInt(e.target.value) || 4096,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 写作偏好 Tab
// ============================================================
function WritingSettingsTab() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* 默认类型 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>默认小说类型</Label>
          <Select
            value={settings.defaultGenre}
            onValueChange={(v) => settings.updateSettings({ defaultGenre: v ?? "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">不指定</SelectItem>
              {Object.entries(GENRE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>默认结构框架</Label>
          <Select
            value={settings.defaultFramework}
            onValueChange={(v) =>
              settings.updateSettings({ defaultFramework: v ?? "" })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择框架" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">不指定</SelectItem>
              <SelectItem value="three_act">三幕式</SelectItem>
              <SelectItem value="hero_journey">英雄之旅</SelectItem>
              <SelectItem value="save_the_cat">救猫咪</SelectItem>
              <SelectItem value="seven_point">七点法</SelectItem>
              <SelectItem value="five_act">五幕式</SelectItem>
              <SelectItem value="kishotenketsu">起承转合</SelectItem>
              <SelectItem value="custom">自定义</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 自动保存 */}
      <div className="space-y-2">
        <Label>自动保存间隔</Label>
        <Select
          value={String(settings.autoSaveInterval)}
          onValueChange={(v) =>
            settings.updateSettings({ autoSaveInterval: parseInt(v ?? "60") })
          }
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 秒</SelectItem>
            <SelectItem value="60">1 分钟</SelectItem>
            <SelectItem value="120">2 分钟</SelectItem>
            <SelectItem value="300">5 分钟</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 编辑器设置 */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">编辑器设置</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>字体大小</Label>
            <Select
              value={settings.editorFontSize}
              onValueChange={(v) =>
                settings.updateSettings({
                  editorFontSize: v as AppSettings["editorFontSize"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>行高</Label>
            <Select
              value={String(settings.editorLineHeight)}
              onValueChange={(v) =>
                settings.updateSettings({ editorLineHeight: parseFloat(v ?? "1.8") })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.5">1.5</SelectItem>
                <SelectItem value="1.8">1.8</SelectItem>
                <SelectItem value="2.0">2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 字数/字符数 */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">显示选项</Label>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-word-count">显示字数统计</Label>
          <Switch
            id="show-word-count"
            checked={settings.showWordCount}
            onCheckedChange={(v) =>
              settings.updateSettings({ showWordCount: v })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-char-count">显示字符数统计</Label>
          <Switch
            id="show-char-count"
            checked={settings.showCharCount}
            onCheckedChange={(v) =>
              settings.updateSettings({ showCharCount: v })
            }
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 导出设置 Tab
// ============================================================
function ExportSettingsTab() {
  const settings = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* 默认格式 */}
      <div className="space-y-2">
        <Label>默认导出格式</Label>
        <Select
          value={settings.defaultExportFormat}
          onValueChange={(v) =>
            settings.updateSettings({
              defaultExportFormat: v as AppSettings["defaultExportFormat"],
            })
          }
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="txt">纯文本 (TXT)</SelectItem>
            <SelectItem value="markdown">Markdown (MD)</SelectItem>
            <SelectItem value="html">HTML 网页</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 作者名 */}
      <div className="space-y-2">
        <Label htmlFor="default-author-name">默认作者署名</Label>
        <Input
          id="default-author-name"
          value={settings.defaultAuthorName}
          onChange={(e) =>
            settings.updateSettings({ defaultAuthorName: e.target.value })
          }
          placeholder="输入默认作者名称"
        />
      </div>

      {/* 章节标题 */}
      <div className="flex items-center justify-between">
        <Label htmlFor="include-chapter-titles">导出时包含章节标题</Label>
        <Switch
          id="include-chapter-titles"
          checked={settings.includeChapterTitles}
          onCheckedChange={(v) =>
            settings.updateSettings({ includeChapterTitles: v })
          }
        />
      </div>

      {/* 自定义 CSS */}
      <div className="space-y-2">
        <Label htmlFor="custom-export-css">HTML 导出自定义 CSS</Label>
        <Textarea
          id="custom-export-css"
          value={settings.customExportCss}
          onChange={(e) =>
            settings.updateSettings({ customExportCss: e.target.value })
          }
          placeholder="输入自定义 CSS 样式（仅用于 HTML 导出）"
          rows={8}
          className="font-mono text-xs"
        />
      </div>
    </div>
  )
}

// ============================================================
// 关于 Tab
// ============================================================
function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Novel Forge</h3>
        <p className="text-sm text-muted-foreground">版本 v0.1.0</p>
        <p className="text-sm leading-relaxed">
          Novel Forge 是一款 AI 辅助的小说创作工具，提供构思工坊、世界观构建、角色塑造、智能写作等功能，帮助作者高效创作优秀的小说作品。
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">技术栈</Label>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Next.js 15 (App Router)</li>
          <li>React 19 + TypeScript</li>
          <li>Tailwind CSS v4</li>
          <li>shadcn/ui (base-ui)</li>
          <li>TipTap 富文本编辑器</li>
          <li>Zustand 状态管理</li>
          <li>Vercel AI SDK</li>
          <li>Supabase 后端服务</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">链接</Label>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          GitHub 仓库
          <span className="text-xs text-muted-foreground">(即将开源)</span>
        </a>
      </div>
    </div>
  )
}

// ============================================================
// Settings Page
// ============================================================
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">设置</h1>
        <p className="text-sm text-muted-foreground">
          管理应用偏好、AI 模型配置和导出选项
        </p>
      </div>

      <Tabs defaultValue="ai">
        <TabsList variant="line" className="overflow-x-auto">
          <TabsTrigger value="ai">
            <Brain className="size-4" />
            AI 模型设置
          </TabsTrigger>
          <TabsTrigger value="writing">
            <PenLine className="size-4" />
            写作偏好
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileDown className="size-4" />
            导出设置
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="size-4" />
            关于
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <AiSettingsTab />
        </TabsContent>

        <TabsContent value="writing" className="mt-6">
          <WritingSettingsTab />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportSettingsTab />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
