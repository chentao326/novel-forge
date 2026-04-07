"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorToolbar } from "./editor-toolbar";
import { AIWritingPanel } from "./ai-writing-panel";
import { Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RewriteMode } from "@/lib/types";

interface TipTapEditorProps {
  content: string;
  chapterId?: string;
  projectId?: string;
  onUpdate?: (content: string, wordCount: number) => void;
  className?: string;
  zenMode?: boolean;
  onToggleZen?: () => void;
  onExport?: () => void;
  onAIContinue?: () => void;
  onAIRewrite?: () => void;
}

export function TipTapEditor({
  content,
  chapterId,
  projectId,
  onUpdate,
  className,
  zenMode = false,
  onToggleZen,
  onExport,
  onAIContinue,
  onAIRewrite,
}: TipTapEditorProps) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Superscript,
      Subscript,
      Color,
      TextStyle,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none px-8 py-6",
      },
      handleKeyDown: (view, event) => {
        // Ctrl+Shift+C: AI continue writing at cursor
        if (event.ctrlKey && event.shiftKey && event.key === "C") {
          event.preventDefault();
          handleAIContinue();
          return true;
        }
        // Ctrl+Shift+R: AI rewrite selected text
        if (event.ctrlKey && event.shiftKey && event.key === "R") {
          event.preventDefault();
          if (selectedText) {
            setShowAIPanel(true);
          }
          return true;
        }
        // Ctrl+S: manual save
        if ((event.ctrlKey || event.metaKey) && event.key === "s") {
          event.preventDefault();
          const text = view.state.doc.textContent;
          const wc = text.replace(/\s/g, "").length;
          // Get HTML from the editor DOM
          const html = view.dom.innerHTML;
          onUpdate?.(text ? html : "", wc);
          return true;
        }
        // Escape: exit zen mode
        if (event.key === "Escape" && zenMode) {
          event.preventDefault();
          onToggleZen?.();
          return true;
        }
        // Tab at end of document triggers AI continue
        if (event.key === "Tab") {
          const { state } = view;
          const { selection } = state;
          const endOfDoc = state.doc.content.size;

          if (selection.from === endOfDoc && selection.empty) {
            event.preventDefault();
            handleAIContinue();
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      const wordCount = text.replace(/\s/g, "").length;

      // Debounce 2s to parent (IndexedDB save)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        onUpdate?.(ed.getHTML(), wordCount);
      }, 2000);

      // Debounce 10s for server save (could be implemented separately)
      if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
      serverTimerRef.current = setTimeout(() => {
        // In production, this would call an API to save to server
        // saveToServer(ed.getHTML(), chapterId);
      }, 10000);
    },
  });

  // Sync content from outside when chapter changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Track selection for AI rewrite
  useEffect(() => {
    if (!editor) return;

    const updateSelectedText = () => {
      const { from, to, empty } = editor.state.selection;
      if (!empty && from !== to) {
        setSelectedText(editor.state.doc.textBetween(from, to));
      } else {
        setSelectedText("");
      }
    };

    editor.on("selectionUpdate", updateSelectedText);
    return () => {
      editor.off("selectionUpdate", updateSelectedText);
    };
  }, [editor]);

  const handleAIContinue = useCallback(() => {
    setShowAIPanel(true);
  }, []);

  const handleAIRewrite = useCallback(
    (mode: RewriteMode) => {
      setShowAIPanel(true);
    },
    []
  );

  const handleAcceptContinue = useCallback(
    (text: string) => {
      if (editor && text) {
        editor.chain().focus().insertContent(text).run();
        setShowAIPanel(false);
      }
    },
    [editor]
  );

  const handleAcceptRewrite = useCallback(
    (text: string) => {
      if (editor && text && selectedText) {
        const { from, to } = editor.state.selection;
        editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
        setShowAIPanel(false);
      }
    },
    [editor, selectedText]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">加载编辑器...</div>
      </div>
    );
  }

  const characterCount = editor.storage.characterCount;
  const wordCount = characterCount
    ? String(characterCount.characters()).replace(/\s/g, "").length
    : 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        zenMode && "fixed inset-0 z-50 bg-background",
        className
      )}
    >
      {/* Toolbar */}
      {!zenMode && (
        <EditorToolbar
          editor={editor}
          onAIContinue={handleAIContinue}
          onAIRewrite={handleAIRewrite}
          hasSelection={!!selectedText}
          onExport={onExport}
        />
      )}

      {/* Zen mode floating controls */}
      {zenMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleAIContinue}
          >
            <Sparkles className="size-4 text-amber-500" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onToggleZen}>
            <Minimize2 className="size-4" />
          </Button>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
            {/* Floating word count badge */}
            <div className="pointer-events-none absolute bottom-12 right-4 z-10">
              <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                {wordCount.toLocaleString()} 字
              </span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-1.5">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{wordCount} 字</span>
              <span>{characterCount?.characters() ?? 0} 字符</span>
            </div>
            <div className="flex items-center gap-1">
              {/* AI Continue floating button when selection is empty */}
              {!selectedText && !showAIPanel && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleAIContinue}
                  className="text-amber-500"
                >
                  <Sparkles className="size-3.5" />
                  AI续写
                </Button>
              )}
              {/* AI Rewrite floating button when text is selected */}
              {selectedText && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowAIPanel(true)}
                  className="text-amber-500"
                >
                  <Sparkles className="size-3.5" />
                  AI改写
                </Button>
              )}
              {!zenMode && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onToggleZen}
                  title="禅模式"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-80 shrink-0 border-l">
            <AIWritingPanel
              chapterId={chapterId}
              projectId={projectId}
              selectedText={selectedText}
              editorContent={editor.getText()}
              onAcceptContinue={handleAcceptContinue}
              onAcceptRewrite={handleAcceptRewrite}
              onClose={() => setShowAIPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
