"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Wand2,
  MessageSquare,
  Send,
  Check,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { RewriteMode, ChatMessage } from "@/lib/types";
import { REWRITE_MODE_LABELS } from "@/lib/types";

interface AIWritingPanelProps {
  chapterId?: string;
  projectId?: string;
  selectedText?: string;
  editorContent?: string;
  onAcceptContinue?: (text: string) => void;
  onAcceptRewrite?: (text: string) => void;
  onClose?: () => void;
}

const REWRITE_MODES: { value: RewriteMode; label: string }[] = [
  { value: "expand", label: "扩写" },
  { value: "condense", label: "精简" },
  { value: "describe", label: "加强描写" },
  { value: "tone", label: "调整语气" },
];

export function AIWritingPanel({
  chapterId,
  projectId,
  selectedText,
  editorContent,
  onAcceptContinue,
  onAcceptRewrite,
  onClose,
}: AIWritingPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("continue");
  const [continueText, setContinueText] = useState("");
  const [isContinueLoading, setIsContinueLoading] = useState(false);

  const [rewriteMode, setRewriteMode] = useState<RewriteMode>("expand");
  const [rewriteText, setRewriteText] = useState("");
  const [isRewriteLoading, setIsRewriteLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ---- Continue ----
  const handleContinue = useCallback(async () => {
    if (!editorContent) return;
    setIsContinueLoading(true);
    setContinueText("");

    try {
      const response = await fetch("/api/writing/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          content: editorContent,
        }),
      });

      if (!response.ok) throw new Error("续写失败");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setContinueText(accumulated);
      }
    } catch (error) {
      console.error("Continue error:", error);
      setContinueText("续写失败，请重试。");
    } finally {
      setIsContinueLoading(false);
    }
  }, [chapterId, editorContent]);

  // ---- Rewrite ----
  const handleRewrite = useCallback(async () => {
    if (!selectedText) return;
    setIsRewriteLoading(true);
    setRewriteText("");

    try {
      const response = await fetch("/api/writing/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          mode: rewriteMode,
          context: { chapterId },
        }),
      });

      if (!response.ok) throw new Error("改写失败");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setRewriteText(accumulated);
      }
    } catch (error) {
      console.error("Rewrite error:", error);
      setRewriteText("改写失败，请重试。");
    } finally {
      setIsRewriteLoading(false);
    }
  }, [selectedText, rewriteMode, chapterId]);

  // ---- Chat ----
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const allMessages = [...chatMessages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/writing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          chapterId,
          projectId,
        }),
      });

      if (!response.ok) throw new Error("对话失败");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        // Update or create assistant message
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && !last.timestamp) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: assistantContent },
            ];
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: assistantContent,
              timestamp: "",
            },
          ];
        });
      }

      // Finalize assistant message
      setChatMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...last, timestamp: new Date().toISOString() },
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "抱歉，对话出现错误，请重试。",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, chatMessages, chapterId, projectId]);

  return (
    <div className="flex h-full flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-sm font-medium">AI 写作助手</h3>
        {onClose && (
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-2 mt-1">
          <TabsTrigger value="continue">
            <Sparkles className="size-3.5" />
            续写
          </TabsTrigger>
          <TabsTrigger value="rewrite">
            <Wand2 className="size-3.5" />
            改写
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="size-3.5" />
            对话
          </TabsTrigger>
        </TabsList>

        {/* Continue Tab */}
        <TabsContent value="continue" className="flex flex-1 flex-col overflow-hidden p-3">
          {!continueText && !isContinueLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Sparkles className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                点击下方按钮，AI 将根据当前内容续写
              </p>
              <Button onClick={handleContinue} size="sm">
                <Sparkles className="size-4" />
                开始续写
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-1 text-sm leading-relaxed">
                  {continueText}
                  {isContinueLoading && (
                    <span className="inline-block animate-pulse">|</span>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 border-t pt-2">
                <Button
                  size="sm"
                  onClick={() => onAcceptContinue?.(continueText)}
                  disabled={isContinueLoading || !continueText}
                >
                  <Check className="size-4" />
                  接受
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContinue}
                  disabled={isContinueLoading}
                >
                  <RotateCcw className="size-4" />
                  重新生成
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setContinueText("")}
                  disabled={isContinueLoading}
                >
                  <X className="size-4" />
                  取消
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Rewrite Tab */}
        <TabsContent value="rewrite" className="flex flex-1 flex-col overflow-hidden p-3">
          {!selectedText ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Wand2 className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                请在编辑器中选中需要改写的文本
              </p>
            </div>
          ) : (
            <>
              {/* Original text */}
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  原文：
                </p>
                <div className="rounded-md bg-muted/50 p-2 text-xs line-clamp-3">
                  {selectedText}
                </div>
              </div>

              {/* Mode selector */}
              <div className="mb-2 flex flex-wrap gap-1">
                {REWRITE_MODES.map((mode) => (
                  <Badge
                    key={mode.value}
                    variant={rewriteMode === mode.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setRewriteMode(mode.value)}
                  >
                    {mode.label}
                  </Badge>
                ))}
              </div>

              {!rewriteText && !isRewriteLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Button onClick={handleRewrite} size="sm">
                    <Wand2 className="size-4" />
                    开始改写
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap p-1 text-sm leading-relaxed">
                      {rewriteText}
                      {isRewriteLoading && (
                        <span className="inline-block animate-pulse">|</span>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 border-t pt-2">
                    <Button
                      size="sm"
                      onClick={() => onAcceptRewrite?.(rewriteText)}
                      disabled={isRewriteLoading || !rewriteText}
                    >
                      <Check className="size-4" />
                      接受
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRewrite}
                      disabled={isRewriteLoading}
                    >
                      <RotateCcw className="size-4" />
                      重新生成
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRewriteText("")}
                      disabled={isRewriteLoading}
                    >
                      <X className="size-4" />
                      取消
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex flex-1 flex-col overflow-hidden p-3">
          <ScrollArea className="flex-1">
            <div className="space-y-3 p-1">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="mb-2 size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    与AI讨论你的故事，获取创作建议
                  </p>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2 border-t pt-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSend();
                }
              }}
              placeholder="输入你的问题..."
              className="min-h-[60px] flex-1 resize-none text-sm"
            />
            <Button
              size="icon"
              onClick={handleChatSend}
              disabled={!chatInput.trim() || isChatLoading}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
