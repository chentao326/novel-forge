import { NextRequest, NextResponse } from "next/server";
import EPub from "epub-gen-memory";
import type { Chapter } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { chapters, title, options = {} } = await request.json();

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ error: "没有可导出的章节" }, { status: 400 });
    }

    const includeTitles = options.includeTitles ?? true;
    const authorName = options.authorName ?? "";
    const sorted = [...chapters].sort((a: Chapter, b: Chapter) => a.sort_order - b.sort_order);

    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const content = sorted.map((chapter: Chapter) => {
      const titleHtml = includeTitles
        ? `<h2 style="text-align:center;font-size:1.4em;margin-bottom:1em;border-bottom:1px solid #ccc;padding-bottom:0.3em;">${escapeHtml(chapter.title)}</h2>`
        : "";
      return {
        title: chapter.title,
        content: `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"/></head><body>${titleHtml}${chapter.content}</body></html>`,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const epub = new (EPub as any)(
      {
        title: title || "未命名作品",
        author: authorName || "未知作者",
        css: "body { font-family: 'Noto Serif SC', 'Source Han Serif CN', Georgia, serif; line-height: 1.8; margin: 1em; } p { text-indent: 2em; margin: 0.5em 0; } blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 1em; color: #555; }",
      },
      content
    );

    const buffer = await epub.genEpub();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title || "未命名作品")}.epub"`,
      },
    });
  } catch (error) {
    console.error("EPUB export error:", error);
    return NextResponse.json({ error: "EPUB 导出失败" }, { status: 500 });
  }
}
