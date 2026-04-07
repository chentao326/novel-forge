import Link from "next/link"
import {
  Lightbulb,
  Globe,
  Users,
  PenTool,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: Lightbulb,
    title: "构思工坊",
    description:
      "从一句话到完整大纲，AI 辅助你逐步展开故事构思，支持雪花法和多种结构框架。",
  },
  {
    icon: Globe,
    title: "世界观构建",
    description:
      "构建丰富的世界观设定，包括地理、历史、政治、文化、力量体系等多个维度。",
  },
  {
    icon: Users,
    title: "角色塑造",
    description:
      "创建立体鲜活的角色，定义角色的核心创伤、谎言、需求，规划角色成长弧线。",
  },
  {
    icon: PenTool,
    title: "智能写作",
    description:
      "基于上下文智能续写，保持文风一致，支持大纲驱动的章节写作和实时字数统计。",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero 区域 */}
      <section className="relative flex flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-xs sm:px-4 sm:text-sm text-muted-foreground">
            <Sparkles className="size-3.5 sm:size-4" />
            AI 驱动的创作工具
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            AI辅助小说创作
          </h1>

          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-xl">
            构思大于正文 -- 好的设定是开始小说的关键
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 w-full sm:w-auto" render={<Link href="/projects" />}>
              开始创作
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" render={<Link href="/projects" />}>
              查看作品
            </Button>
          </div>
        </div>
      </section>

      {/* 功能卡片 */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
            全流程创作支持
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            从灵感到成稿，Novel Forge 陪伴你的每一步
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 底部 */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground sm:py-8">
        <p>Novel Forge -- 让创作更高效，让故事更精彩</p>
      </footer>
    </div>
  )
}
