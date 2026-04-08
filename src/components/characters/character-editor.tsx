"use client";

import React, { useState, useEffect } from "react";
import { useCharacterStore } from "@/stores/character-store";
import { useProjectStore } from "@/stores/project-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHARACTER_ROLE_LABELS,
  ARC_TYPE_LABELS,
} from "@/lib/types";
import type { Character, CharacterRole, ArcType } from "@/lib/types";
import { generateId } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface CharacterEditorProps {
  character: Character | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLUEPRINT_FIELDS = [
  { key: "core_wound" as const, label: "核心创伤", description: "角色内心最深的伤痛", placeholder: "描述角色最深的内心创伤..." },
  { key: "lie" as const, label: "相信的谎言", description: "角色因为创伤而相信的错误信念", placeholder: "角色因为创伤而相信了什么谎言？" },
  { key: "want" as const, label: "渴望", description: "角色表面上追求的目标", placeholder: "角色表面上想要什么？" },
  { key: "need" as const, label: "需求", description: "角色真正需要的东西", placeholder: "角色真正需要什么？" },
  { key: "fear" as const, label: "恐惧", description: "角色最害怕的事情", placeholder: "角色最害怕什么？" },
  { key: "armor" as const, label: "铠甲", description: "角色用来保护自己的外在表现", placeholder: "角色如何保护自己？" },
];

export function CharacterEditor({ character, open, onOpenChange }: CharacterEditorProps) {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const isNew = !character;

  const [name, setName] = useState(character?.name ?? "");
  const [role, setRole] = useState<CharacterRole>(character?.role ?? "supporting");
  const [appearance, setAppearance] = useState(character?.appearance ?? "");
  const [background, setBackground] = useState(character?.background ?? "");
  const [coreWound, setCoreWound] = useState(character?.core_wound ?? "");
  const [lie, setLie] = useState(character?.lie ?? "");
  const [want, setWant] = useState(character?.want ?? "");
  const [need, setNeed] = useState(character?.need ?? "");
  const [fear, setFear] = useState(character?.fear ?? "");
  const [armor, setArmor] = useState(character?.armor ?? "");
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(character?.personality_traits ?? []);
  const [traitInput, setTraitInput] = useState("");
  const [speechStyle, setSpeechStyle] = useState(character?.speech_style ?? "");
  const [bodyLanguage, setBodyLanguage] = useState(character?.body_language ?? "");
  const [decisionStyle, setDecisionStyle] = useState(character?.decision_style ?? "");
  const [arcType, setArcType] = useState<ArcType>(character?.arc_type ?? "positive");
  const [arcDescription, setArcDescription] = useState(character?.arc_description ?? "");
  const [turningPoints, setTurningPoints] = useState<string[]>(character?.turning_points ?? []);
  const [turningPointInput, setTurningPointInput] = useState("");
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  useEffect(() => {
    if (character) {
      setName(character.name);
      setRole(character.role);
      setAppearance(character.appearance ?? "");
      setBackground(character.background ?? "");
      setCoreWound(character.core_wound ?? "");
      setLie(character.lie ?? "");
      setWant(character.want ?? "");
      setNeed(character.need ?? "");
      setFear(character.fear ?? "");
      setArmor(character.armor ?? "");
      setPersonalityTraits(character.personality_traits);
      setSpeechStyle(character.speech_style ?? "");
      setBodyLanguage(character.body_language ?? "");
      setDecisionStyle(character.decision_style ?? "");
      setArcType(character.arc_type);
      setArcDescription(character.arc_description ?? "");
      setTurningPoints(character.turning_points);
    } else {
      setName(""); setRole("supporting"); setAppearance(""); setBackground("");
      setCoreWound(""); setLie(""); setWant(""); setNeed(""); setFear(""); setArmor("");
      setPersonalityTraits([]); setSpeechStyle(""); setBodyLanguage(""); setDecisionStyle("");
      setArcType("positive"); setArcDescription(""); setTurningPoints([]);
    }
    setTraitInput(""); setTurningPointInput(""); setGeneratingField(null);
  }, [character, open]);

  const handleAddTrait = () => {
    if (traitInput.trim() && !personalityTraits.includes(traitInput.trim())) {
      setPersonalityTraits([...personalityTraits, traitInput.trim()]);
      setTraitInput("");
    }
  };
  const handleRemoveTrait = (i: number) => setPersonalityTraits(personalityTraits.filter((_, idx) => idx !== i));
  const handleAddTurningPoint = () => {
    if (turningPointInput.trim()) {
      setTurningPoints([...turningPoints, turningPointInput.trim()]);
      setTurningPointInput("");
    }
  };
  const handleRemoveTurningPoint = (i: number) => setTurningPoints(turningPoints.filter((_, idx) => idx !== i));

  const handleAIGenerate = async (field: string) => {
    setGeneratingField(field);
    try {
      const response = await fetch("/api/characters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, characterData: { name, role, appearance, background, core_wound: coreWound, lie, want, need, fear, armor, personality_traits: personalityTraits }, projectId: currentProjectId }),
      });
      if (!response.ok || !response.body) throw new Error("生成失败");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; result += decoder.decode(value, { stream: true }); }
      const setters: Record<string, (v: string) => void> = {
        core_wound: setCoreWound, lie: setLie, want: setWant, need: setNeed, fear: setFear, armor: setArmor,
        personality_traits: (v) => setPersonalityTraits(v.split(/[,，、\n]/).map((t) => t.trim()).filter(Boolean)),
        speech_style: setSpeechStyle, body_language: setBodyLanguage, decision_style: setDecisionStyle,
        arc_description: setArcDescription, turning_points: (v) => setTurningPoints(v.split(/[\n]/).map((t) => t.replace(/^\d+[\.\)、]\s*/, "").trim()).filter(Boolean)),
        appearance: setAppearance, background: setBackground,
      };
      if (setters[field]) setters[field](result);
    } catch (error) { console.error("AI generate error:", error); }
    finally { setGeneratingField(null); }
  };

  const handleSave = () => {
    if (!name.trim() || !currentProjectId) return;
    const now = new Date().toISOString();
    if (isNew) {
      addCharacter({
        id: generateId(), project_id: currentProjectId, name: name.trim(), role, appearance, background,
        core_wound: coreWound, lie, want, need, fear, armor, personality_traits: personalityTraits,
        speech_style: speechStyle, body_language: bodyLanguage, decision_style: decisionStyle,
        arc_type: arcType, arc_description: arcDescription, turning_points: turningPoints,
        created_at: now, updated_at: now,
      });
    } else if (character) {
      updateCharacter(character.id, {
        name: name.trim(), role, appearance, background, core_wound: coreWound, lie, want, need, fear, armor,
        personality_traits: personalityTraits, speech_style: speechStyle, body_language: bodyLanguage,
        decision_style: decisionStyle, arc_type: arcType, arc_description: arcDescription, turning_points: turningPoints,
      });
    }
    onOpenChange(false);
  };

  const blueprintValues = [coreWound, lie, want, need, fear, armor];
  const blueprintSetters = [setCoreWound, setLie, setWant, setNeed, setFear, setArmor];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden max-md:max-w-[calc(100vw-2rem)] max-md:rounded-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "新建角色" : `编辑角色 - ${character?.name}`}</DialogTitle>
          <DialogDescription>填写角色的详细信息，可使用AI辅助生成</DialogDescription>
        </DialogHeader>
        <Tabs className="flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="basic">基础信息</TabsTrigger>
            <TabsTrigger value="blueprint">核心创伤蓝图</TabsTrigger>
            <TabsTrigger value="personality">性格与声音</TabsTrigger>
            <TabsTrigger value="arc">成长弧线</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="flex-1 overflow-y-auto">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4 p-1">
                <div className="space-y-2"><Label>角色名称 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入角色名称" /></div>
                <div className="space-y-2"><Label>角色定位</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as CharacterRole)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>
                    {Object.entries(CHARACTER_ROLE_LABELS).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>外貌描述</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("appearance")} disabled={!!generatingField}>{generatingField === "appearance" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={appearance} onChange={(e) => setAppearance(e.target.value)} placeholder="描述角色的外貌特征..." rows={3} /></div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>背景故事</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("background")} disabled={!!generatingField}>{generatingField === "background" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="描述角色的背景故事..." rows={4} /></div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="blueprint" className="flex-1 overflow-y-auto">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-1 p-1">
                <p className="mb-3 text-xs text-muted-foreground">核心创伤蓝图描述了角色内心世界的核心结构。</p>
                {BLUEPRINT_FIELDS.map((field, index) => (
                  <React.Fragment key={field.key}>
                    <div className="space-y-1.5 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">{index + 1}</span><Label className="text-sm">{field.label}</Label></div>
                        <Button variant="ghost" size="xs" onClick={() => handleAIGenerate(field.key)} disabled={!!generatingField}>{generatingField === field.key ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{field.description}</p>
                      <Textarea value={blueprintValues[index]} onChange={(e) => blueprintSetters[index](e.target.value)} placeholder={field.placeholder} rows={2} className="text-sm" />
                    </div>
                    {index < BLUEPRINT_FIELDS.length - 1 && <div className="flex justify-center py-0.5"><ArrowRight className="size-4 text-muted-foreground/40" /></div>}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="personality" className="flex-1 overflow-y-auto">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4 p-1">
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>性格特征</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("personality_traits")} disabled={!!generatingField}>{generatingField === "personality_traits" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div>
                  <div className="flex flex-wrap gap-1">{personalityTraits.map((trait, i) => (<Badge key={i} variant="secondary" className="gap-1">{trait}<button onClick={() => handleRemoveTrait(i)} className="ml-0.5 hover:text-destructive"><X className="size-3" /></button></Badge>))}</div>
                  <div className="flex gap-2"><Input value={traitInput} onChange={(e) => setTraitInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTrait(); } }} placeholder="输入特征后回车添加" className="flex-1" /><Button size="sm" onClick={handleAddTrait}><Plus className="size-4" /></Button></div>
                </div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>说话风格</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("speech_style")} disabled={!!generatingField}>{generatingField === "speech_style" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={speechStyle} onChange={(e) => setSpeechStyle(e.target.value)} placeholder="描述角色的说话方式..." rows={3} /></div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>肢体语言</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("body_language")} disabled={!!generatingField}>{generatingField === "body_language" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={bodyLanguage} onChange={(e) => setBodyLanguage(e.target.value)} placeholder="描述角色的肢体语言习惯..." rows={3} /></div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>决策方式</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("decision_style")} disabled={!!generatingField}>{generatingField === "decision_style" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={decisionStyle} onChange={(e) => setDecisionStyle(e.target.value)} placeholder="描述角色做决定的方式..." rows={3} /></div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="arc" className="flex-1 overflow-y-auto">
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4 p-1">
                <div className="space-y-2"><Label>弧线类型</Label>
                  <Select value={arcType} onValueChange={(v) => setArcType(v as ArcType)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>
                    {Object.entries(ARC_TYPE_LABELS).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}
                  </SelectContent></Select>
                </div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>弧线描述</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("arc_description")} disabled={!!generatingField}>{generatingField === "arc_description" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div><Textarea value={arcDescription} onChange={(e) => setArcDescription(e.target.value)} placeholder="描述角色的成长弧线..." rows={4} /></div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label>关键转折点</Label><Button variant="ghost" size="xs" onClick={() => handleAIGenerate("turning_points")} disabled={!!generatingField}>{generatingField === "turning_points" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}AI生成</Button></div>
                  <div className="space-y-1">{turningPoints.map((point, i) => (<div key={i} className="flex items-center gap-2 rounded-md border px-2 py-1.5"><span className="size-5 shrink-0 rounded-full bg-muted text-center text-[10px] leading-5">{i + 1}</span><span className="flex-1 text-sm">{point}</span><Button variant="ghost" size="icon-xs" onClick={() => handleRemoveTurningPoint(i)}><X className="size-3" /></Button></div>))}</div>
                  <div className="flex gap-2"><Input value={turningPointInput} onChange={(e) => setTurningPointInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTurningPoint(); } }} placeholder="输入转折点后回车添加" className="flex-1" /><Button size="sm" onClick={handleAddTurningPoint}><Plus className="size-4" /></Button></div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
