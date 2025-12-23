"use client";

import { useState, useEffect, useRef } from "react";
import { Hourglass, Play, Pause, RotateCcw, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CountdownPage() {
  const [inputMinutes, setInputMinutes] = useState("5");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      setFinished(true);
      toast.success("时间到！", {
        icon: <BellRing className="text-primary" />,
        duration: 5000
      });
      // Try to play a subtle beep if browser allowed
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch {}
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
        const secs = parseInt(inputMinutes) * 60;
        if (isNaN(secs) || secs <= 0) {
            toast.error("请输入有效的分钟数");
            return;
        }
        setTimeLeft(secs);
    }
    setRunning(true);
    setFinished(false);
  };

  const handleReset = () => {
    setRunning(false);
    setFinished(false);
    const secs = parseInt(inputMinutes) * 60 || 300;
    setTimeLeft(secs);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / (parseInt(inputMinutes) * 60 || 300);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
          <Hourglass className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">倒数计时器</h1>
          <p className="text-muted-foreground">设置并开始倒计时提醒</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        <Card className="p-8 flex flex-col items-center space-y-8">
           <div className="relative flex items-center justify-center">
              {/* Circular Progress SVG */}
              <svg className="w-64 h-64 transform -rotate-90">
                 <circle
                   cx="128" cy="128" r="120"
                   stroke="currentColor" strokeWidth="8"
                   fill="transparent" className="text-muted/30"
                 />
                 <circle
                   cx="128" cy="128" r="120"
                   stroke="currentColor" strokeWidth="8"
                   fill="transparent"
                   strokeDasharray={2 * Math.PI * 120}
                   strokeDashoffset={2 * Math.PI * 120 * (1 - progress)}
                   strokeLinecap="round"
                   className="text-primary transition-all duration-1000 ease-linear"
                 />
              </svg>
              <div className={cn(
                "absolute text-6xl font-mono font-bold tabular-nums",
                finished && "animate-bounce text-primary"
              )}>
                {formatTime(timeLeft)}
              </div>
           </div>

           <div className="flex items-center gap-4 w-full">
              <div className="flex-1 space-y-1">
                 <span className="text-[10px] uppercase font-bold text-muted-foreground">分钟</span>
                 <Input 
                   type="number" 
                   value={inputMinutes} 
                   onChange={(e) => {
                     setInputMinutes(e.target.value);
                     if (!running) setTimeLeft(parseInt(e.target.value) * 60 || 0);
                   }}
                   disabled={running}
                   className="text-center font-bold text-lg"
                 />
              </div>
              <div className="flex gap-2 pt-5">
                 {!running ? (
                    <Button size="lg" className="h-12 w-12 rounded-full p-0" onClick={startTimer}>
                       <Play className="h-6 w-6" />
                    </Button>
                 ) : (
                    <Button size="lg" variant="outline" className="h-12 w-12 rounded-full p-0" onClick={() => setRunning(false)}>
                       <Pause className="h-6 w-6" />
                    </Button>
                 )}
                 <Button size="lg" variant="secondary" className="h-12 w-12 rounded-full p-0" onClick={handleReset}>
                    <RotateCcw className="h-6 w-6" />
                 </Button>
              </div>
           </div>
        </Card>

        {finished && (
           <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center animate-in zoom-in duration-500">
              <p className="font-bold text-primary flex items-center justify-center gap-2">
                 <BellRing className="h-5 w-5" />
                 时间到！
              </p>
           </div>
        )}
      </div>
    </div>
  );
}
