"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/stores/project-store";
import { useCharacterStore } from "@/stores/character-store";
import { CharacterCard } from "@/components/characters/character-card";
import { CharacterEditor } from "@/components/characters/character-editor";
import { RelationshipGraph } from "@/components/characters/relationship-graph";
import { CharacterInterview } from "@/components/characters/character-interview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Network, MessageCircle } from "lucide-react";
import type { Character } from "@/lib/types";

export default function CharactersPage() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const currentProject = useProjectStore((s) => s.getCurrentProject());
  const allCharacters = useCharacterStore((s) => s.characters);

  const characters = useMemo(() =>
    currentProjectId
      ? allCharacters.filter((c) => c.project_id === currentProjectId)
      : [],
    [allCharacters, currentProjectId]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const filteredCharacters = searchQuery
    ? characters.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.background ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : characters;

  const handleNewCharacter = () => { setEditingCharacter(null); setEditorOpen(true); };
  const handleEditCharacter = (character: Character) => { setEditingCharacter(character); setEditorOpen(true); };

  if (!currentProjectId || !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-medium">请先选择一个作品</h2>
          <p className="text-sm text-muted-foreground">进入作品管理页面选择或创建一个作品</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">角色工作室</h1>
          <p className="text-sm text-muted-foreground">{currentProject.title} - 管理你的角色</p>
        </div>
        <Button onClick={handleNewCharacter}><Plus className="size-4" />新建角色</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="list">
            <Users className="size-4" />
            角色列表
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Network className="size-4" />
            关系图谱
          </TabsTrigger>
          <TabsTrigger value="interview">
            <MessageCircle className="size-4" />
            角色访谈
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索角色..." className="pl-9" />
          </div>
          {filteredCharacters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 size-12 text-muted-foreground/30" />
              <h3 className="mb-1 text-lg font-medium">{searchQuery ? "未找到匹配的角色" : "还没有角色"}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{searchQuery ? "尝试使用不同的关键词搜索" : "创建你的第一个角色，开始构建你的故事世界"}</p>
              {!searchQuery && <Button onClick={handleNewCharacter}><Plus className="size-4" />新建角色</Button>}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCharacters.map((character) => (
                <CharacterCard key={character.id} character={character} onClick={() => handleEditCharacter(character)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          <RelationshipGraph />
        </TabsContent>

        <TabsContent value="interview" className="mt-4">
          <div className="min-h-[500px]">
            <CharacterInterview />
          </div>
        </TabsContent>
      </Tabs>

      <CharacterEditor character={editingCharacter} open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
