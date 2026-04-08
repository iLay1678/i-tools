"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FerrisWheel, Shuffle, Trophy, Weight, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399", "#22d3ee", "#818cf8", "#e879f9"];

type WheelItem = {
  id: string;
  label: string;
  weight: number;
};

const DEFAULT_ITEMS = ["今晚吃火锅", "去看电影", "写代码", "早点睡觉", "打游戏", "喝奶茶"].map((label) => createItem(label));

const normalizeAngle = (angle: number) => {
  const fullCircle = Math.PI * 2;
  return ((angle % fullCircle) + fullCircle) % fullCircle;
};

const parseItems = (value: string) =>
  value
    .split(/[\n,，、]+/)
    .map((item) => item.trim())
    .filter(Boolean);

function createItem(label: string, weight = 1): WheelItem {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label,
    weight,
  };
}

const sumWeights = (items: WheelItem[], weighted: boolean) =>
  items.reduce((total, item) => total + (weighted ? Math.max(1, item.weight || 1) : 1), 0);

const buildSegments = (items: WheelItem[], weighted: boolean) => {
  const total = sumWeights(items, weighted);
  let cursor = 0;

  return items.map((item) => {
    const segmentWeight = weighted ? Math.max(1, item.weight || 1) : 1;
    const angle = (segmentWeight / total) * Math.PI * 2;
    const segment = { item, startAngle: cursor, endAngle: cursor + angle };
    cursor += angle;
    return segment;
  });
};

