"use client";

import React, { useState, useCallback } from "react";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  X,
  Loader2,
  Zap,
  Save,
  Flame,
  Droplets,
  Mountain,
  Wand2,
} from "lucide-react";

// ---- Types ----

interface Tier {
  id: string;
  name: string;
  description: string;
}

interface PowerSystemData {
  name: string;
  hardness: number;
  energySource: string;
  tiers: Tier[];
  limitations: string[];
  costs: string[];
  abilities: string[];
}

const XIAXIA_TIERS: Tier[] = [
  { id: "1", name: "炼气", description: "感应天地灵气，引入体内经脉" },
  { id: "2", name: "筑基", description: "灵气凝聚成基，脱胎换骨" },
  { id: "3", name: "金丹", description: "灵气凝结为金丹，寿元大增" },
  { id: "4", name: "元婴", description: "金丹化婴，神识初成" },
  { id: "5", name: "化神", description: "元婴化神，可御空飞行" },
  { id: "6", name: "炼虚", description: "炼化虚空，掌握空间之力" },
  { id: "7", name: "合体", description: "元神与肉身合一，战力暴涨" },
  { id: "8", name: "大乘", description: "道法大成，一念之间天地变色" },
  { id: "9", name: "渡劫", description: "渡过天劫，飞升仙界" },
];

const HARDNESS_LABELS: Record<number, string> = {
  1: "极软魔法 - 几乎无规则",
  2: "很软 - 规则模糊",
  3: "偏软 - 有少量规则",
  4: "中等偏软",
  5: "中等 - 规则与自由并存",
  6: "中等偏硬",
  7: "偏硬 - 规则较多",
  8: "很硬 - 规则严格",
  9: "极硬 - 规则精密",
  10: "完全硬魔法 - 如科学般精确",
};

function createEmptyData(): PowerSystemData {
  return {
    name: "",
    hardness: 5,
    energySource: "",
    tiers: [],
    limitations: [],
    costs: [],
    abilities: [],
  };
}

// ---- Dynamic List Sub-component ----

