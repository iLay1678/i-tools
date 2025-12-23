"use client";

import { useState } from "react";
import { FileSpreadsheet, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CsvJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const csvToJson = () => {
    try {
      if (!input.trim()) return;
      const lines = input.trim().split('\n');
      if (lines.length < 2) {
        toast.error("请输入至少包含标题和一行数据的 CSV");
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || "";
        });
        return obj;
      });
      
      setOutput(JSON.stringify(result, null, 2));
      toast.success("转换成功");
    } catch {
      toast.error("CSV 格式错误");
    }
  };

  const jsonToCsv = () => {
    try {
      if (!input.trim()) return;
      const data = JSON.parse(input);
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("JSON 必须是包含对象的数组");
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvLines = [
        headers.join(','),
        ...data.map(row => headers.map(h => row[h]).join(','))
      ];
      
      setOutput(csvLines.join('\n'));
      toast.success("转换成功");
    } catch {
      toast.error("JSON 格式错误或不是对象数组");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600 shadow-lg">
          <FileSpreadsheet className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CSV / JSON 互转</h1>
          <p className="text-muted-foreground">表格数据与 JSON 格式相互转换</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">输入区域</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
               <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请在此粘贴 CSV (逗号分隔) 或 JSON 数组..."
              className="min-h-75 font-mono text-sm resize-none bg-muted/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-4">
               <Button onClick={csvToJson} className="flex-1 gap-2">
                 CSV &rarr; JSON
               </Button>
               <Button onClick={jsonToCsv} variant="outline" className="flex-1 gap-2">
                 JSON &rarr; CSV
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">输出结果</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
               <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              placeholder="转换结果将显示在这里..."
              className="min-h-87 font-mono text-sm resize-none bg-muted/30"
              value={output}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
           <p>1. <strong>CSV &rarr; JSON</strong>: 第一行将被视为标题（Key），后续行为数据内容。</p>
           <p>2. <strong>JSON &rarr; CSV</strong>: JSON 必须是一个对象数组，第一个对象的属性名将作为 CSV 的标题。</p>
        </CardContent>
      </Card>
    </div>
  );
}
