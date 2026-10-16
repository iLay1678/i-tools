"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Palette, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  buildRule,
  gradientValue,
  radiusValue,
  shadowValue,
  type Corners,
  type GradientStop,
  type ShadowLayer,
} from "@/lib/css-gen";
import {
  CornersEditor,
  DEFAULT_CORNERS,
  DEFAULT_LAYERS,
  DEFAULT_STOPS,
  HELP,
  LayersEditor,
  StopsEditor,
  newId,
} from "./constants";

type Mode = "gradient" | "shadow" | "radius";

export default function CssGenPage() {
  const [mode, setMode] = useState<Mode>("gradient");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>(DEFAULT_STOPS);
  const [layers, setLayers] = useState<ShadowLayer[]>(DEFAULT_LAYERS);
  const [corners, setCorners] = useState<Corners>(DEFAULT_CORNERS);
  const [slashEnabled, setSlashEnabled] = useState(false);
  const [vertical, setVertical] = useState<Corners>(DEFAULT_CORNERS);

  const gradient = useMemo(
    () => gradientValue({ type: gradientType, angle, stops }),
    [gradientType, angle, stops],
  );
  const shadow = useMemo(() => shadowValue(layers), [layers]);
  const radius = useMemo(
    () => radiusValue({ corners, slashEnabled, vertical }),
    [corners, slashEnabled, vertical],
  );

  const previewStyle: CSSProperties = { background: gradient, boxShadow: shadow, borderRadius: radius };
  const css = buildRule(".preview", [
    ["background", gradient],
    ["box-shadow", shadow],
    ["border-radius", radius],
  ]);

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const updateStop = (id: string, patch: Partial<GradientStop>) =>
    setStops((prev) => prev.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  const updateLayer = (id: string, patch: Partial<ShadowLayer>) =>
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  const setLayerNumber = (id: string, key: "x" | "y" | "blur" | "spread", raw: string) => {
    const num = Number(raw) || 0;
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              x: key === "x" ? num : layer.x,
              y: key === "y" ? num : layer.y,
              blur: key === "blur" ? num : layer.blur,
              spread: key === "spread" ? num : layer.spread,
            }
          : layer,
      ),
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-rose-600 shadow-lg">
          <Palette className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CSS 生成器</h1>
          <p className="text-muted-foreground">渐变、阴影、圆角可视化生成与实时预览</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader className="pb-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gradient">渐变</TabsTrigger>
                <TabsTrigger value="shadow">阴影</TabsTrigger>
                <TabsTrigger value="radius">圆角</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "gradient" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>类型</Label>
                    <Select
                      value={gradientType}
                      onValueChange={(v) => setGradientType(v as "linear" | "radial")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">linear（线性）</SelectItem>
                        <SelectItem value="radial">radial（径向）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>角度：{angle}°</Label>
                    <Slider
                      value={[angle]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={(v) => setAngle(v[0])}
                      disabled={gradientType === "radial"}
                    />
                  </div>
                </div>
                <StopsEditor
                  stops={stops}
                  onUpdate={updateStop}
                  onAdd={() => setStops((prev) => [...prev, { id: newId(), color: "#22d3ee", position: 50 }])}
                  onRemove={(id) => setStops((prev) => prev.filter((s) => s.id !== id))}
                />
              </>
            )}

            {mode === "shadow" && (
              <LayersEditor
                layers={layers}
                onAdd={() =>
                  setLayers((prev) => [
                    ...prev,
                    { id: newId(), x: 0, y: 4, blur: 8, spread: 0, color: "#00000033", inset: false },
                  ])
                }
                onRemove={(id) => setLayers((prev) => prev.filter((l) => l.id !== id))}
                onNumber={setLayerNumber}
                onField={updateLayer}
              />
            )}

            {mode === "radius" && (
              <div className="space-y-4">
                <CornersEditor title="四角圆角（水平）" value={corners} onChange={setCorners} />
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="slash" className="cursor-pointer">
                    启用斜杠语法（水平 / 垂直）
                  </Label>
                  <Switch id="slash" checked={slashEnabled} onCheckedChange={setSlashEnabled} />
                </div>
                {slashEnabled && (
                  <CornersEditor title="四角圆角（垂直）" value={vertical} onChange={setVertical} />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">实时预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 min-h-60">
                <div className="h-40 w-full max-w-xs" style={previewStyle} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">生成的 CSS</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(css)} className="gap-2">
                <Copy className="h-4 w-4" />
                复制
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea readOnly value={css} className="min-h-32 font-mono text-xs resize-none bg-muted/30" />
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
          {HELP.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
