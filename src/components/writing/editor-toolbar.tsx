"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Link2,
  ImageIcon,
  Sparkles,
  Wand2,
  Type,
  Paintbrush,
  MessageSquare,
  Subscript,
  Superscript,
  Highlighter,
  Undo,
  Redo,
  Download,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  onAIContinue?: () => void;
  onAIRewrite?: (mode: "expand" | "condense" | "describe" | "tone") => void;
  hasSelection?: boolean;
  onExport?: () => void;
}

function ToolbarButton({
  tooltip,
  children,
  onClick,
  isActive = false,
  disabled = false,
}: {
  tooltip: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" onClick={onClick} disabled={disabled} data-active={isActive ? "true" : undefined} className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground" />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="mx-1 h-5" />;
}

export function EditorToolbar({
  editor,
  onAIContinue,
  onAIRewrite,
  hasSelection,
  onExport,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <TooltipProvider delay={300}>
      <div className="flex items-center gap-0.5 overflow-x-auto border-b bg-background px-2 py-1">
        {/* Undo / Redo */}
        <ToolbarButton
          tooltip="撤销 (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="重做 (Ctrl+Shift+Z)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Formatting */}
        <ToolbarButton
          tooltip="加粗 (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="斜体 (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="下划线 (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="删除线"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="行内代码"
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="高亮"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
        >
          <Highlighter className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          tooltip="标题1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="标题2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="标题3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          tooltip="无序列表"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="有序列表"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="任务列表"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
        >
          <ListChecks className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton
          tooltip="左对齐"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="居中"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="右对齐"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="两端对齐"
          onClick={() =>
            editor.chain().focus().setTextAlign("justify").run()
          }
          isActive={editor.isActive({ textAlign: "justify" })}
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Superscript / Subscript */}
        <ToolbarButton
          tooltip="上标"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive("superscript")}
        >
          <Superscript className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="下标"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive("subscript")}
        >
          <Subscript className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Insert */}
        <ToolbarButton
          tooltip="分隔线"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="插入链接"
          onClick={() => {
            const url = window.prompt("请输入链接地址：");
            if (url) {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
            }
          }}
          isActive={editor.isActive("link")}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          tooltip="插入图片"
          onClick={() => {
            const url = window.prompt("请输入图片地址：");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* AI Group */}
        <ToolbarButton
          tooltip="AI续写"
          onClick={onAIContinue}
        >
          <Sparkles className="size-4 text-amber-500" />
        </ToolbarButton>

        {hasSelection && onAIRewrite && (
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <Wand2 className="size-4 text-amber-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onAIRewrite("expand")}>
                      <Type className="size-4" />
                      扩写
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAIRewrite("condense")}>
                      <Type className="size-4" />
                      精简
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAIRewrite("describe")}>
                      <Paintbrush className="size-4" />
                      加强描写
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAIRewrite("tone")}>
                      <MessageSquare className="size-4" />
                      调整语气
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
            <TooltipContent side="bottom">AI改写</TooltipContent>
          </Tooltip>
        )}

        <ToolbarSeparator />

        {/* Export */}
        <ToolbarButton
          tooltip="导出 (Ctrl+E)"
          onClick={onExport}
        >
          <Download className="size-4" />
        </ToolbarButton>
      </div>
    </TooltipProvider>
  );
}
