"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENRE_LABELS } from "@/lib/types";
import type { Genre } from "@/lib/types";

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreateDialog({
  open,
  onOpenChange,
}: ProjectCreateDialogProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre>("fantasy");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);

    try {
      // In production, this would call Supabase to create the project
      // For now, we create locally via the store
      const { useProjectStore } = await import("@/stores/project-store");
      const store = useProjectStore.getState();

      const newProject = {
        id: crypto.randomUUID(),
        title: title.trim(),
        genre,
        description,
        synopsis: null,
        structure_framework: null,
        settings: null,
        user_id: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        word_count: 0,
      };

      store.addProject(newProject);
      store.setCurrentProject(newProject.id);

      // Reset form
      setTitle("");
      setGenre("fantasy");
      setDescription("");
      onOpenChange(false);

      // Redirect to conception page
      router.push("/conception");
    } catch (error) {
      console.error("Create project error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建作品</DialogTitle>
          <DialogDescription>
            创建一个新的小说创作项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>作品名称 *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入作品名称"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>类型</Label>
            <Select
              value={genre}
              onValueChange={(v) => setGenre(v as Genre)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
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
            <Label>简介</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述你的作品..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isCreating}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
