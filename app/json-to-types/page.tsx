"use client";

import { useMemo, useState } from "react";
import { Braces, Copy, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  analyzeJson,
  generateGo,
  generateRust,
  generateTypeScript,
  type NamingStyle,
} from "@/lib/json-to-types";

type Target = "ts" | "go" | "rust";

const SAMPLE = `{
  "id": 1,
  "name": "Alice",
  "active": true,
  "tags": [],
  "profile": { "city": "Beijing", "age": 30 },
  "items": [
    { "sku": "A", "price": 1.5 },
    { "sku": "B", "qty": 2 }
  ]
}`;

const FILE_NAMES: Record<Target, string> = { ts: "types.ts", go: "types.go", rust: "types.rs" };

export default function JsonToTypesPage() {
  const [text, setText] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [naming, setNaming] = useState<NamingStyle>("preserve");
  const [target, setTarget] = useState<Target>("ts");

  const analysis = useMemo(
    () => (text.trim() ? analyzeJson(text, { rootName, naming }) : null),
    [text, rootName, naming],
  );

  const code = useMemo(() => {
    if (!analysis || !analysis.ok) return "";
    const options = { rootName, naming };
    if (target === "ts") return generateTypeScript(analysis.result, options);
    if (target === "go") return generateGo(analysis.result, options);
    return generateRust(analysis.result, options);
  }, [analysis, target, rootName, naming]);

  const typeCount = analysis && analysis.ok ? analysis.result.typeCount : 0;

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadText = (content: string, filename: string, mime = "text/plain;charset=utf-8") => {
    if (!content) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("下载已开始");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg">
          <Braces className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">JSON 转类型</h1>
          <p className="text-muted-foreground">粘贴 JSON，一键生成 TS / Go / Rust 类型定义</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">JSON 输入</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)} className="gap-2">
              <Wand2 className="h-4 w-4" />
              填入示例
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请在此粘贴 JSON 内容..."
              className="min-h-60 font-mono text-sm resize-none bg-muted/30"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rootName">根类型名</Label>
                <Input
                  id="rootName"
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value)}
                  placeholder="Root"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>字段命名风格</Label>
                <Select value={naming} onValueChange={(v) => setNaming(v as NamingStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preserve">保持原样</SelectItem>
                    <SelectItem value="camelCase">camelCase</SelectItem>
                    <SelectItem value="snake_case">snake_case</SelectItem>
                    <SelectItem value="PascalCase">PascalCase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {analysis && !analysis.ok && (
              <Alert variant="destructive">
                <AlertTitle>无法解析</AlertTitle>
                <AlertDescription>
                  {analysis.error.message}
                  {typeof analysis.error.position === "number"
                    ? `（第 ${analysis.error.position} 个字符附近）`
                    : ""}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              生成结果
              {typeCount > 0 && <Badge variant="secondary">{typeCount} 个类型</Badge>}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)} disabled={!code}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadText(code, FILE_NAMES[target])}
                disabled={!code}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={target} onValueChange={(v) => setTarget(v as Target)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ts">TypeScript</TabsTrigger>
                <TabsTrigger value="go">Go</TabsTrigger>
                <TabsTrigger value="rust">Rust</TabsTrigger>
              </TabsList>
            </Tabs>
            <Textarea
              readOnly
              value={code}
              placeholder="生成结果将显示在这里..."
              className="min-h-90 font-mono text-xs resize-none bg-muted/30"
            />
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 类型推断规则
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-4 space-y-1">
            <li>嵌套对象生成命名子类型（如 Root_Profile）</li>
            <li>数组取所有元素类型并集，缺失字段标记可选</li>
            <li>空数组推断为 unknown[] / []interface{} / Vec&lt;serde_json::Value&gt;</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
            <li>数字统一按 number / float64 / f64（不做整数推断）</li>
            <li>null 映射为 TS null、Go interface{}、Rust Option</li>
            <li>结构过深（&gt;20 层）或过大（&gt;5 万节点）会中止并提示</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
