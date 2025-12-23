"use client";

import { useState } from "react";
import { Timer, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CronPage() {
  const [expression, setExpression] = useState("*/5 * * * *");
  
  const parts = expression.split(/\s+/);
  const labels = ["分钟", "小时", "日期", "月份", "星期"];
  
  const decodePart = (part: string, type: string) => {
    if (!part) return "-";
    if (part === "*") return `每${type}`;
    if (part.includes("/")) {
      const [start, step] = part.split("/");
      return `每隔 ${step} ${type}${start !== "*" ? ` (从第 ${start} 开始)` : ""}`;
    }
    if (part.includes("-")) {
      return `从 ${part.replace("-", " 到 ")} ${type}`;
    }
    if (part.includes(",")) {
      return `第 ${part} ${type}`;
    }
    return `第 ${part} ${type}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600 shadow-lg">
          <Timer className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cron 表达式解析</h1>
          <p className="text-muted-foreground">解析并说明 Cron 计划任务表达式</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">输入表达式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input 
                value={expression} 
                onChange={(e) => setExpression(e.target.value)}
                placeholder="如: */5 * * * *"
                className="font-mono text-lg"
              />
              <Button onClick={() => toast.success("解析成功")}>解析</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-5 gap-4">
          {labels.map((label, i) => (
            <Card key={label} className="bg-muted/30 border-none">
              <CardContent className="pt-6 text-center space-y-2">
                <p className="text-xs text-muted-foreground font-bold">{label}</p>
                <p className="font-mono text-xl font-bold text-primary">{parts[i] || "*"}</p>
                <p className="text-xs text-muted-foreground">{decodePart(parts[i], label)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              解析说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-lg">
                   该表达式意味着：
                   <span className="font-bold text-primary ml-2">
                      {parts.length >= 5 
                        ? labels.map((l, i) => decodePart(parts[i], l)).join("，") 
                        : "请输入完整的 5 位 Cron 表达式"}
                   </span>
                </p>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                   <p className="font-bold text-foreground">*</p>
                   <p>匹配该字段的所有值</p>
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-foreground">/n</p>
                   <p>指定数值增量 (每隔 n)</p>
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-foreground">-</p>
                   <p>指定数值范围 (从 x 到 y)</p>
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-foreground">,</p>
                   <p>指定多个值</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
