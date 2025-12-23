"use client";

import { useState } from "react";
import { CircleDollarSign, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CoinFlipPage() {
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<"HEADS" | "TAILS" | null>(null);

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);

    // Random outcome
    const outcome = Math.random() > 0.5 ? "HEADS" : "TAILS";

    // Simulate animation time
    setTimeout(() => {
      setResult(outcome);
      setFlipping(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 shadow-lg">
          <CircleDollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">抛硬币</h1>
          <p className="text-muted-foreground">随机正反面决策工具</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-12">
        <div className="relative perspective-[1000px]">
          <div className={cn(
            "w-48 h-48 relative transition-transform duration-1000 transform-style-3d",
            flipping && "animate-spin-slow-3d", // We need to define this animation or simulate it
            !flipping && result === "HEADS" && "rotate-y-0",
            !flipping && result === "TAILS" && "rotate-y-180",
          )}>
            {/* Front (Heads) */}
            <div className={cn(
                "absolute w-full h-full rounded-full bg-amber-400 border-4 border-amber-600 shadow-xl flex items-center justify-center backface-hidden",
                // If result is tails, and not flipping, this side is hidden.
                // But simplified: Just use CSS transforms.
            )}>
               <span className="text-5xl font-bold text-amber-800">正面</span>
            </div>

             {/* Back (Tails) */}
            <div className={cn(
                "absolute w-full h-full rounded-full bg-slate-300 border-4 border-slate-500 shadow-xl flex items-center justify-center backface-hidden rotate-y-180"
            )}>
               <span className="text-5xl font-bold text-slate-700">反面</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
           <div className="h-8">
             {result && !flipping && (
                <span className="text-2xl font-bold animate-in fade-in zoom-in duration-300">
                    {result === "HEADS" ? "正面 (HEADS)" : "反面 (TAILS)"}
                </span>
             )}
              {flipping && (
                <span className="text-lg text-muted-foreground animate-pulse">
                    正在翻转...
                </span>
             )}
           </div>

           <Button size="lg" onClick={flip} disabled={flipping} className="gap-2 text-lg px-8">
              <RotateCw className={cn("h-5 w-5", flipping && "animate-spin")} />
              {flipping ? "翻转中..." : "开始抛硬币"}
           </Button>
        </div>
      </div>
    </div>
  );
}
