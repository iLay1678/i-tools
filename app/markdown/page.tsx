"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy, Eye, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";


const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor

This is a **live preview** editor. You can write your markdown on the left (or top), and see the result instantly.

## Features

- [x] GFM Support (Tables, Tasks, Strikethrough)
- [x] Syntax Highlighting
- [x] Vertical/Horizontal Layout (Responsive)

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

### Table Example

| Item | Price | Quantity |
|:-----|:-----:|:---------|
| Apple| $1.00 | 5        |
| Pear | $2.00 | 10       |

> "The best way to predict the future is to create it."
`;

export default function MarkdownPage() {
  const { theme } = useTheme();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Markdown 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("下载已开始");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Markdown 编辑器</h1>
                <p className="text-muted-foreground">实时预览、GFM 支持、所见即所得</p>
            </div>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => setMarkdown("")}>
                 <Trash2 className="h-4 w-4 lg:mr-2" />
                 <span className="hidden lg:inline">清空</span>
             </Button>
             <Button variant="outline" size="sm" onClick={copyToClipboard}>
                 <Copy className="h-4 w-4 lg:mr-2" />
                 <span className="hidden lg:inline">复制</span>
             </Button>
             <Button size="sm" onClick={downloadMarkdown}>
                 <Download className="h-4 w-4 lg:mr-2" />
                 <span className="hidden lg:inline">下载 .md</span>
             </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 lg:gap-6">
        {/* Editor */}
        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Edit3 className="h-4 w-4" /> 编辑
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 relative">
             <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={markdown}
                onChange={(value) => setMarkdown(value || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    padding: { top: 16 }
                }}
             />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border overflow-hidden">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> 预览
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto p-6 prose dark:prose-invert max-w-none">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
             </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
