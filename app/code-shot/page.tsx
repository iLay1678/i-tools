"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Download, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CODE_SHOT_THEMES,
  canvasToPngBlob,
  renderCodeShot,
  type CodeShotConfig,
  type CodeShotResult,
} from "@/lib/code-shot";

const SAMPLE = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i += 1) {
    [a, b] = [b, a + b];
  }
  return b;
}

console.log(fibonacci(10));`;

export default function CodeShotPage() {
  const [code, setCode] = useState(SAMPLE);
  const [themeId, setThemeId] = useState(CODE_SHOT_THEMES[0].id);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(16);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [scale, setScale] = useState<1 | 2>(2);
  const [customBackground, setCustomBackground] = useState("");
  const [watermark, setWatermark] = useState("");
  const [info, setInfo] = useState<CodeShotResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = useMemo<CodeShotConfig>(
    () => ({
      themeId,
      padding,
      radius,
      fontSize,
      showLineNumbers,
      scale,
      customBackground,
      watermark,
    }),
    [themeId, padding, radius, fontSize, showLineNumbers, scale, customBackground, watermark],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setInfo(renderCodeShot(canvas, code, config));
  }, [code, config]);

  const downloadPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToPngBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "code-shot.png";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("图片下载已开始");
    } catch {
      toast.error("导出失败");
    }
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("unsupported");
      }
      const blob = await canvasToPngBlob(canvas);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("图片已复制到剪贴板");
    } catch {
      toast.error("当前环境不支持复制图片，请使用下载");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-purple-600 shadow-lg">
          <ImagePlus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">代码截图美化</h1>
          <p className="text-muted-foreground">把代码渲染成带行号与渐变背景的高清图片</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">参数设置</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCode(SAMPLE)} className="gap-2">
              <Wand2 className="h-4 w-4" />
              示例
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">代码内容</Label>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-45 font-mono text-sm resize-none bg-muted/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>主题</Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CODE_SHOT_THEMES.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>缩放倍率</Label>
                <Select value={String(scale)} onValueChange={(v) => setScale(v === "1" ? 1 : 2)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>内边距：{padding}px</Label>
              <Slider value={[padding]} min={16} max={96} step={4} onValueChange={(v) => setPadding(v[0])} />
            </div>
            <div className="space-y-2">
              <Label>圆角：{radius}px</Label>
              <Slider value={[radius]} min={0} max={32} step={2} onValueChange={(v) => setRadius(v[0])} />
            </div>
            <div className="space-y-2">
              <Label>字号：{fontSize}px</Label>
              <Slider value={[fontSize]} min={12} max={24} step={1} onValueChange={(v) => setFontSize(v[0])} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="lineNumbers" className="cursor-pointer">
                显示行号
              </Label>
              <Switch id="lineNumbers" checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
            </div>

            <div className="space-y-2">
              <Label>自定义背景（留空使用主题渐变）</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customBackground || "#1e293b"}
                  onChange={(e) => setCustomBackground(e.target.value)}
                  className="h-9 w-full p-1 cursor-pointer"
                />
                <Button variant="outline" onClick={() => setCustomBackground("")} className="shrink-0">
                  清除
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark">水印文本（可选）</Label>
              <Input
                id="watermark"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="右下角水印，留空则不显示"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">实时预览</CardTitle>
              {info && (
                <span className="text-xs text-muted-foreground">
                  {info.width} × {info.height}px
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 p-4 overflow-auto">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
              {info?.truncated && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>内容已截断</AlertTitle>
                  <AlertDescription>
                    代码共 {info.totalLines} 行，超过上限仅渲染前 500 行。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">导出</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={downloadPng} className="flex-1 gap-2" disabled={!code}>
                <Download className="h-4 w-4" />
                下载 PNG
              </Button>
              <Button onClick={copyImage} variant="outline" className="flex-1 gap-2" disabled={!code}>
                <Copy className="h-4 w-4" />
                复制图片
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. 采用 Canvas 手工绘制（无语法高亮、零依赖），长行会自动折行并保留缩进。</p>
          <p>2. 渲染宽度超过 4096px 时会自动把缩放降为 1x；超过 500 行会截断并提示。</p>
          <p>3.「复制图片」依赖浏览器 clipboard 支持，不支持时可改用「下载 PNG」。</p>
        </CardContent>
      </Card>
    </div>
  );
}
