"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWorldStore } from "@/stores/world-store";
import { useProjectStore } from "@/stores/project-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WORLD_CATEGORY_LABELS } from "@/lib/types";
import type { WorldSetting, WorldCategory } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { Sparkles, Plus, X, Loader2, ShieldCheck } from "lucide-react";

interface SettingEditorProps {
  setting: WorldSetting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingEditor({ setting, open, onOpenChange }: SettingEditorProps) {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addSetting = useWorldStore((s) => s.addSetting);
  const updateSetting = useWorldStore((s) => s.updateSetting);
  const allSettingsData = useWorldStore((s) => s.settings);
  const allSettings = useMemo(() =>
    currentProjectId ? allSettingsData.filter((s) => s.project_id === currentProjectId) : [],
    [allSettingsData, currentProjectId]
  );
  const isNew = !setting;

  const [name, setName] = useState(setting?.name ?? "");
  const [category, setCategory] = useState<WorldCategory>(setting?.category ?? "geography");
  const [parentId, setParentId] = useState<string | null>(setting?.parent_id ?? null);
  const [content, setContent] = useState(setting?.content ?? "");
  const [rules, setRules] = useState<string[]>(setting?.rules ?? []);
  const [ruleInput, setRuleInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState("");

  useEffect(() => {
    if (setting) {
      setName(setting.name); setCategory(setting.category); setParentId(setting.parent_id);
      setContent(setting.content ?? ""); setRules(setting.rules);
    } else {
      setName(""); setCategory("geography"); setParentId(null); setContent(""); setRules([]);
    }
    setRuleInput(""); setIsGenerating(false); setIsChecking(false); setConsistencyResult("");
  }, [setting, open]);

  const handleAddRule = () => { if (ruleInput.trim()) { setRules([...rules, ruleInput.trim()]); setRuleInput(""); } };
  const handleRemoveRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

  const handleAIGenerate = async () => {
    if (!name.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/worldbuilding/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: WORLD_CATEGORY_LABELS[category], name, projectId: currentProjectId }),
      });
      if (!response.ok || !response.body) throw new Error("生成失败");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; result += decoder.decode(value, { stream: true }); }
      setContent(result);
    } catch (error) { console.error("AI generate error:", error); }
    finally { setIsGenerating(false); }
  };

  const handleConsistencyCheck = async () => {
    if (!content.trim()) return;
    setIsChecking(true); setConsistencyResult("");
    try {
      const response = await fetch("/api/worldbuilding/check-consistency", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingId: name, content, projectId: currentProjectId }),
      });
      if (!response.ok || !response.body) throw new Error("检查失败");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; result += decoder.decode(value, { stream: true }); }
      setConsistencyResult(result);
    } catch (error) { console.error("Consistency check error:", error); setConsistencyResult("检查失败，请重试。"); }
    finally { setIsChecking(false); }
  };

  const handleSave = () => {
    if (!name.trim() || !currentProjectId) return;
    const now = new Date().toISOString();
    if (isNew) {
      addSetting({ id: generateId(), project_id: currentProjectId, name: name.trim(), category, parent_id: parentId, content, rules, created_at: now, updated_at: now });
    } else if (setting) {
      updateSetting(setting.id, { name: name.trim(), category, parent_id: parentId, content, rules });
    }
    onOpenChange(false);
  };

  const parentOptions = allSettings.filter((s) => s.id !== setting?.id && s.category === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isNew ? "新建设定" : `编辑设定 - ${setting?.name}`}</DialogTitle>
          <DialogDescription>创建或编辑世界观设定，可使用AI辅助生成</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            <div className="space-y-2"><Label>设定名称 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入设定名称" /></div>
            <div className="space-y-2"><Label>类别</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v as WorldCategory); setParentId(null); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>
                  {Object.entries(WORLD_CATEGORY_LABELS).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}
                </SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>父设定（可选）</Label>
              <Select value={parentId ?? "__none__"} onValueChange={(v) => setParentId(v === "__none__" ? null : v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="无" /></SelectTrigger><SelectContent>
                  <SelectItem value="__none__">无</SelectItem>
                  {parentOptions.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent></Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>内容</Label>
                <Button variant="ghost" size="xs" onClick={handleAIGenerate} disabled={isGenerating || !name.trim()}>
                  {isGenerating ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成
                </Button>
              </div>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="描述这个世界观设定的详细内容..." rows={8} />
            </div>
            <div className="space-y-2"><Label>规则列表</Label>
              <div className="space-y-1">{rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                  <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" /><span className="flex-1 text-sm">{rule}</span>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleRemoveRule(i)}><X className="size-3" /></Button>
                </div>))}</div>
              <div className="flex gap-2"><Input value={ruleInput} onChange={(e) => setRuleInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRule(); } }} placeholder="输入规则后回车添加" className="flex-1" /><Button size="sm" onClick={handleAddRule}><Plus className="size-4" /></Button></div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>一致性检查</Label>
                <Button variant="outline" size="xs" onClick={handleConsistencyCheck} disabled={isChecking || !content.trim()}>
                  {isChecking ? <Loader2 className="size-3 animate-spin" /> : <ShieldCheck className="size-3" />}检查一致性
                </Button>
              </div>
              {consistencyResult && <div className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap">{consistencyResult}</div>}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
