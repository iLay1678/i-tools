"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleDollarSign, RotateCw, Sparkles, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CoinSide = "HEADS" | "TAILS";

const labels: Record<CoinSide, string> = {
  HEADS: "正面",
  TAILS: "反面",
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function CoinFlipPage() {
  const timeoutRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<CoinSide[]>([]);
  const [seriesCount, setSeriesCount] = useState("3");
  const [seriesProgress, setSeriesProgress] = useState<{ current: number; total: number } | null>(null);

  const stats = useMemo(() => {
    const heads = history.filter((item) => item === "HEADS").length;
    const tails = history.length - heads;

    return {
      heads,
      tails,
      total: history.length,
    };
  }, [history]);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const animateFlip = (outcome: CoinSide, duration: number) =>
    new Promise<void>((resolve) => {
      clearTimer();

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const currentMod = ((rotationRef.current % 360) + 360) % 360;
      const fullTurns = reducedMotion ? 0 : Math.floor(Math.random() * 3) + 4;
      const targetFace = outcome === "HEADS" ? 0 : 180;
      const nextRotation = rotationRef.current + fullTurns * 360 - currentMod + targetFace;

      rotationRef.current = nextRotation;
      setResult(null);
      setRotation(nextRotation);

      timeoutRef.current = window.setTimeout(() => {
        setResult(outcome);
        setHistory((current) => [outcome, ...current]);
        timeoutRef.current = null;
        resolve();
      }, reducedMotion ? 120 : duration);
    });

  const flip = async () => {
    if (flipping) return;

    setFlipping(true);
    setSeriesProgress(null);

    const outcome: CoinSide = Math.random() > 0.5 ? "HEADS" : "TAILS";
    await animateFlip(outcome, 2200);

    setFlipping(false);
  };

  const flipSeries = async () => {
    if (flipping) return;

    const total = Math.max(1, Math.min(99, Number.parseInt(seriesCount, 10) || 0));

    setFlipping(true);
    setSeriesProgress({ current: 0, total });

    for (let index = 0; index < total; index += 1) {
      const outcome: CoinSide = Math.random() > 0.5 ? "HEADS" : "TAILS";
      setSeriesProgress({ current: index + 1, total });
      await animateFlip(outcome, 900);

      if (index < total - 1) {
        await wait(180);
      }
    }

    setSeriesProgress(null);
    setFlipping(false);
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 shadow-lg">
          <CircleDollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">抛硬币</h1>
          <p className="text-muted-foreground">支持单次与连续抛掷，结果完整记录</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden border-amber-200/60 bg-linear-to-br from-amber-50 via-background to-yellow-50 dark:border-amber-900/40 dark:from-amber-950/20 dark:via-background dark:to-yellow-950/10">
          <CardContent className="flex flex-col items-center justify-center gap-8 px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
              <Badge variant={flipping ? "default" : "secondary"} className="px-3 py-1 text-xs">
                {flipping ? "翻转中" : result ? "已落定" : "待开始"}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{flipping ? "硬币正在翻转，请等待落面" : "点击按钮获得随机结果"}</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center px-4 py-2 [perspective:1200px]">
              <div className="absolute h-[clamp(13rem,34vw,17rem)] w-[clamp(13rem,34vw,17rem)] rounded-full bg-amber-300/20 blur-3xl" />

              <div className={cn("relative will-change-transform", flipping && "animate-coin-bounce")}>
                <div
                  className={cn(
                    "relative rounded-full transform-style-3d shadow-[0_24px_50px_rgba(146,64,14,0.18)] transition-transform will-change-transform motion-reduce:transition-none",
                    flipping && "ring-2 ring-amber-300/40"
                  )}
                  style={{
                    width: "clamp(11rem, 34vw, 14rem)",
                    height: "clamp(11rem, 34vw, 14rem)",
                    transform: `rotateY(${rotation}deg) rotateZ(${flipping ? 8 : 0}deg)`,
                    transitionDuration: flipping ? "2200ms" : "700ms",
                    transitionTimingFunction: flipping
                      ? "cubic-bezier(0.18, 0.88, 0.2, 1)"
                      : "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <div className="coin-face absolute inset-0 rounded-full border-4 border-amber-500/80 bg-linear-to-br from-yellow-200 via-amber-300 to-amber-500 text-amber-900 backface-hidden">
                    <div className="absolute inset-3 rounded-full border border-white/35" />
                    <div className="absolute inset-6 rounded-full border border-amber-700/30" />
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_42%)]">
                      <span className="text-5xl font-black tracking-[0.2em] sm:text-6xl">正</span>
                      <span className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-900/80">Heads</span>
                    </div>
                  </div>

                  <div className="coin-face absolute inset-0 rounded-full border-4 border-slate-500/80 bg-linear-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-800 backface-hidden rotate-y-180">
                    <div className="absolute inset-3 rounded-full border border-white/35" />
                    <div className="absolute inset-6 rounded-full border border-slate-700/20" />
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_42%)]">
                      <span className="text-5xl font-black tracking-[0.2em] sm:text-6xl">反</span>
                      <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-700/80">Tails</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-24 text-center">
              {seriesProgress ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-muted-foreground">连续抛掷进度</p>
                  <div className="mt-2 text-3xl font-black tracking-tight text-foreground">
                    {seriesProgress.current} / {seriesProgress.total}
                  </div>
                </div>
              ) : result && !flipping ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-muted-foreground">本次结果</p>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="rounded-full border bg-background/80 px-4 py-1 text-sm text-muted-foreground shadow-sm">
                      {result}
                    </span>
                    <span className="text-3xl font-black tracking-tight text-foreground">{labels[result]}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-6 text-sm text-muted-foreground">
                  {flipping ? "正在翻转... 即将落地" : "准备好了就开始抛一次"}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={flip} disabled={flipping} className="flex-1 gap-2 px-8 text-lg shadow-lg shadow-amber-950/10">
                <RotateCw className={cn("h-5 w-5", flipping && "animate-spin")} />
                {flipping && !seriesProgress ? "翻转中..." : "开始抛硬币"}
              </Button>

              <div className="flex gap-2 sm:w-56">
                <Input
                  value={seriesCount}
                  onChange={(e) => setSeriesCount(e.target.value)}
                  inputMode="numeric"
                  min={1}
                  max={99}
                  disabled={flipping}
                  className="w-24 text-center"
                />
                <Button variant="outline" onClick={flipSeries} disabled={flipping} className="flex-1 gap-2">
                  <Hash className="h-4 w-4" />
                  连续抛
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">翻转统计</h2>
                <p className="text-sm text-muted-foreground">完整结果概览</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">总次数</div>
                  <div className="mt-1 text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="rounded-xl border bg-amber-50 p-3 dark:bg-amber-950/20">
                  <div className="text-xs text-muted-foreground">正面</div>
                  <div className="mt-1 text-2xl font-bold text-amber-600">{stats.heads}</div>
                </div>
                <div className="rounded-xl border bg-slate-100 p-3 dark:bg-slate-900/40">
                  <div className="text-xs text-muted-foreground">反面</div>
                  <div className="mt-1 text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.tails}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">最近结果</h2>
                <p className="text-sm text-muted-foreground">越新的结果排在越前面</p>
              </div>

              {history.length > 0 ? (
                <div className="max-h-64 overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {history.map((item, index) => (
                      <Badge
                        key={`${item}-${index}`}
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-sm",
                          item === "HEADS"
                            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200"
                            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                        )}
                      >
                        {labels[item]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  还没有记录，先抛一次看看。
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
