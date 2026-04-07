"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useCharacterStore } from "@/stores/character-store";
import { useRelationshipStore } from "@/stores/relationship-store";
import { useProjectStore } from "@/stores/project-store";
import type { CharacterRelationship } from "@/stores/relationship-store";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Network } from "lucide-react";
import { CHARACTER_ROLE_LABELS } from "@/lib/types";
import type { Character, CharacterRole } from "@/lib/types";

// Relationship types
const RELATIONSHIP_TYPES = [
  "师徒",
  "恋人",
  "宿敌",
  "朋友",
  "亲人",
  "同盟",
  "对手",
  "上下级",
  "邻居",
  "陌生人",
  "暗恋",
  "知己",
  "利用",
  "其他",
];

// Relationship type to line style mapping
function getLineStyle(type: string): { strokeDasharray: string; color: string } {
  const positive = ["师徒", "恋人", "朋友", "亲人", "同盟", "知己"];
  const negative = ["宿敌", "对手", "利用"];
  if (positive.includes(type)) return { strokeDasharray: "none", color: "#22c55e" };
  if (negative.includes(type)) return { strokeDasharray: "8 4", color: "#ef4444" };
  return { strokeDasharray: "3 3", color: "#f59e0b" };
}

// Role to color mapping
function getRoleColor(role: CharacterRole): string {
  const colors: Record<CharacterRole, string> = {
    protagonist: "#3b82f6",
    antagonist: "#ef4444",
    supporting: "#22c55e",
    minor: "#9ca3af",
  };
  return colors[role] || "#9ca3af";
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  character: Character;
}

