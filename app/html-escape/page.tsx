"use client";

import { useState } from "react";
import { Braces, Copy, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function HtmlEscapePage() {
  const [input, setInput] = useState("");

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const escapeHtml = () => {
    const div = document.createElement('div');
    div.textContent = input;
    setInput(div.innerHTML);
    toast.success("转义成功");
  };

  const unescapeHtml = () => {
    const div = document.createElement('div');
    div.innerHTML = input;
    setInput(div.textContent || "");
    toast.success("反转义成功");
  };

  const clearAll = () => setInput("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg">
          <Braces className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HTML 转义</h1>
          <p className="text-muted-foreground">
            对 HTML 实体字符进行编码和解码转换
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">输入/输出文本</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(input)} disabled={!input}>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={!input} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                清空
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="请输入需要处理的 HTML 代码或转义字符串..."
              className="min-h-[250px] font-mono text-base resize-y"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={escapeHtml} size="lg" className="flex-1 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            HTML 转义 (Escape)
          </Button>
          <Button onClick={unescapeHtml} size="lg" variant="outline" className="flex-1 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            HTML 反转义 (Unescape)
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 什么是 HTML 转义？
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>HTML 转义是将 HTML 预留字符转换为 HTML 实体。例如，将 `&lt;` 转换为 `&amp;lt;`。</p>
            <p>这通常用于在网页上安全地显示代码片段，防止浏览器将其解析为实际的 HTML 标签，或者为了防止跨站脚本（XSS）攻击。</p>
            <p className="font-mono bg-muted p-2 rounded-md inline-block">
              &lt; &rarr; &amp;lt;<br />
              &gt; &rarr; &amp;gt;<br />
              &amp; &rarr; &amp;amp;<br />
              " &rarr; &amp;quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
