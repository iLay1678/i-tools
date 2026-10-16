"use client";

import { useMemo, useState } from "react";
import { Search, Copy, Wand2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { evaluateQuery, type QueryMode } from "@/lib/jsonpath";

const SAMPLE_JSON = JSON.stringify(
  {
    store: {
      name: "示例书店",
      book: [
        { title: "TypeScript 入门", price: 8 },
        { title: "React 实践", price: 12 },
        { title: "Go 并发", price: 5 },
      ],
    },
  },
  null,
  2,
);

const SAMPLE_EXPR: Record<QueryMode, string> = {
  jsonpath: "$.store.book[?(@.price < 10)].title",
  jq: ".store.book[].title",
};

export default function JqPage() {
  const [jsonText, setJsonText] = useState("");
  const [expr, setExpr] = useState("");
  const [mode, setMode] = useState<QueryMode>("jsonpath");

  const parsedJson = useMemo(() => {
    if (!jsonText.trim()) return { ok: false as const, error: "" };
    try {
      return { ok: true as const, value: JSON.parse(jsonText) as unknown };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : "JSON 解析失败" };
    }
  }, [jsonText]);

  const evaluation = useMemo(() => {
    if (!parsedJson.ok || !expr.trim()) return null;
    return evaluateQuery(parsedJson.value, expr, mode);
  }, [parsedJson, expr, mode]);

  const count = evaluation && evaluation.ok ? evaluation.result.count : 0;
  const matches = evaluation && evaluation.ok ? evaluation.result.matches : [];

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg">
          <Search className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">JSONPath / jq 查询</h1>
          <p className="text-muted-foreground">用 JSONPath 子集或简化 jq 路径查询 JSON 数据</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">JSON 数据</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setJsonText(SAMPLE_JSON)} className="gap-2">
                <Wand2 className="h-4 w-4" />
                示例
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setJsonText("")} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请在此粘贴 JSON 数据..."
              className="min-h-70 font-mono text-sm resize-none bg-muted/30"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            {parsedJson && !parsedJson.ok && jsonText.trim() && (
              <Alert variant="destructive">
                <AlertTitle>JSON 解析失败</AlertTitle>
                <AlertDescription>{parsedJson.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Query */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">查询表达式</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpr(SAMPLE_EXPR[mode])}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              示例
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as QueryMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jsonpath">JSONPath</TabsTrigger>
                <TabsTrigger value="jq">jq 风格</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              <Label htmlFor="expr">表达式</Label>
              <Input
                id="expr"
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                placeholder={mode === "jsonpath" ? "$.store.book[*].title" : ".store.book[].title"}
                className="font-mono"
              />
            </div>
            {evaluation && !evaluation.ok && (
              <Alert variant="destructive">
                <AlertTitle>表达式不合法</AlertTitle>
                <AlertDescription>
                  {evaluation.error.message}（第 {evaluation.error.position} 个字符附近）
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            查询结果
            {evaluation && evaluation.ok && <Badge variant="secondary">命中 {count} 项</Badge>}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(matches, null, 2))}
            disabled={count === 0}
          >
            <Copy className="h-4 w-4 mr-2" />
            复制结果
          </Button>
        </CardHeader>
        <CardContent>
          {!evaluation && (
            <p className="text-sm text-muted-foreground">输入 JSON 与表达式后自动查询。</p>
          )}
          {evaluation && evaluation.ok && count === 0 && (
            <p className="text-sm text-muted-foreground">无匹配结果。</p>
          )}
          {evaluation && evaluation.ok && count > 0 && (
            <div className="space-y-2 max-h-100 overflow-auto">
              {matches.map((item, index) => (
                <pre
                  key={index}
                  className="rounded-md bg-muted/50 border p-3 text-xs font-mono overflow-auto"
                >
                  {JSON.stringify(item, null, 2)}
                </pre>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 支持的语法
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-4 space-y-1">
            <li>根 $、子访问 .key 与 [&apos;key&apos;]</li>
            <li>数组下标 [0]、负下标 [-1]、切片 [1:3]</li>
            <li>通配 *、递归下降 ..、联合 [0,2]</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
            <li>过滤器 [?(@.price &lt; 10)]，支持 &amp;&amp; 与 ||</li>
            <li>jq 风格：.a.b、.a[]、.[1:3]、管道 |</li>
            <li>递归下降设有 10 万节点访问上限，防止卡顿</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