export default function WheelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const [items, setItems] = useState<WheelItem[]>(DEFAULT_ITEMS);
  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [wheelSize, setWheelSize] = useState(400);
  const [spinCount, setSpinCount] = useState(0);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [weightedMode, setWeightedMode] = useState(false);
  const [uniqueMode, setUniqueMode] = useState(true);

  const segments = useMemo(() => buildSegments(items, weightedMode), [items, weightedMode]);
  const totalWeight = useMemo(() => sumWeights(items, weightedMode), [items, weightedMode]);

  const pointerLabel = useMemo(() => {
    if (isSpinning) return "抽奖中";
    if (winner) return `抽中：${winner.label}`;
    return "点击中心开始";
  }, [isSpinning, winner]);

  const drawWheel = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.clearRect(0, 0, size, size);

    if (segments.length === 0) {
      ctx.save();
      ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#64748b";
      ctx.font = `600 ${Math.max(16, size * 0.05)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("添加选项后即可开始", size / 2, size / 2 + 6);
      ctx.restore();
      return;
    }

    const center = size / 2;
    const radius = size * 0.44;

    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;

    segments.forEach((segment, index) => {
      const startAngle = rotationRef.current + segment.startAngle;
      const endAngle = rotationRef.current + segment.endAngle;
      const segmentAngle = endAngle - startAngle;

      ctx.beginPath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.max(12, size * 0.033)}px Arial`;

      const maxWidth = radius * 0.58;
      let label = segment.item.label;
      while (label.length > 1 && ctx.measureText(label).width > maxWidth) {
        label = label.slice(0, -1);
      }

      ctx.fillText(label === segment.item.label ? label : `${label}…`, radius - 18, 5);

      if (weightedMode) {
        ctx.font = `600 ${Math.max(10, size * 0.024)}px Arial`;
        ctx.fillText(`×${Math.max(1, segment.item.weight || 1)}`, radius - 18, 22);
      }

      ctx.restore();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.moveTo(size - 18, center);
    ctx.lineTo(size + 8, center - 14);
    ctx.lineTo(size + 8, center + 14);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, size * 0.07, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.stroke();
  };

  const renderWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const roundedSize = Math.round(wheelSize);
    canvas.width = Math.round(roundedSize * ratio);
    canvas.height = Math.round(roundedSize * ratio);
    canvas.style.width = `${roundedSize}px`;
    canvas.style.height = `${roundedSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawWheel(ctx, roundedSize);
  };

  const getWinningItem = () => {
    if (segments.length === 0) return null;

    const pointerAngle = normalizeAngle(-rotationRef.current);
    return segments.find((segment) => pointerAngle >= segment.startAngle && pointerAngle < segment.endAngle)?.item ?? segments[0]?.item ?? null;
  };

  const stopSpin = () => {
    setIsSpinning(false);

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    const nextWinner = getWinningItem();
    setWinner(nextWinner);

    if (nextWinner) {
      setSpinCount((count) => count + 1);
      toast.success(`结果揭晓：${nextWinner.label}！`);

      if (uniqueMode) {
        setItems((current) => current.filter((item) => item.id !== nextWinner.id));
      }
    }
  };

  const animate = () => {
    if (speedRef.current > 0.002) {
      speedRef.current *= 0.985;
      rotationRef.current = normalizeAngle(rotationRef.current + speedRef.current);
      renderWheel();
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    stopSpin();
  };

  const spin = () => {
    if (items.length < 2) {
      toast.error("至少需要两个选项");
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    speedRef.current = Math.random() * 0.22 + 0.36;

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const addItem = () => {
    const parsed = parseItems(newItem);

    if (parsed.length === 0) {
      toast.error("请输入至少一个有效选项");
      return;
    }

    const existing = new Set(items.map((item) => item.label));
    const nextItems = [...items];
    let duplicateCount = 0;

    parsed.forEach((label) => {
      if (uniqueMode && existing.has(label)) {
        duplicateCount += 1;
        return;
      }

      existing.add(label);
      nextItems.push(createItem(label));
    });

    if (nextItems.length === items.length) {
      toast.error("这些选项已经都存在了");
      return;
    }

    setItems(nextItems);
    setNewItem("");

    if (duplicateCount > 0) {
      toast.message(`已添加 ${nextItems.length - items.length} 项，跳过 ${duplicateCount} 个重复项`);
    }
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateWeight = (idx: number, value: string) => {
    const nextWeight = Math.max(1, Math.min(99, Number.parseInt(value, 10) || 1));
    setItems((current) => current.map((item, i) => (i === idx ? { ...item, weight: nextWeight } : item)));
  };

  const resetToDefault = () => {
    setItems(DEFAULT_ITEMS);
    setWinner(null);
    setNewItem("");
  };

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextSize = Math.max(280, Math.min(entry.contentRect.width, 440));
      setWheelSize(nextSize);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    renderWheel();
  }, [segments, wheelSize]);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center space-x-4 border-b pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-rose-400 to-red-500 shadow-lg">
            <FerrisWheel className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">大转盘抽奖</h1>
            <p className="text-muted-foreground">支持权重抽奖、去重模式和移动端优化</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="bg-muted/10 lg:col-span-7">
            <CardContent className="flex flex-col items-center gap-6 p-4 sm:p-8">
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <Badge variant={isSpinning ? "default" : "secondary"} className="px-3 py-1 text-xs">
                    {isSpinning ? "抽奖中" : winner ? "已出结果" : "待开始"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{isSpinning ? "转盘正在减速，请等待结果落点" : "点击中心按钮或转盘开始抽奖"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>选项 {items.length}</span>
                  <span>·</span>
                  <span>总权重 {totalWeight}</span>
                  <span>·</span>
                  <span>已抽 {spinCount} 次</span>
                </div>
              </div>

              <div ref={canvasContainerRef} className="relative flex w-full max-w-[440px] items-center justify-center">
                <div className="relative w-full">
                  <canvas
                    ref={canvasRef}
                    className={cn("mx-auto h-auto max-w-full rounded-full transition-opacity", isSpinning ? "cursor-wait opacity-95" : "cursor-pointer")}
                    onClick={spin}
                  />

                  <div className="pointer-events-none absolute inset-x-0 top-full mt-3 flex justify-center sm:inset-auto sm:right-[-0.5rem] sm:top-1/2 sm:-translate-y-1/2 sm:justify-end">
                    <div className={cn("rounded-full border bg-background/95 px-3 py-1 text-xs font-semibold shadow-lg", isSpinning && "animate-pulse")}>{pointerLabel}</div>
                  </div>

                  {isSpinning && <div className="pointer-events-none absolute inset-5 rounded-full border border-white/40 bg-white/10 shadow-inner" />}

                  <button
                    className={cn(
                      "absolute left-1/2 top-1/2 z-10 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/70 bg-white text-sm font-black text-slate-800 shadow-xl transition-transform",
                      isSpinning ? "scale-95" : "hover:scale-105"
                    )}
                    onClick={spin}
                    disabled={isSpinning || items.length < 2}
                  >
                    {isSpinning ? "GO" : "开始"}
                  </button>
                </div>
              </div>

              <div className="min-h-[4.5rem] text-center">
                {winner ? (
                  <div className="animate-in zoom-in duration-300">
                    <p className="text-sm text-muted-foreground">本轮结果</p>
                    <h2 className="mt-2 flex items-center justify-center gap-3 text-3xl font-extrabold text-primary">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      {winner.label}
                    </h2>
                  </div>
                ) : (
                  <p className="pt-6 text-sm text-muted-foreground">还没开始？给转盘一个目标，它会帮你做选择。</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                <span>选项列表 ({items.length})</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant={weightedMode ? "default" : "outline"} size="sm" onClick={() => setWeightedMode((current) => !current)} disabled={isSpinning}>
                    <Weight className="h-4 w-4" />
                    权重抽奖
                  </Button>
                  <Button variant={uniqueMode ? "default" : "outline"} size="sm" onClick={() => setUniqueMode((current) => !current)} disabled={isSpinning}>
                    去重模式
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setItems((current) => [...current].sort(() => Math.random() - 0.5))} disabled={items.length < 2 || isSpinning}>
                    <Shuffle className="h-4 w-4" />
                    打乱
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsClearDialogOpen(true)} className="text-destructive hover:text-destructive" disabled={items.length === 0 || isSpinning}>
                    清空
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                    placeholder="输入选项，支持逗号批量添加"
                    disabled={isSpinning}
                  />
                  <Button onClick={addItem} disabled={isSpinning}>添加</Button>
                </div>
                <p className="text-xs text-muted-foreground">示例：火锅，烧烤，寿司 或换行粘贴多项</p>
              </div>

              <div className="max-h-100 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-2">
                {items.length === 0 && (
                  <div className="space-y-3 py-8 text-center text-sm text-muted-foreground">
                    <p>暂无选项，请先添加内容</p>
                    <Button variant="outline" size="sm" onClick={resetToDefault}>
                      恢复示例选项
                    </Button>
                  </div>
                )}

                {items.map((item, idx) => (
                  <div key={item.id} className="group space-y-2 rounded border bg-background p-2 text-sm shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate flex-1">{item.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        onClick={() => removeItem(idx)}
                        disabled={isSpinning}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className={cn("flex items-center gap-2", weightedMode ? "opacity-100" : "opacity-60")}>
                      <span className="text-xs text-muted-foreground">权重</span>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={item.weight}
                        onChange={(e) => updateWeight(idx, e.target.value)}
                        disabled={isSpinning || !weightedMode}
                        className="h-8 w-24"
                      />
                      <span className="text-xs text-muted-foreground">数值越大，抽中概率越高</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button onClick={spin} disabled={isSpinning || items.length < 2} className="w-full" size="lg">
                  {isSpinning ? "抽奖中..." : "开始抽奖"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空所有选项？</DialogTitle>
            <DialogDescription>清空后当前候选项会全部移除，你可以稍后再恢复示例选项。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setItems([]);
                setWinner(null);
                setIsClearDialogOpen(false);
              }}
            >
              确认清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
