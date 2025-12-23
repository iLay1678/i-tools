"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FerrisWheel, Trophy, X } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#a3e635", 
  "#34d399", "#22d3ee", "#818cf8", "#e879f9"
];

export default function WheelPage() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [items, setItems] = useState<string[]>(["今晚吃火锅", "去看电影", "写代码", "早点睡觉", "打游戏", "喝奶茶"]);
  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);

  const [winner, setWinner] = useState<string | null>(null);

  // Animation Refs
  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const requestRef = useRef<number>(0);
  
  // Draw Wheel
  const drawLine = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
     ctx.clearRect(0, 0, center * 2, center * 2);
     const total = items.length;
     const arc = (2 * Math.PI) / total;
     
     // Draw Slices
     for (let i = 0; i < total; i++) {
         const angle = rotationRef.current + i * arc;
         ctx.beginPath();
         ctx.fillStyle = COLORS[i % COLORS.length];
         ctx.moveTo(center, center);
         ctx.arc(center, center, radius, angle, angle + arc);
         ctx.lineTo(center, center);
         ctx.fill();
         ctx.stroke();

         // Text
         ctx.save();
         ctx.translate(center, center);
         ctx.rotate(angle + arc / 2);
         ctx.textAlign = "right";
         ctx.fillStyle = "#fff";
         ctx.font = "bold 14px Arial";
         ctx.fillText(items[i], radius - 20, 5);
         ctx.restore();
     }

     // Draw Pointer
     ctx.beginPath();
     ctx.fillStyle = "white";
     ctx.moveTo(center + radius - 10, center);
     ctx.lineTo(center + radius + 15, center - 10);
     ctx.lineTo(center + radius + 15, center + 10);
     ctx.fill();
     ctx.strokeStyle = "#333";
     ctx.stroke();
     
     // Center Circle
     ctx.beginPath();
     ctx.arc(center, center, 20, 0, 2 * Math.PI);
     ctx.fillStyle = "white";
     ctx.fill();
     ctx.stroke();
  };

  const animate = () => {
    if (speedRef.current > 0.001) {
        speedRef.current *= 0.985; // Friction
        rotationRef.current += speedRef.current;
        rotationRef.current %= 2 * Math.PI;
        
        const canvas = canvasRef.current;
        if (canvas) {
           const ctx = canvas.getContext("2d");
           if (ctx) drawLine(ctx, 200, 180);
        }
        
        requestRef.current = requestAnimationFrame(animate);
    } else {
        setIsSpinning(false);
        cancelAnimationFrame(requestRef.current);
        
        // Calculate Winner
        const total = items.length;
        const arc = (2 * Math.PI) / total;
        // Pointer is at 0 degrees (right side), wheel rotates clockwise
        // Effective angle is (2PI - current_rotation) % 2PI
        // But we need to account for slice index
        // Let's simplify:
        // Angle of slice i is: current_rot + i * arc
        // We want to know which slice covers angle 0
        // (current_rot + i * arc) % 2PI needs to enclose 0 (or 2PI)
        
        let currentRot = rotationRef.current % (2 * Math.PI);
        if (currentRot < 0) currentRot += 2 * Math.PI; // normalize
        
        // The pointer is at 0 radians (right).
        // A slice i spans from [currentRot + i*arc] to [currentRot + (i+1)*arc]
        // We find i such that this range includes 0 or 2PI.
        // Actually simpler: Which index i corresponds to angle 0?
        // angle_i_start = currentRot + i * arc
        // We want angle_i_start <= 2PI*k <= angle_i_end
        
        // Let's invert: what angle corresponds to pointer (which is at 0 relative to canvas)
        // relative to wheel 0? -> -currentRot
        let pointerAngle = (0 - currentRot); 
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
        
        const winningIndex = Math.floor(pointerAngle / arc);
        const winItem = items[winningIndex % total];
        setWinner(winItem);
        toast.success(`结果揭晓：${winItem}！`);
    }
  };

  const spin = () => {
    if (items.length < 2) {
        toast.error("至少需要两个选项");
        return;
    }
    if (isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);
    speedRef.current = Math.random() * 0.3 + 0.4; // Initial speed
    animate();
  };

  useEffect(() => {
     const canvas = canvasRef.current;
     if (canvas) {
         const ctx = canvas.getContext("2d");
         if (ctx) {
             canvas.width = 400;
             canvas.height = 400;
             drawLine(ctx, 200, 180);
         }
     }
  }, [items]);

  const addItem = () => {
      if (newItem.trim()) {
          setItems([...items, newItem.trim()]);
          setNewItem("");
      }
  };

  const removeItem = (idx: number) => {
      setItems(items.filter((_, i) => i !== idx));
  };
  
  const clearItems = () => {
      if (confirm("确定要清空所有选项吗？")) setItems([]);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-rose-400 to-red-500 shadow-lg">
          <FerrisWheel className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">大转盘抽奖</h1>
          <p className="text-muted-foreground">帮你在多个选项中做出随机决定</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 flex flex-col items-center justify-center p-8 bg-muted/10">
             <div className="relative">
                 <canvas 
                    ref={canvasRef} 
                    className="max-w-full h-auto cursor-pointer"
                    onClick={spin}
                 />
                 {/* Center Button Override just in case */}
                 <button 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center font-bold text-gray-800 border-4 border-gray-100 hover:scale-105 transition-transform z-10"
                    onClick={spin}
                 >
                    {isSpinning ? "..." : "GO"}
                 </button>
             </div>

             {winner && (
                 <div className="mt-8 text-center animate-in zoom-in duration-300">
                     <p className="text-muted-foreground text-sm">恭喜选中</p>
                     <h2 className="text-3xl font-extrabold text-primary flex items-center gap-3 justify-center">
                         <Trophy className="h-8 w-8 text-yellow-500" />
                         {winner}
                     </h2>
                 </div>
             )}
        </Card>

        <Card className="lg:col-span-5 h-fit">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>选项列表 ({items.length})</span>
                    <Button variant="ghost" size="sm" onClick={clearItems} className="text-destructive hover:text-destructive">
                        清空
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                        placeholder="输入新选项..."
                    />
                    <Button onClick={addItem}>添加</Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-2 max-h-100 overflow-y-auto space-y-2 border">
                    {items.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            暂无选项，请添加
                        </div>
                    )}
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-background rounded shadow-xs border text-sm group">
                            <span className="truncate flex-1">{item}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(idx)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
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
  );
}
