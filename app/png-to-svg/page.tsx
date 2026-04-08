"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ImagePlus, Upload, Copy, Download, Trash2, FileImage, AlertTriangle } from "lucide-react";

function makeSvg(width: number, height: number, dataUrl: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">\n  <image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="none" />\n</svg>`;
}

export default function PngToSvgPage() {
  const [sourceName, setSourceName] = useState("");
  const [sourceSize, setSourceSize] = useState<{ width: number; height: number } | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");

  const previewUrl = useMemo(() => (pngDataUrl ? pngDataUrl : ""), [pngDataUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      toast.error("请上传 PNG 文件");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const image = new Image();
      image.onload = () => {
        const next = makeSvg(image.width, image.height, dataUrl);
        setSourceName(file.name);
        setSourceSize({ width: image.width, height: image.height });
        setPngDataUrl(dataUrl);
        setSvgMarkup(next);
        toast.success("已生成 SVG 包装");
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const copySvg = async () => {
    if (!svgMarkup) return;
    try {
      await navigator.clipboard.writeText(svgMarkup);
      toast.success("SVG 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sourceName.replace(/\.png$/i, "") || "image"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("开始下载 SVG");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-pink-600 shadow-lg">
          <ImagePlus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PNG 转 SVG</h1>
          <p className="text-muted-foreground">使用 SVG 包装 PNG，保留透明背景</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">上传 PNG</CardTitle></CardHeader>
            <CardContent>
              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 transition-colors hover:bg-muted/50">
                <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">点击选择 PNG 文件</p>
                <p className="mt-1 text-xs text-muted-foreground/60">仅支持 .png</p>
                <input type="file" accept="image/png" onChange={handleFileChange} className="sr-only" />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">SVG 标记</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copySvg} disabled={!svgMarkup}><Copy className="mr-2 h-4 w-4" />复制</Button>
                <Button variant="outline" size="sm" onClick={() => { setPngDataUrl(""); setSvgMarkup(""); setSourceName(""); setSourceSize(null); }} disabled={!svgMarkup}><Trash2 className="mr-2 h-4 w-4" />清空</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea value={svgMarkup} readOnly placeholder="转换后的 SVG 会显示在这里" className="min-h-[280px] font-mono text-xs" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">预览</CardTitle>
              <Button size="sm" onClick={downloadSvg} disabled={!svgMarkup}><Download className="mr-2 h-4 w-4" />下载 .svg</Button>
            </CardHeader>
            <CardContent className="flex min-h-[420px] items-center justify-center bg-muted/20 p-6">
              {previewUrl ? <img src={previewUrl} alt="PNG preview" className="max-h-[600px] max-w-full object-contain" /> : <div className="text-center text-muted-foreground"><FileImage className="mx-auto mb-2 h-12 w-12 opacity-20" /><p>等待上传 PNG</p></div>}
            </CardContent>
          </Card>

          {svgMarkup && sourceSize && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>转换信息</AlertTitle>
              <AlertDescription>{sourceName} · {sourceSize.width} × {sourceSize.height}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
