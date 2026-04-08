"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MoonStar, RefreshCcw, Repeat2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CupResult = "圣杯" | "笑杯" | "阴杯";
type CupPhase = "idle" | "lift" | "toss" | "land";

type CupState = {
  left: number;
  right: number;
  result: CupResult;
  meaning: string;
  advice: string;
  nextStep: string;
};

const RESULT_MAP: Record<CupResult, { meaning: string; badge: string; tone: string; advice: string; nextStep: string }> = {
  圣杯: {
    meaning: "回应明确，通常表示可继续执行当前想法。",
    badge: "吉",
    tone: "from-emerald-400 to-teal-500",
    advice: "当前方向较顺，适合推进计划。",
    nextStep: "可以按原方案继续，先做最小一步验证。",
  },
  笑杯: {
    meaning: "回应不稳定，常见于问题不够清楚或时机未到。",
    badge: "待确认",
    tone: "from-amber-400 to-orange-500",
    advice: "建议整理问题后再问一次。",
    nextStep: "先收敛问题范围，重新发问更容易得到清晰答案。",
  },
  阴杯: {
    meaning: "当前不宜继续，通常提示换个方向或先暂停。",
    badge: "否",
    tone: "from-slate-500 to-slate-700",
    advice: "暂缓推进，先观察环境或调整方案。",
    nextStep: "可以先停一下，改问更具体的路径或条件。",
  },
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const pickResult = (): CupResult => {
  const value = Math.random();
  if (value < 0.48) return "圣杯";
  if (value < 0.75) return "笑杯";
  return "阴杯";
};

const createState = (result: CupResult): CupState => ({
  left: result === "圣杯" ? 1 : result === "笑杯" ? 1 : 0,
  right: result === "圣杯" ? 0 : result === "笑杯" ? 1 : 0,
  result,
  meaning: RESULT_MAP[result].meaning,
  advice: RESULT_MAP[result].advice,
  nextStep: RESULT_MAP[result].nextStep,
});

function CupBlock({ value, side, phase }: { value: number; side: "left" | "right"; phase: CupPhase }) {
  const isUp = value === 1;
  const finalTilt = isUp ? (side === "left" ? "-8deg" : "7deg") : side === "left" ? "10deg" : "-10deg";

  return (
    <div
      className={cn(
        "relative flex h-[clamp(7rem,18vw,9rem)] w-[clamp(5rem,13vw,6.5rem)] items-center justify-center rounded-[2rem] border-4 shadow-[0_18px_45px_rgba(0,0,0,0.15)] will-change-transform",
        isUp
          ? "border-amber-300 bg-linear-to-br from-amber-100 via-amber-200 to-amber-400 text-amber-950"
          : "border-slate-400 bg-linear-to-br from-slate-100 via-slate-200 to-slate-400 text-slate-800",
        phase === "lift" && "animate-cup-lift",
        phase === "toss" && "animate-cup-toss",
        phase === "land" && "animate-cup-land"
      )}
      style={{ ["--cup-final-tilt"]: finalTilt } as CSSProperties & { ["--cup-final-tilt"]: string }}
    >
      <div className="absolute inset-3 rounded-[1.5rem] border border-white/40" />
      <div className="absolute inset-x-1/2 top-2 h-[85%] w-[30%] -translate-x-1/2 rounded-full bg-white/20 blur-xl" />
      <div className="relative flex h-full w-full items-center justify-center">
        <div className={cn("rounded-full px-3 py-1 text-center text-2xl font-black", isUp ? "bg-white/55" : "bg-black/10")}>{isUp ? "上" : "下"}</div>
      </div>
    </div>
  );
}

export default function HolyCupPage() {
  const activeRef = useRef(true);

  const [tossing, setTossing] = useState(false);
  const [phase, setPhase] = useState<CupPhase>("idle");
  const [current, setCurrent] = useState<CupState | null>(null);
  const [history, setHistory] = useState<CupState[]>([]);
  const [seriesCount, setSeriesCount] = useState("3");
  const [seriesProgress, setSeriesProgress] = useState<{ current: number; total: number } | null>(null);

  const stats = useMemo(() => {
    const totals = history.reduce(
      (acc, item) => {
        acc[item.result] += 1;
        return acc;
      },
      { 圣杯: 0, 笑杯: 0, 阴杯: 0 } satisfies Record<CupResult, number>
    );

    return { total: history.length, ...totals };
  }, [history]);

  const resetMotion = () => {
    setPhase("idle");
  };

  const performToss = async () => {
    const result = pickResult();
    const state = createState(result);

    if (!activeRef.current) return state;

    setCurrent(null);
    setPhase("lift");
    await wait(220);

    if (!activeRef.current) return state;

    setPhase("toss");
    await wait(760);

    if (!activeRef.current) return state;

    setCurrent(state);
    setPhase("land");
    await wait(420);

    if (!activeRef.current) return state;

    setHistory((currentHistory) => [state, ...currentHistory]);
    resetMotion();

    return state;
  };

  const toss = async () => {
    if (tossing) return;

    setTossing(true);
    setSeriesProgress(null);
    await performToss();
    if (activeRef.current) setTossing(false);
  };

  const askSeries = async () => {
    if (tossing) return;

    const total = Math.max(1, Math.min(20, Number.parseInt(seriesCount, 10) || 0));

    setTossing(true);
    setSeriesProgress({ current: 0, total });
    setCurrent(null);

    for (let index = 0; index < total; index += 1) {
      setSeriesProgress({ current: index + 1, total });
      const state = await performToss();

      if (!activeRef.current) return;

      if (state.result === "圣杯") {
        break;
      }

      if (index < total - 1) {
        await wait(220);
      }
    }

    if (activeRef.current) {
      setSeriesProgress(null);
      setTossing(false);
    }
  };

  useEffect(() => {
    return () => {
      activeRef.current = false;
    };
  }, []);

  const currentDetail = current ? RESULT_MAP[current.result] : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg">
          <MoonStar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">掷圣杯</h1>
          <p className="text-muted-foreground">支持真实感掷筊动画、连续问卦与结果解释</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden border-emerald-200/60 bg-linear-to-br from-emerald-50 via-background to-teal-50 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10">
          <CardContent className="flex flex-col items-center gap-8 px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <Badge variant={tossing ? "default" : "secondary"} className="px-3 py-1 text-xs">
                {tossing ? "掷杯中" : current ? "已定杯" : "待开始"}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>{tossing ? "等待杯面落定" : "点击按钮开始询问"}</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center gap-4 px-4 py-4 [perspective:1000px]">
              <div className="absolute h-[clamp(13rem,34vw,16rem)] w-[clamp(13rem,34vw,16rem)] rounded-full bg-emerald-300/15 blur-3xl" />
              <div className="relative flex items-center gap-5">
                <CupBlock value={current?.left ?? 1} side="left" phase={phase} />
                <CupBlock value={current?.right ?? 0} side="right" phase={phase} />
              </div>
            </div>

            <div className="min-h-[7rem] text-center">
              {seriesProgress ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-muted-foreground">连续问卦进度</p>
                  <div className="mt-2 text-3xl font-black tracking-tight text-foreground">
                    {seriesProgress.current} / {seriesProgress.total}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">遇到圣杯会自动停下</p>
                </div>
              ) : current ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-muted-foreground">本次结果</p>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className={cn("rounded-full px-4 py-1 text-sm font-semibold text-white", `bg-linear-to-r ${currentDetail?.tone}`)}>{currentDetail?.badge}</span>
                    <span className="text-3xl font-black tracking-tight text-foreground">{current.result}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{currentDetail?.meaning}</p>
                </div>
              ) : (
                <p className="pt-6 text-sm text-muted-foreground">准备好后，掷一次看看结果。</p>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={toss} disabled={tossing} className="flex-1 gap-2 px-8 text-lg shadow-lg shadow-emerald-950/10">
                <RefreshCcw className={cn("h-5 w-5", tossing && !seriesProgress && "animate-spin")} />
                {tossing && !seriesProgress ? "掷杯中..." : "开始掷圣杯"}
              </Button>

              <div className="flex gap-2 sm:w-56">
                <Input
                  value={seriesCount}
                  onChange={(e) => setSeriesCount(e.target.value)}
                  inputMode="numeric"
                  min={1}
                  max={20}
                  disabled={tossing}
                  className="w-24 text-center"
                />
                <Button variant="outline" onClick={askSeries} disabled={tossing} className="flex-1 gap-2">
                  <Repeat2 className="h-4 w-4" />
                  连续问卦
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">结果解释卡片</h2>
                <p className="text-sm text-muted-foreground">不同结果对应不同含义</p>
              </div>

              {current && currentDetail ? (
                <div className="space-y-3 rounded-2xl border bg-background/70 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{current.result}</Badge>
                    <Badge
                      className={cn(
                        "bg-linear-to-r text-white",
                        `from-emerald-400 to-teal-500`,
                        current.result === "笑杯" && "from-amber-400 to-orange-500",
                        current.result === "阴杯" && "from-slate-500 to-slate-700"
                      )}
                    >
                      {currentDetail.badge}
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">{currentDetail.meaning}</p>

                  <div className="grid gap-2 text-sm">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground">建议</div>
                      <div className="mt-1 font-medium">{currentDetail.advice}</div>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground">下一步</div>
                      <div className="mt-1 font-medium">{currentDetail.nextStep}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">掷出一次后，这里会展示更详细的解释。</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold">结果统计</h2>
                <p className="text-sm text-muted-foreground">所有历史掷杯结果</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border bg-emerald-50 p-3 dark:bg-emerald-950/20">
                  <div className="text-xs text-muted-foreground">圣杯</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.圣杯}</div>
                </div>
                <div className="rounded-xl border bg-amber-50 p-3 dark:bg-amber-950/20">
                  <div className="text-xs text-muted-foreground">笑杯</div>
                  <div className="mt-1 text-2xl font-bold text-amber-600">{stats.笑杯}</div>
                </div>
                <div className="rounded-xl border bg-slate-100 p-3 dark:bg-slate-900/40">
                  <div className="text-xs text-muted-foreground">阴杯</div>
                  <div className="mt-1 text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.阴杯}</div>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">总次数</div>
                  <div className="mt-1 text-2xl font-bold">{stats.total}</div>
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
                        key={`${item.result}-${index}`}
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-sm",
                          item.result === "圣杯"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200"
                            : item.result === "笑杯"
                              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200"
                              : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                        )}
                      >
                        {item.result}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">还没有掷杯记录，先来一次。</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
