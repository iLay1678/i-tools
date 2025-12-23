"use client";

import { useState, useEffect } from "react";
import { Keyboard, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KeyboardPage() {
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); // Prevent standard browser actions
      setLastEvent({
        key: e.key === " " ? "Space" : e.key,
        code: e.code,
        keyCode: e.keyCode,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        location: e.location,
        repeat: e.repeat
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-zinc-700 to-zinc-900 shadow-lg">
          <Keyboard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">键盘按键检测</h1>
          <p className="text-muted-foreground">实时检测并显示键盘按键的详细事件属性</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-8">
        {!lastEvent ? (
          <div className="text-center space-y-4">
            <div className="w-64 h-64 rounded-3xl border-4 border-dashed border-muted flex items-center justify-center animate-pulse">
               <span className="text-muted-foreground font-medium text-lg px-8">请按下键盘上的任意按键</span>
            </div>
          </div>
        ) : (
          <>
            <div className="relative group">
               <div className="absolute -inset-1 bg-linear-to-r from-primary to-purple-600 rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-1000"></div>
               <div className="relative w-64 h-64 rounded-3xl bg-card border-2 border-primary flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Key</span>
                  <span className="text-7xl font-bold text-primary">{lastEvent.key}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
               <DetailCard label="Code" value={lastEvent.code} />
               <DetailCard label="KeyCode" value={lastEvent.keyCode} />
               <DetailCard label="Location" value={lastEvent.location} />
               <DetailCard label="Repeat" value={lastEvent.repeat ? "Yes" : "No"} />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
               <ModifierTag active={lastEvent.ctrlKey} label="Ctrl" />
               <ModifierTag active={lastEvent.shiftKey} label="Shift" />
               <ModifierTag active={lastEvent.altKey} label="Alt" />
               <ModifierTag active={lastEvent.metaKey} label="Win / Cmd" />
            </div>
            
            <Button variant="ghost" onClick={() => setLastEvent(null)} className="text-muted-foreground">
               <RotateCcw className="h-4 w-4 mr-2" />
               重置检测
            </Button>
          </>
        )}
      </div>

      <Card className="bg-muted/30 border-none">
         <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
               <Info className="h-4 w-4" />
               什么是 KeyCode？
            </CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-muted-foreground">
            <p>虽然 `keyCode` 在现代 Web 开发中已被废弃，推荐使用 `key` 和 `code`，但许多旧系统和特定的底层交互仍在使用它。`key` 代表字符本身，而 `code` 代表键盘上的物理位置。</p>
         </CardContent>
      </Card>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-4 rounded-xl bg-card border flex flex-col items-center justify-center space-y-1">
       <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{label}</span>
       <span className="font-mono font-bold text-lg">{value}</span>
    </div>
  );
}

function ModifierTag({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`px-4 py-2 rounded-full border-2 font-bold transition-all duration-300 ${
      active ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg" : "border-muted text-muted-foreground opacity-30"
    }`}>
      {label}
    </div>
  );
}
