"use client";

import React, { useState } from "react";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import { ALL_LAYERS } from "@/lib/worldbuilding/layer-templates";
import type { LayerTemplate, LayerField } from "@/lib/worldbuilding/layer-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Loader2,
  Layers,
  Mountain,
  Users,
  Brain,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const LAYER_ICONS: Record<string, React.ElementType> = {
  physical: Mountain,
  cultural: Users,
  philosophical: Brain,
};

export function LayerBuilder() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addSetting = useWorldStore((s) => s.addSetting);
  const projectSettings = useWorldStore((s) =>
    currentProjectId
      ? s.settings.filter((s) => s.project_id === currentProjectId)
      : []
  );

  const [expandedLayer, setExpandedLayer] = useState<string | null>("physical");
  const [layerData, setLayerData] = useState<Record<string, Record<string, string>>>({});
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  const getFieldValue = (layerId: string, fieldKey: string): string => {
    return layerData[layerId]?.[fieldKey] ?? "";
  };

  const setFieldValue = (layerId: string, fieldKey: string, value: string) => {
    setLayerData((prev) => ({
      ...prev,
      [layerId]: {
        ...(prev[layerId] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const handleAIGenerate = async (layerId: string, field: LayerField) => {
    setGeneratingField(`${layerId}-${field.key}`);
    try {
      const response = await fetch("/api/worldbuilding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: field.label,
          name: field.label,
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
      setFieldValue(layerId, field.key, result);
    } catch (error) {
      console.error("AI generate error:", error);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleSaveLayer = (layer: LayerTemplate) => {
    if (!currentProjectId) return;

    const data = layerData[layer.id] || {};
    const filledFields = Object.entries(data).filter(([, v]) => v.trim());
    if (filledFields.length === 0) return;

    const content = filledFields
      .map(([key, value]) => {
        const field = layer.fields.find((f) => f.key === key);
        return `【${field?.label || key}】\n${value}`;
      })
      .join("\n\n");

    const rules = filledFields.map(([key, value]) => {
      const field = layer.fields.find((f) => f.key === key);
      return `${field?.label || key}: ${value.slice(0, 100)}`;
    });

    const now = new Date().toISOString();
    addSetting({
      id: crypto.randomUUID(),
      project_id: currentProjectId,
      name: layer.name,
      category: "culture",
      parent_id: null,
      content,
      rules,
      created_at: now,
      updated_at: now,
    });
  };

  const handleSaveAll = () => {
    ALL_LAYERS.forEach((layer) => handleSaveLayer(layer));
  };

  const getLayerCompletion = (layer: LayerTemplate): number => {
    const data = layerData[layer.id] || {};
    const filled = layer.fields.filter((f) => data[f.key]?.trim()).length;
    return Math.round((filled / layer.fields.length) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-semibold">分层构建</h3>
            <p className="text-xs text-muted-foreground">
              基于 Brandon Sanderson 三层模型系统化构建世界观
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleSaveAll}>
          <Save className="size-4" />
          保存全部
        </Button>
      </div>

      {/* Layer Cards */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-4">
          {ALL_LAYERS.map((layer) => {
            const Icon = LAYER_ICONS[layer.id] || Layers;
            const isExpanded = expandedLayer === layer.id;
            const completion = getLayerCompletion(layer);

            return (
              <Card key={layer.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedLayer((prev) =>
                      prev === layer.id ? null : layer.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Icon className="size-4" />
                      {layer.name}
                      <span className="text-xs text-muted-foreground font-normal">
                        {completion}% 完成
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveLayer(layer);
                        }}
                      >
                        <Save className="size-3" />
                        保存
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {layer.description}
                  </CardDescription>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all rounded-full"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    {layer.fields.map((field) => {
                      const isGenerating =
                        generatingField === `${layer.id}-${field.key}`;
                      const value = getFieldValue(layer.id, field.key);

                      return (
                        <div key={field.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">{field.label}</Label>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                handleAIGenerate(layer.id, field)
                              }
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Sparkles className="size-3" />
                              )}
                              AI生成
                            </Button>
                          </div>
                          {field.type === "textarea" ? (
                            <Textarea
                              value={value}
                              onChange={(e) =>
                                setFieldValue(
                                  layer.id,
                                  field.key,
                                  e.target.value
                                )
                              }
                              placeholder={field.placeholder}
                              rows={3}
                            />
                          ) : (
                            <Input
                              value={value}
                              onChange={(e) =>
                                setFieldValue(
                                  layer.id,
                                  field.key,
                                  e.target.value
                                )
                              }
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
