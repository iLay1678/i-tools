"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  buildFlexCss,
  buildFlexStyle,
  buildGridCss,
  buildGridStyle,
  type AlignContent,
  type AlignItems,
  type FlexDirection,
  type FlexWrap,
  type JustifyContent,
} from "@/lib/flex-grid";
import { ALIGN_CONTENT, ALIGN_ITEMS, DIRECTIONS, HELP, JUSTIFY, WRAPS, toStyle } from "./constants";

type Mode = "flex" | "grid";

export default function FlexGridPage() {
  const [mode, setMode] = useState<Mode>("flex");
  const [direction, setDirection] = useState<FlexDirection>("row");
  const [wrap, setWrap] = useState<FlexWrap>("wrap");
  const [justify, setJustify] = useState<JustifyContent>("flex-start");
  const [alignItems, setAlignItems] = useState<AlignItems>("stretch");
  const [alignContent, setAlignContent] = useState<AlignContent>("stretch");
  const [gap, setGap] = useState(12);
  const [itemCount, setItemCount] = useState(4);
  const [itemSize, setItemSize] = useState(64);
  const [grow, setGrow] = useState(false);
  const [growIndex, setGrowIndex] = useState(0);
  const [columns, setColumns] = useState(3);

  const containerStyle = useMemo(() => {
    if (mode === "grid") {
      return buildGridStyle({ columns, gap, justifyContent: justify, alignItems });
    }
    return buildFlexStyle({
      direction,
      wrap,
      justifyContent: justify,
      alignItems,
      alignContent,
      gap,
      itemCount,
      itemSize,
      growIndex: grow ? growIndex : null,
    });
  }, [mode, columns, gap, justify, alignItems, direction, wrap, alignContent, itemCount, itemSize, grow, growIndex]);

  const css = useMemo(() => {
    if (mode === "grid") {
      return buildGridCss({ columns, gap, justifyContent: justify, alignItems });
    }
    return buildFlexCss({
      direction,
      wrap,
      justifyContent: justify,
      alignItems,
      alignContent,
      gap,
      itemCount,
      itemSize,
      growIndex: grow ? growIndex : null,
    });
  }, [mode, columns, gap, justify, alignItems, direction, wrap, alignContent, itemCount, itemSize, grow, growIndex]);

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
          <LayoutGrid className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flexbox / Grid 可视化</h1>
          <p className="text-muted-foreground">调节布局属性，实时预览并生成 CSS</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">布局参数</CardTitle>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-40">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="flex">Flex</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "flex" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>flex-direction</Label>
                    <Select value={direction} onValueChange={(v) => setDirection(v as FlexDirection)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIRECTIONS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>flex-wrap</Label>
                    <Select value={wrap} onValueChange={(v) => setWrap(v as FlexWrap)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WRAPS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    align-content{" "}
                    {wrap === "nowrap" && (
                      <span className="text-xs text-muted-foreground">（需开启换行才生效）</span>
                    )}
                  </Label>
                  <Select value={alignContent} onValueChange={(v) => setAlignContent(v as AlignContent)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALIGN_CONTENT.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>子项数量：{itemCount}</Label>
                  <Slider value={[itemCount]} min={1} max={12} step={1} onValueChange={(v) => setItemCount(v[0])} />
                </div>
                <div className="space-y-2">
                  <Label>子项尺寸：{itemSize}px</Label>
                  <Slider value={[itemSize]} min={24} max={160} step={4} onValueChange={(v) => setItemSize(v[0])} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="grow" className="cursor-pointer">
                    让某一项 flex-grow
                  </Label>
                  <Switch id="grow" checked={grow} onCheckedChange={setGrow} />
                </div>
                {grow && (
                  <div className="space-y-2">
                    <Label>放大第几项</Label>
                    <Select value={String(growIndex)} onValueChange={(v) => setGrowIndex(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: itemCount }).map((_, index) => (
                          <SelectItem key={index} value={String(index)}>
                            第 {index + 1} 项
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Label>列数：{columns}</Label>
                <Slider value={[columns]} min={1} max={6} step={1} onValueChange={(v) => setColumns(v[0])} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>justify-content</Label>
                <Select value={justify} onValueChange={(v) => setJustify(v as JustifyContent)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JUSTIFY.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>align-items</Label>
                <Select value={alignItems} onValueChange={(v) => setAlignItems(v as AlignItems)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALIGN_ITEMS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>gap：{gap}px</Label>
              <Slider value={[gap]} min={0} max={40} step={1} onValueChange={(v) => setGap(v[0])} />
            </div>
          </CardContent>
        </Card>

        {/* Preview + CSS */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                实时预览
                <Badge variant="secondary">{itemCount} 项</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-muted/20 h-65 overflow-auto p-2">
                <div style={toStyle(containerStyle)} className="h-full">
                  {Array.from({ length: itemCount }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center rounded-md bg-blue-500/80 text-white text-sm font-medium shadow-sm"
                      style={{
                        width: mode === "flex" ? itemSize : undefined,
                        height: itemSize,
                        flexGrow: mode === "flex" && grow && index === growIndex ? 1 : undefined,
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
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
              <Textarea readOnly value={css} className="min-h-40 font-mono text-xs resize-none bg-muted/30" />
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
