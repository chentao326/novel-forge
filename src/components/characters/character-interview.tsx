"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useCharacterStore } from "@/stores/character-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Save, Sparkles, MessageCircle, Loader2, User } from "lucide-react";
import type { Character } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface InterviewMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "你最害怕什么？",
  "你最大的秘密是什么？",
  "如果可以改变一件事你会改变什么？",
  "你如何看待你的过去？",
  "你内心深处真正想要的是什么？",
  "你觉得自己最大的弱点是什么？",
];

export function CharacterInterview() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId);
  const allCharacters = useCharacterStore((s) => s.characters);
  const characters = useMemo(() =>
    currentProjectId
      ? allCharacters.filter((c) => c.project_id === currentProjectId)
      : [],
    [allCharacters, currentProjectId]
  );
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [savedInsights, setSavedInsights] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setMessages([]);
    setSavedInsights("");
  };

  const buildCharacterPrompt = useCallback(
    (character: Character): string => {
      return `你现在正在扮演小说中的角色"${character.name}"。请以该角色的身份、语气和性格来回答问题。

角色信息：
- 名字：${character.name}
- 角色定位：${character.role}
- 外貌：${character.appearance || "未设定"}
- 背景故事：${character.background || "未设定"}
- 核心创伤：${character.core_wound || "未设定"}
- 相信的谎言：${character.lie || "未设定"}
- 渴望：${character.want || "未设定"}
- 需求：${character.need || "未设定"}
- 恐惧：${character.fear || "未设定"}
- 铠甲：${character.armor || "未设定"}
- 性格特征：${character.personality_traits.join("、") || "未设定"}
- 说话风格：${character.speech_style || "未设定"}
- 肢体语言：${character.body_language || "未设定"}
- 决策方式：${character.decision_style || "未设定"}

重要规则：
1. 始终以角色的第一人称视角回答
2. 使用角色的说话风格和语气
3. 回答要体现角色的性格、经历和内心世界
4. 可以适当展现角色的矛盾和复杂性
5. 不要脱离角色身份，不要说"我是一个AI"之类的话
6. 回答要生动、有情感，像真实的人在交谈`;
    },
    []
  );

  const handleSend = useCallback(
    async (question: string) => {
      if (!question.trim() || !selectedCharacter || isStreaming) return;

      const userMessage: InterviewMessage = {
        id: generateId(),
        role: "user",
        content: question.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsStreaming(true);

      const assistantMessage: InterviewMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortRef.current = new AbortController();

        const systemPrompt = buildCharacterPrompt(selectedCharacter);
        const conversationHistory = [...messages, userMessage]
          .map((m) => `${m.role === "user" ? "采访者" : selectedCharacter.name}：${m.content}`)
          .join("\n");

        const response = await fetch("/api/characters/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId: selectedCharacter.id,
            question: conversationHistory,
            projectId: currentProjectId,
            systemPrompt,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) throw new Error("请求失败");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: accumulated } : m
            )
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Interview error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "抱歉，我无法回答这个问题..." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [selectedCharacter, isStreaming, messages, currentProjectId, buildCharacterPrompt]
  );

  const handleSuggestedQuestion = (question: string) => {
    // Replace [其他角色名] with actual character names if available
    let q = question;
    if (q.includes("[其他角色名]")) {
      const otherChars = characters.filter((c) => c.id !== selectedCharacterId);
      if (otherChars.length > 0) {
        q = q.replace("[其他角色名]", otherChars[0].name);
      } else {
        q = q.replace("[其他角色名]", "其他人");
      }
    }
    handleSend(q);
  };

  const handleSaveInsights = () => {
    if (!selectedCharacter) return;
    const insights = messages
      .filter((m) => m.role === "assistant" && m.content)
      .map((m) => m.content)
      .join("\n\n---\n\n");

    if (!insights) return;

    const existingNotes = selectedCharacter.background || "";
    const newNotes = existingNotes
      ? `${existingNotes}\n\n【角色访谈记录】\n${insights}`
      : `【角色访谈记录】\n${insights}`;

    updateCharacter(selectedCharacter.id, { background: newNotes });
    setSavedInsights("已保存到角色档案");
    setTimeout(() => setSavedInsights(""), 3000);
  };

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageCircle className="mb-3 size-12 text-muted-foreground/30" />
        <h3 className="mb-1 text-lg font-medium">还没有角色</h3>
        <p className="text-sm text-muted-foreground">请先创建角色，然后才能进行角色访谈</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Character selector */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Select value={selectedCharacterId} onValueChange={(v) => v && handleCharacterSelect(v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择要访谈的角色..." />
            </SelectTrigger>
            <SelectContent>
              {characters.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCharacter && messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveInsights}
            disabled={isStreaming}
          >
            <Save className="size-4" />
            保存到档案
          </Button>
        )}
      </div>

      {savedInsights && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          {savedInsights}
        </div>
      )}

      {!selectedCharacter ? (
        <div className="flex flex-1 items-center justify-center text-center">
          <div>
            <Sparkles className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">选择一个角色开始访谈</p>
            <p className="mt-1 text-xs text-muted-foreground">
              你可以向角色提问，AI将以角色的身份和语气回答
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-lg border bg-muted/20 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <User className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium">{selectedCharacter.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  向 {selectedCharacter.name} 提问，了解他们的内心世界
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {selectedCharacter.name.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="size-3 animate-spin" />
                          正在思考...
                        </span>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        你
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {selectedCharacter.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested questions */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">推荐问题</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSuggestedQuestion(q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder={`向 ${selectedCharacter.name} 提问... (Shift+Enter 换行)`}
              rows={2}
              className="flex-1 resize-none"
              disabled={isStreaming}
            />
            <Button
              size="icon"
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isStreaming}
              className="self-end"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
