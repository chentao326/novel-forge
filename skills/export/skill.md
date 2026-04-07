# 多格式导出 (Export)

> 小说内容多格式导出技能

## 功能描述

将小说章节内容导出为多种常见格式，满足不同发布平台和阅读场景的需求。支持 TXT、Markdown、HTML、EPUB 四种格式，其中前三种为纯客户端生成，EPUB 通过服务端 API 生成。

## 支持格式

### 1. TXT (纯文本)

- **MIME 类型**：`text/plain;charset=utf-8`
- **转换方式**：`stripHtml()` 去除所有 HTML 标签
- **章节分隔**：章节标题行 + 等号分隔线 + 空行
- **特点**：最通用的格式，兼容所有设备和平台

**转换逻辑**（`src/lib/export/export-utils.ts` -> `stripHtml`）：
```
HTML -> 替换 <br> 为换行 -> 替换 </p></h> 为双换行 -> 移除所有标签 -> 解码 HTML 实体 -> 清理多余空行
```

### 2. Markdown

- **MIME 类型**：`text/markdown;charset=utf-8`
- **转换方式**：`htmlToMarkdown()` 保留格式化信息
- **保留格式**：
  - 标题：`<h1>` -> `#`, `<h2>` -> `##`, `<h3>` -> `###`
  - 粗体：`<strong>` / `<b>` -> `**text**`
  - 斜体：`<em>` / `<i>` -> `*text*`
  - 列表：`<li>` -> `- item`
  - 引用：`<blockquote>` -> `> text`
  - 链接：`<a href="url">text</a>` -> `[text](url)`
  - 分割线：`<hr>` -> `---`
  - 任务列表：`<li data-type="taskItem" data-checked="true">` -> `- [x] item`
- **章节分隔**：`# 章节标题` + `---` 分割线

### 3. HTML (完整文档)

- **MIME 类型**：`text/html;charset=utf-8`
- **输出**：完整的 HTML5 文档
- **中文排版样式**：
  - 衬线字体：`"Noto Serif SC", "Source Han Serif CN", "Songti SC", Georgia, serif`
  - 行高：`1.8`
  - 首行缩进：`2em`
  - 最大宽度：`800px`，居中显示
  - 章节间距：`3em`
  - 引用块样式：左侧 3px 灰色边框

**HTML 模板结构**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>书名</title>
  <style>/* 中文排版样式 */</style>
</head>
<body>
  <h1>书名</h1>
  <div class="author">作者名</div>
  <div class="chapter">
    <h2>章节标题</h2>
    章节内容...
  </div>
</body>
</html>
```

### 4. EPUB (电子书)

- **MIME 类型**：`application/epub+zip`
- **生成方式**：服务端 API 生成（需要 Node.js `fs` 模块）
- **生成库**：`epub-gen-memory`
- **支持内容**：书名、作者、章节标题、正文内容、衬线字体 CSS
- **调用方式**：前端通过 `fetch` 调用 `/api/export/epub`，接收二进制数据

## 通用选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `includeTitles` | `boolean` | `true` | 是否在导出内容中包含章节标题 |
| `authorName` | `string` | `""` | 作者署名（HTML 和 EPUB 格式使用） |

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/export/epub` | EPUB 格式导出（服务端生成） |

**请求体**：
```json
{
  "chapters": [{ "title": "第一章", "content": "<p>...</p>", "sort_order": 1 }],
  "title": "小说标题",
  "options": {
    "includeTitles": true,
    "authorName": "作者名"
  }
}
```

**响应**：二进制流 (`application/epub+zip`)

> 注意：TXT、Markdown、HTML 三种格式为纯前端生成，不需要调用服务端 API。

## 前端组件

| 组件文件 | 功能 |
|----------|------|
| `src/components/writing/export-dialog.tsx` | 导出对话框（ExportDialog） |

**对话框功能**：
- 格式选择（TXT / Markdown / HTML / EPUB）
- 作者署名输入
- 是否包含章节标题开关
- 预览导出设置
- 一键导出并下载

## 工具函数

所有导出函数位于 `src/lib/export/export-utils.ts`：

| 函数 | 签名 | 说明 |
|------|------|------|
| `exportToTxt` | `(chapters, options?) => Promise<Blob>` | 导出为 TXT |
| `exportToMarkdown` | `(chapters, options?) => Promise<Blob>` | 导出为 Markdown |
| `exportToHtml` | `(chapters, title, options?) => Promise<Blob>` | 导出为 HTML |
| `exportToEpubViaApi` | `(chapters, title, options?) => Promise<Blob>` | 通过 API 导出为 EPUB |

**内部辅助函数**：

| 函数 | 说明 |
|------|------|
| `stripHtml(html)` | 去除 HTML 标签，转换为纯文本 |
| `htmlToMarkdown(html)` | 将 HTML 转换为 Markdown 格式 |
| `escapeHtml(text)` | HTML 特殊字符转义 |

## 依赖技能

无外部技能依赖。导出功能为独立模块，仅依赖章节数据（`Chapter` 类型）。

## 使用示例

### 导出为 TXT

```typescript
import { exportToTxt } from "@/lib/export/export-utils";

const blob = await exportToTxt(chapters, {
  includeTitles: true,
});
// blob.type === "text/plain;charset=utf-8"
// 触发浏览器下载
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "小说标题.txt";
a.click();
```

### 导出为 HTML

```typescript
import { exportToHtml } from "@/lib/export/export-utils";

const blob = await exportToHtml(chapters, "小说标题", {
  includeTitles: true,
  authorName: "作者名",
});
// blob.type === "text/html;charset=utf-8"
// 包含完整的中文排版样式
```

### 导出为 EPUB

```typescript
import { exportToEpubViaApi } from "@/lib/export/export-utils";

const blob = await exportToEpubViaApi(chapters, "小说标题", {
  includeTitles: true,
  authorName: "作者名",
});
// blob.type === "application/epub+zip"
// 通过服务端 API 生成
```

### 在导出对话框中使用

```
1. 在写作页面点击"导出"按钮（Ctrl+E）
2. 弹出导出对话框
3. 选择目标格式（如 EPUB）
4. 填写作者署名
5. 确认章节标题包含选项
6. 点击"导出"按钮
7. 浏览器自动下载文件
```
