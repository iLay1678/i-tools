"use client";

import { useState, useEffect, useRef } from "react";
import { Watch, Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Watch className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">秒表</h1>
          <p className="text-muted-foreground">精确计时工具，支持计次功能</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center justify-center py-12 space-y-8 h-fit">
          <div className="text-7xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums text-primary">
            {formatTime(time)}
          </div>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant={running ? "outline" : "default"} 
              className="w-32 h-14 text-lg rounded-full"
              onClick={() => setRunning(!running)}
            >
              {running ? (
                <><Pause className="mr-2 h-5 w-5" /> 暂停</>
              ) : (
                <><Play className="mr-2 h-5 w-5" /> 开始</>
              )}
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-32 h-14 text-lg rounded-full"
              onClick={running ? handleLap : handleReset}
              disabled={time === 0}
            >
              {running ? (
                <><TimerIcon className="mr-2 h-5 w-5" /> 计次</>
              ) : (
                <><RotateCcw className="mr-2 h-5 w-5" /> 重置</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
               计次记录
               <span className="text-xs font-normal text-muted-foreground">共 {laps.length} 次</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
            {laps.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                暂无记录
              </div>
            ) : (
              laps.map((lap, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted/50 animate-in slide-in-from-top-2 duration-300">
                  <span className="text-xs font-bold text-muted-foreground">LAP {laps.length - i}</span>
                  <span className="font-mono font-bold">{formatTime(lap)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
