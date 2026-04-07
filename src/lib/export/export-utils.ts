// ============================================================
// Novel Forge - Export Utilities
// ============================================================

import type { Chapter } from "@/lib/types";

/**
 * Strip HTML tags and convert to plain text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/blockquote>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Convert HTML to Markdown (basic formatting)
 */
function htmlToMarkdown(html: string): string {
  let md = html;

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");

  // Bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?[uo]l[^>]*>/gi, "\n");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  // Task lists
  md = md.replace(/<li[^>]*data-type="taskItem"[^>]*data-checked="true"[^>]*>(.*?)<\/li>/gi, "- [x] $1\n");
  md = md.replace(/<li[^>]*data-type="taskItem"[^>]*>(.*?)<\/li>/gi, "- [ ] $1\n");

  // Remove remaining tags
  md = md.replace(/<[^>]+>/g, "");

  // Clean up entities
  md = md.replace(/&nbsp;/g, " ");
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

/**
 * Export chapters to plain text
 */
export async function exportToTxt(
  chapters: Chapter[],
  options?: { includeTitles?: boolean }
): Promise<Blob> {
  const includeTitles = options?.includeTitles ?? true;
  const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

  const lines: string[] = [];
  for (const chapter of sorted) {
    if (includeTitles) {
      lines.push(chapter.title);
      lines.push("".padStart(chapter.title.length, "="));
      lines.push("");
    }
    lines.push(stripHtml(chapter.content));
    lines.push("");
  }

  const text = lines.join("\n");
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}

/**
 * Export chapters to Markdown
 */
export async function exportToMarkdown(
  chapters: Chapter[],
  options?: { includeTitles?: boolean }
): Promise<Blob> {
  const includeTitles = options?.includeTitles ?? true;
  const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

  const lines: string[] = [];
  for (const chapter of sorted) {
    if (includeTitles) {
      lines.push(`# ${chapter.title}`);
      lines.push("");
    }
    lines.push(htmlToMarkdown(chapter.content));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const text = lines.join("\n");
  return new Blob([text], { type: "text/markdown;charset=utf-8" });
}

/**
 * Export chapters to HTML document
 */
export async function exportToHtml(
  chapters: Chapter[],
  title: string,
  options?: { includeTitles?: boolean; authorName?: string }
): Promise<Blob> {
  const includeTitles = options?.includeTitles ?? true;
  const authorName = options?.authorName ?? "";
  const sorted = [...chapters].sort((a, b) => a.sort_order - b.sort_order);

  const chaptersHtml = sorted
    .map((chapter) => {
      const titleHtml = includeTitles
        ? `    <h2>${escapeHtml(chapter.title)}</h2>\n`
        : "";
      return `  <div class="chapter">\n${titleHtml}    ${chapter.content}\n  </div>`;
    })
    .join("\n\n");

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: "Noto Serif SC", "Source Han Serif CN", "Songti SC", Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.8;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: 2em;
      margin-bottom: 0.5em;
    }
    .author {
      text-align: center;
      color: #666;
      margin-bottom: 2em;
    }
    .chapter {
      margin-bottom: 3em;
    }
    .chapter h2 {
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5em;
      margin-bottom: 1em;
    }
    p {
      text-indent: 2em;
      margin: 0.5em 0;
    }
    blockquote {
      border-left: 3px solid #ddd;
      margin-left: 0;
      padding-left: 1em;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${authorName ? `<div class="author">${escapeHtml(authorName)}</div>` : ""}
${chaptersHtml}
</body>
</html>`;

  return new Blob([html], { type: "text/html;charset=utf-8" });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Export chapters to EPUB format via server API
 * (EPUB generation requires Node.js 'fs' module, so it runs server-side)
 */
export async function exportToEpubViaApi(
  chapters: Chapter[],
  title: string,
  options?: { includeTitles?: boolean; authorName?: string }
): Promise<Blob> {
  const response = await fetch("/api/export/epub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapters, title, options }),
  });
  if (!response.ok) throw new Error("EPUB 导出失败");
  const buffer = await response.arrayBuffer();
  return new Blob([buffer], { type: "application/epub+zip" });
}