export function RelationshipGraph() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const characters = useCharacterStore((s) =>
    currentProjectId
      ? s.characters.filter((c) => c.project_id === currentProjectId)
      : []
  );
  const relationships = useRelationshipStore((s) =>
    currentProjectId
      ? s.relationships.filter((r) => r.project_id === currentProjectId)
      : []
  );
  const addRelationship = useRelationshipStore((s) => s.addRelationship);
  const updateRelationship = useRelationshipStore((s) => s.updateRelationship);
  const removeRelationship = useRelationshipStore((s) => s.removeRelationship);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<CharacterRelationship | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);

  // Form state
  const [charAId, setCharAId] = useState("");
  const [charBId, setCharBId] = useState("");
  const [relType, setRelType] = useState("");
  const [relDescription, setRelDescription] = useState("");
  const [relDynamics, setRelDynamics] = useState("");
  const [relEvolution, setRelEvolution] = useState("");

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 500;

  // Calculate node positions in a circle layout
  const nodePositions = useMemo<NodePosition[]>(() => {
    if (characters.length === 0) return [];
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) * 0.35;

    return characters.map((character, index) => {
      const angle = (2 * Math.PI * index) / characters.length - Math.PI / 2;
      return {
        id: character.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        character,
      };
    });
  }, [characters]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodePosition>();
    nodePositions.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodePositions]);

  const handleOpenNew = () => {
    setEditingRelation(null);
    setCharAId("");
    setCharBId("");
    setRelType("");
    setRelDescription("");
    setRelDynamics("");
    setRelEvolution("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (rel: CharacterRelationship) => {
    setEditingRelation(rel);
    setCharAId(rel.character_a_id);
    setCharBId(rel.character_b_id);
    setRelType(rel.type);
    setRelDescription(rel.description);
    setRelDynamics(rel.dynamics);
    setRelEvolution(rel.evolution);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentProjectId || !charAId || !charBId || !relType) return;
    if (charAId === charBId) return;

    if (editingRelation) {
      updateRelationship(editingRelation.id, {
        character_a_id: charAId,
        character_b_id: charBId,
        type: relType,
        description: relDescription,
        dynamics: relDynamics,
        evolution: relEvolution,
      });
    } else {
      addRelationship({
        id: crypto.randomUUID(),
        project_id: currentProjectId,
        character_a_id: charAId,
        character_b_id: charBId,
        type: relType,
        description: relDescription,
        dynamics: relDynamics,
        evolution: relEvolution,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeRelationship(id);
    setSelectedRelationId(null);
  };

  const handleLineClick = (rel: CharacterRelationship) => {
    setSelectedRelationId(rel.id);
  };

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Network className="mb-3 size-12 text-muted-foreground/30" />
        <h3 className="mb-1 text-lg font-medium">还没有角色</h3>
        <p className="text-sm text-muted-foreground">请先创建角色，然后才能建立关系图谱</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 bg-green-500" /> 正面关系
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-red-500" /> 负面关系
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dotted border-amber-500" /> 复杂关系
          </span>
        </div>
        <Button size="sm" onClick={handleOpenNew}>
          <Plus className="size-4" />添加关系
        </Button>
      </div>

      {/* SVG Graph */}
      <div className="overflow-hidden rounded-lg border bg-background">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minHeight: 400 }}
        >
          {/* Relationship lines */}
          {relationships.map((rel) => {
            const nodeA = nodeMap.get(rel.character_a_id);
            const nodeB = nodeMap.get(rel.character_b_id);
            if (!nodeA || !nodeB) return null;

            const style = getLineStyle(rel.type);
            const isSelected = selectedRelationId === rel.id;
            const midX = (nodeA.x + nodeB.x) / 2;
            const midY = (nodeA.y + nodeB.y) / 2;

            return (
              <g key={rel.id}>
                {/* Invisible wider line for easier clicking */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                  onClick={() => handleLineClick(rel)}
                />
                {/* Visible line */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={style.color}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={style.strokeDasharray}
                  opacity={isSelected ? 1 : 0.7}
                  className="pointer-events-none"
                />
                {/* Label background */}
                <rect
                  x={midX - 20}
                  y={midY - 10}
                  width={40}
                  height={20}
                  rx={4}
                  fill="white"
                  className="pointer-events-none"
                />
                {/* Label text */}
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill={style.color}
                  className="pointer-events-none select-none"
                >
                  {rel.type}
                </text>
              </g>
            );
          })}

          {/* Character nodes */}
          {nodePositions.map((node) => {
            const role = node.character.role;
            const color = getRoleColor(role);
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={30}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight={500}
                  fill={color}
                  className="pointer-events-none select-none"
                >
                  {node.character.name.length > 4
                    ? node.character.name.slice(0, 4) + ".."
                    : node.character.name}
                </text>
                <text
                  x={node.x}
                  y={node.y + 18}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9ca3af"
                  className="pointer-events-none select-none"
                >
                  {CHARACTER_ROLE_LABELS[role]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected relationship details */}
      {selectedRelationId && (() => {
        const rel = relationships.find((r) => r.id === selectedRelationId);
        if (!rel) return null;
        const charA = characters.find((c) => c.id === rel.character_a_id);
        const charB = characters.find((c) => c.id === rel.character_b_id);
        const style = getLineStyle(rel.type);
        return (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span style={{ color: style.color }}>{charA?.name}</span>
                <span className="text-muted-foreground">--</span>
                <Badge variant="outline" style={{ borderColor: style.color, color: style.color }}>{rel.type}</Badge>
                <span className="text-muted-foreground">--</span>
                <span style={{ color: style.color }}>{charB?.name}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-xs" onClick={() => handleOpenEdit(rel)}>
                  <Edit2 className="size-3" />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(rel.id)}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            </div>
            {rel.description && (
              <p className="text-sm text-muted-foreground">{rel.description}</p>
            )}
            {rel.dynamics && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">关系动态：</span>{rel.dynamics}
              </p>
            )}
            {rel.evolution && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">关系演变：</span>{rel.evolution}
              </p>
            )}
          </div>
        );
      })()}

      {/* Relationship list below graph */}
      {relationships.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">关系列表</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {relationships.map((rel) => {
              const charA = characters.find((c) => c.id === rel.character_a_id);
              const charB = characters.find((c) => c.id === rel.character_b_id);
              const style = getLineStyle(rel.type);
              return (
                <div
                  key={rel.id}
                  className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-muted/50 ${
                    selectedRelationId === rel.id ? "ring-1 ring-primary" : ""
                  }`}
                  onClick={() => handleLineClick(rel)}
                >
                  <span className="font-medium">{charA?.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                    style={{ borderColor: style.color, color: style.color }}
                  >
                    {rel.type}
                  </Badge>
                  <span className="font-medium">{charB?.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRelation ? "编辑关系" : "添加关系"}</DialogTitle>
            <DialogDescription>定义两个角色之间的关系</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>角色 A</Label>
                <Select value={charAId} onValueChange={(v) => v && setCharAId(v)}>
                  <SelectTrigger><SelectValue placeholder="选择角色" /></SelectTrigger>
                  <SelectContent>
                    {characters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>角色 B</Label>
                <Select value={charBId} onValueChange={(v) => v && setCharBId(v)}>
                  <SelectTrigger><SelectValue placeholder="选择角色" /></SelectTrigger>
                  <SelectContent>
                    {characters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>关系类型</Label>
              <Select value={relType} onValueChange={(v) => v && setRelType(v)}>
                <SelectTrigger><SelectValue placeholder="选择关系类型" /></SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>关系描述</Label>
              <Textarea
                value={relDescription}
                onChange={(e) => setRelDescription(e.target.value)}
                placeholder="描述这两个角色之间的关系..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>关系动态</Label>
              <Input
                value={relDynamics}
                onChange={(e) => setRelDynamics(e.target.value)}
                placeholder="例如：权力失衡、互相依赖..."
              />
            </div>
            <div className="space-y-2">
              <Label>关系演变</Label>
              <Textarea
                value={relEvolution}
                onChange={(e) => setRelEvolution(e.target.value)}
                placeholder="描述这段关系在故事中的变化..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            {editingRelation && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleDelete(editingRelation.id);
                  setDialogOpen(false);
                }}
              >
                删除
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!charAId || !charBId || !relType || charAId === charBId}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
