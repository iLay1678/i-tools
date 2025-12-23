"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

type Mode = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

const CONFIG = {
  WORK: { time: 25 * 60, label: "工作", color: "text-rose-500", bg: "bg-rose-500" },
  SHORT_BREAK: { time: 5 * 60, label: "短休", color: "text-emerald-500", bg: "bg-emerald-500" },
  LONG_BREAK: { time: 15 * 60, label: "长休", color: "text-blue-500", bg: "bg-blue-500" }
};

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>("WORK");
  const [timeLeft, setTimeLeft] = useState(CONFIG.WORK.time);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleFinished();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleFinished = () => {
    const icon = mode === "WORK" ? <Coffee className="text-emerald-500" /> : <Zap className="text-rose-500" />;
    const msg = mode === "WORK" ? "工作结束，休息一下吧！" : "休息结束，开始专注吧！";
    toast.success(msg, { icon, duration: 5000 });
    
    // Play sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(CONFIG[mode].time);
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(CONFIG[newMode].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / CONFIG[mode].time;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-orange-600 shadow-lg">
          <Timer className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">番茄钟</h1>
          <p className="text-muted-foreground">专注工作，科学休息 (Pomodoro Technique)</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-8 pt-8">
        <div className="flex justify-center gap-2 p-1 bg-muted rounded-full">
           <ModeButton active={mode === "WORK"} label="工作" onClick={() => changeMode("WORK")} />
           <ModeButton active={mode === "SHORT_BREAK"} label="短休" onClick={() => changeMode("SHORT_BREAK")} />
           <ModeButton active={mode === "LONG_BREAK"} label="长休" onClick={() => changeMode("LONG_BREAK")} />
        </div>

        <Card className="p-8 flex flex-col items-center space-y-10 border-none shadow-2xl bg-card/50 backdrop-blur">
           <div className="relative flex items-center justify-center">
              <svg className="w-72 h-72 transform -rotate-90">
                 <circle
                   cx="144" cy="144" r="136"
                   stroke="currentColor" strokeWidth="4"
                   fill="transparent" className="text-muted/20"
                 />
                 <circle
                   cx="144" cy="144" r="136"
                   stroke="currentColor" strokeWidth="8"
                   fill="transparent"
                   strokeDasharray={2 * Math.PI * 136}
                   strokeDashoffset={2 * Math.PI * 136 * (1 - progress)}
                   strokeLinecap="round"
                   className={cn("transition-all duration-1000 ease-linear", CONFIG[mode].color)}
                 />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-7xl font-mono font-black tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                 </span>
                 <span className={cn("text-xs font-bold uppercase tracking-widest mt-2", CONFIG[mode].color)}>
                    {CONFIG[mode].label}ING
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <Button 
                size="lg" 
                variant="ghost" 
                className="h-14 w-14 rounded-full" 
                onClick={resetTimer}
              >
                 <RotateCcw className="h-6 w-6 text-muted-foreground" />
              </Button>

              <Button 
                size="lg" 
                className={cn("h-20 w-20 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all p-0", CONFIG[mode].bg, "text-white")}
                onClick={toggleTimer}
              >
                 {isActive ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
              </Button>

              <div className="h-14 w-14" /> {/* Spacer */}
           </div>
        </Card>
      </div>
    </div>
  );
}

function ModeButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-full text-sm font-bold transition-all flex-1",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
