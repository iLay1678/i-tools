"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { FileCode, Copy, Download, Trash2, Eye, Edit3, AlertTriangle } from "lucide-react";

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="24" fill="#0f172a"/>
  <circle cx="96" cy="90" r="42" fill="#38bdf8" opacity=".85"/>
  <text x="160" y="98" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" text-anchor="middle">SVG 编辑器</text>
</svg>`;

function parseSvg(markup: string) {
  if (typeof DOMParser === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");
  return doc.querySelector("parsererror") ? "SVG 解析失败，请检查标签与属性。" : "";
}

export default function SvgEditorPage() {
  const [svg, setSvg] = useState(DEFAULT_SVG);
  const error = useMemo(() => parseSvg(svg), [svg]);
  const previewSrc = useMemo(() => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, [svg]);

  const copySvg = async () => {
    try {
      await navigator.clipboard.writeText(svg);
      toast.success("SVG 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graphic.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("开始下载 SVG");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 shadow-lg">
            <FileCode className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SVG 在线编辑</h1>
            <p className="text-muted-foreground">编辑 SVG 源码并实时预览</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSvg("")}> <Trash2 className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">清空</span></Button>
          <Button variant="outline" size="sm" onClick={copySvg}> <Copy className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">复制</span></Button>
          <Button size="sm" onClick={downloadSvg}> <Download className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">下载 .svg</span></Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>解析错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 min-h-0 grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 lg:gap-6">
        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0"><CardTitle className="text-sm font-medium flex items-center gap-2"><Edit3 className="h-4 w-4" />编辑</CardTitle></CardHeader>
          <CardContent className="p-0 flex-1 min-h-0"><Textarea value={svg} onChange={(e) => setSvg(e.target.value)} className="h-full min-h-full resize-none rounded-none border-0 font-mono text-xs" placeholder="在这里输入 SVG 标记" /></CardContent>
        </Card>

        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border overflow-hidden">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0"><CardTitle className="text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" />预览</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto p-6 bg-white dark:bg-zinc-950">
            {error ? <div className="text-sm text-muted-foreground">预览已暂停，先修复右侧错误。</div> : <img src={previewSrc} alt="SVG preview" className="max-h-full max-w-full object-contain" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