function DynamicList({
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder: string;
  addLabel: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
          <span className="flex-1 text-sm">{item}</span>
          <Button variant="ghost" size="icon-xs" onClick={() => onRemove(i)}>
            <X className="size-3" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ---- Tier Editor Sub-component ----

function TierEditor({
  tiers,
  onChange,
}: {
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
}) {
  const handleAdd = () => {
    const newTier: Tier = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
    };
    onChange([...tiers, newTier]);
  };

  const handleRemove = (id: string) => {
    onChange(tiers.filter((t) => t.id !== id));
  };

  const handleUpdate = (id: string, field: keyof Tier, value: string) => {
    onChange(
      tiers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  return (
    <div className="space-y-3">
      {tiers.map((tier, index) => (
        <div
          key={tier.id}
          className="rounded-lg border bg-muted/30 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">
              {index + 1}
            </Badge>
            <Input
              value={tier.name}
              onChange={(e) => handleUpdate(tier.id, "name", e.target.value)}
              placeholder="境界名称"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleRemove(tier.id)}
            >
              <X className="size-3" />
            </Button>
          </div>
          <Textarea
            value={tier.description}
            onChange={(e) =>
              handleUpdate(tier.id, "description", e.target.value)
            }
            placeholder="描述此境界的能力和特征..."
            rows={2}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="size-4" />
        添加境界
      </Button>
    </div>
  );
}

// ---- Main Component ----

export function PowerSystemDesigner() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addSetting = useWorldStore((s) => s.addSetting);
  const updateSetting = useWorldStore((s) => s.updateSetting);
  const projectSettings = useWorldStore((s) =>
    currentProjectId
      ? s.settings.filter((s) => s.project_id === currentProjectId)
      : []
  );

  const [data, setData] = useState<PowerSystemData>(createEmptyData());
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof PowerSystemData>(key: K, value: PowerSystemData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleApplyXianxiaPreset = () => {
    setData((prev) => ({
      ...prev,
      name: prev.name || "修炼体系",
      tiers: XIAXIA_TIERS.map((t) => ({ ...t, id: crypto.randomUUID() })),
    }));
  };

  const handleAIGenerate = async (field: string) => {
    setGeneratingField(field);
    try {
      const response = await fetch("/api/worldbuilding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "力量体系",
          name: `力量体系 - ${field}`,
          projectId: currentProjectId,
        }),
      });
      if (!response.ok || !response.body) throw new Error("生成失败");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      switch (field) {
        case "energySource":
          updateField("energySource", result);
          break;
        case "limitations":
          updateField("limitations", result.split("\n").filter(Boolean));
          break;
        case "costs":
          updateField("costs", result.split("\n").filter(Boolean));
          break;
        case "abilities":
          updateField("abilities", result.split("\n").filter(Boolean));
          break;
      }
    } catch (error) {
      console.error("AI generate error:", error);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleSave = () => {
    if (!data.name.trim() || !currentProjectId) return;

    const content = JSON.stringify(
      {
        hardness: data.hardness,
        energySource: data.energySource,
        tiers: data.tiers,
        limitations: data.limitations,
        costs: data.costs,
        abilities: data.abilities,
      },
      null,
      2
    );

    const rules: string[] = [];
    if (data.energySource) rules.push(`能量来源：${data.energySource}`);
    data.limitations.forEach((l) => rules.push(`限制：${l}`));
    data.costs.forEach((c) => rules.push(`代价：${c}`));

    const now = new Date().toISOString();

    if (savedId) {
      updateSetting(savedId, { name: data.name.trim(), content, rules });
    } else {
      const id = crypto.randomUUID();
      addSetting({
        id,
        project_id: currentProjectId,
        name: data.name.trim(),
        category: "power_system",
        parent_id: null,
        content,
        rules,
        created_at: now,
        updated_at: now,
      });
      setSavedId(id);
    }
  };

  const handleLoadExisting = () => {
    const existing = projectSettings.find(
      (s) => s.category === "power_system"
    );
    if (existing && existing.content) {
      try {
        const parsed = JSON.parse(existing.content);
        setData({
          name: existing.name,
          hardness: parsed.hardness ?? 5,
          energySource: parsed.energySource ?? "",
          tiers: parsed.tiers ?? [],
          limitations: parsed.limitations ?? [],
          costs: parsed.costs ?? [],
          abilities: parsed.abilities ?? [],
        });
        setSavedId(existing.id);
      } catch {
        // ignore parse errors
      }
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 p-1">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-amber-500" />
            <h3 className="text-lg font-semibold">力量体系设计器</h3>
          </div>
          <div className="flex gap-2">
            {projectSettings.some((s) => s.category === "power_system") &&
              !savedId && (
                <Button variant="outline" size="sm" onClick={handleLoadExisting}>
                  <Flame className="size-4" />
                  加载已有体系
                </Button>
              )}
            <Button variant="outline" size="sm" onClick={handleApplyXianxiaPreset}>
              <Mountain className="size-4" />
              修炼境界预设
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!data.name.trim()}>
              <Save className="size-4" />
              保存为设定
            </Button>
          </div>
        </div>

        {/* System Name */}
        <div className="space-y-2">
          <Label>体系名称 *</Label>
          <Input
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="例如：灵气修炼体系、元素魔法系统..."
          />
        </div>

        {/* Hardness Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wand2 className="size-4" />
              魔法硬度光谱
            </CardTitle>
            <CardDescription>
              左侧为软魔法（规则模糊，充满未知），右侧为硬魔法（规则精密，如科学般精确）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-8 shrink-0">软</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={data.hardness}
                  onChange={(e) =>
                    updateField("hardness", Number(e.target.value))
                  }
                  className="flex-1 accent-primary"
                />
                <span className="text-xs text-muted-foreground w-8 shrink-0 text-right">
                  硬
                </span>
              </div>
              <div className="text-center">
                <Badge variant="secondary">
                  {data.hardness}/10 - {HARDNESS_LABELS[data.hardness]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Droplets className="size-4 text-blue-500" />
                能量来源
              </CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleAIGenerate("energySource")}
                disabled={generatingField === "energySource"}
              >
                {generatingField === "energySource" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI生成
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.energySource}
              onChange={(e) => updateField("energySource", e.target.value)}
              placeholder="描述力量体系的能量来源，例如：天地灵气、元素之力、信仰之力..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Tier System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mountain className="size-4 text-green-500" />
              等级/境界体系
            </CardTitle>
            <CardDescription>
              定义力量体系的等级划分，每个等级的名称和特征
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TierEditor tiers={data.tiers} onChange={(t) => updateField("tiers", t)} />
          </CardContent>
        </Card>

        <Separator />

        {/* Limitations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <X className="size-4 text-red-500" />
                限制与禁忌
              </CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleAIGenerate("limitations")}
                disabled={generatingField === "limitations"}
              >
                {generatingField === "limitations" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI生成
              </Button>
            </div>
            <CardDescription>
              使用者不能做的事情，体系中的禁忌和限制
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicList
              items={data.limitations}
              onAdd={(item) =>
                updateField("limitations", [...data.limitations, item])
              }
              onRemove={(i) =>
                updateField(
                  "limitations",
                  data.limitations.filter((_, idx) => idx !== i)
                )
              }
              onChange={(i, value) => {
                const updated = [...data.limitations];
                updated[i] = value;
                updateField("limitations", updated);
              }}
              placeholder="输入一条限制..."
              addLabel="添加限制"
            />
          </CardContent>
        </Card>

        {/* Costs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Flame className="size-4 text-orange-500" />
                代价与消耗
              </CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleAIGenerate("costs")}
                disabled={generatingField === "costs"}
              >
                {generatingField === "costs" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI生成
              </Button>
            </div>
            <CardDescription>
              使用力量必须付出的代价
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicList
              items={data.costs}
              onAdd={(item) => updateField("costs", [...data.costs, item])}
              onRemove={(i) =>
                updateField(
                  "costs",
                  data.costs.filter((_, idx) => idx !== i)
                )
              }
              onChange={(i, value) => {
                const updated = [...data.costs];
                updated[i] = value;
                updateField("costs", updated);
              }}
              placeholder="输入一条代价..."
              addLabel="添加代价"
            />
          </CardContent>
        </Card>

        {/* Known Abilities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="size-4 text-yellow-500" />
                已知能力
              </CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleAIGenerate("abilities")}
                disabled={generatingField === "abilities"}
              >
                {generatingField === "abilities" ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI生成
              </Button>
            </div>
            <CardDescription>
              体系中已知的特定能力或法术
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicList
              items={data.abilities}
              onAdd={(item) =>
                updateField("abilities", [...data.abilities, item])
              }
              onRemove={(i) =>
                updateField(
                  "abilities",
                  data.abilities.filter((_, idx) => idx !== i)
                )
              }
              onChange={(i, value) => {
                const updated = [...data.abilities];
                updated[i] = value;
                updateField("abilities", updated);
              }}
              placeholder="输入一项能力..."
              addLabel="添加能力"
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
