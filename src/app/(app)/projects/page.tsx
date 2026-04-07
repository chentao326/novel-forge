"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useChapterStore } from "@/stores/chapter-store";
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, BookOpen, Trash2, FileText, Clock } from "lucide-react";
import { GENRE_LABELS } from "@/lib/types";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, setCurrentProject, removeProject } = useProjectStore();
  const chapters = useChapterStore((s) => s.chapters);

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filteredProjects = searchQuery
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const handleEnterProject = (project: Project) => {
    setCurrentProject(project.id);
    router.push("/conception");
  };

  const handleDeleteProject = () => {
    if (!deleteTarget) return;
    removeProject(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getProjectStats = (projectId: string) => {
    const projectChapters = chapters.filter((c) => c.project_id === projectId);
    const chapterCount = projectChapters.length;
    const wordCount = projectChapters.reduce((sum, c) => sum + c.word_count, 0);
    return { chapterCount, wordCount };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-xl font-bold">我的作品</h1><p className="text-sm text-muted-foreground">管理你的小说创作项目</p></div>
        <Button onClick={() => setCreateDialogOpen(true)}><Plus className="size-4" />新建作品</Button>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索作品..." className="pl-9" />
      </div>
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-3 size-12 text-muted-foreground/30" />
          <h3 className="mb-1 text-lg font-medium">{searchQuery ? "未找到匹配的作品" : "还没有作品"}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{searchQuery ? "尝试使用不同的关键词搜索" : "创建你的第一个小说作品，开始创作之旅"}</p>
          {!searchQuery && <Button onClick={() => setCreateDialogOpen(true)}><Plus className="size-4" />新建作品</Button>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <Card key={project.id} className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardContent>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => handleEnterProject(project)}>
                      <h3 className="mb-1 text-sm font-medium group-hover:text-primary">{project.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">{GENRE_LABELS[project.genre]}</Badge>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }} className="opacity-0 group-hover:opacity-100">
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                  {project.description && <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText className="size-3" />{stats.chapterCount} 章</span>
                    <span className="flex items-center gap-1"><BookOpen className="size-3" />{stats.wordCount.toLocaleString()} 字</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{formatDate(project.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <ProjectCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除作品"{deleteTarget?.title}"吗？所有相关数据都将被删除。此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteProject}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
