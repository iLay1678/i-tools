"use client";

import { useMemo, useState } from "react";
import { Terminal, Copy, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { generateAxios, generateFetch, generatePython, parseCurl } from "@/lib/curl";

type Target = "fetch" | "axios" | "python";

const SAMPLE = `curl 'https://api.example.com/v1/users' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token' \\
  -d '{"name":"Alice","age":30}'`;

const FILE_NAMES: Record<Target, string> = {
  fetch: "request.js",
  axios: "axios.js",
  python: "request.py",
};

export default function CurlConverterPage() {
  const [input, setInput] = useState("");
  const [target, setTarget] = useState<Target>("fetch");

  const parsed = useMemo(() => (input.trim() ? parseCurl(input) : null), [input]);

  const code = useMemo(() => {
    if (!parsed || !parsed.ok) return "";
    if (target === "fetch") return generateFetch(parsed.request);
    if (target === "axios") return generateAxios(parsed.request);
    return generatePython(parsed.request);
  }, [parsed, target]);

  const warnings = parsed ? parsed.warnings : [];

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadText = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 shadow-lg">
          <Terminal className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">curl 转代码</h1>
          <p className="text-muted-foreground">把 curl 命令转成 fetch / axios / requests 代码</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">curl 命令</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)} className="gap-2">
              <Wand2 className="h-4 w-4" />
              填入示例
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请粘贴 curl 命令，支持多行与反斜杠续行..."
              className="min-h-70 font-mono text-sm resize-none bg-muted/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {parsed && !parsed.ok && (
              <Alert variant="destructive">
                <AlertTitle>无法转换</AlertTitle>
                <AlertDescription>{parsed.error}</AlertDescription>
              </Alert>
            )}
            {warnings.length > 0 && (
              <Alert>
                <AlertTitle>已忽略的参数</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {warnings.map((item, index) => (
                      <li key={`${item.flag}-${index}`}>
                        <code className="font-mono">{item.flag}</code>：{item.reason}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">生成代码</CardTitle>
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
                <TabsTrigger value="fetch">fetch</TabsTrigger>
                <TabsTrigger value="axios">axios</TabsTrigger>
                <TabsTrigger value="python">requests</TabsTrigger>
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
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-4 space-y-1">
            <li>支持 -X / -H / -d / --data-raw / -u / -b / --compressed / --json 等参数</li>
            <li>重复的 -H 会合并为同一请求头对象</li>
            <li>多行命令与 \ 续行均可正确解析</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
            <li>本工具仅在本地做文本转换，绝不发起任何网络请求</li>
            <li>-F / --form（multipart）暂不支持，会明确提示</li>
            <li>-d @file 不会读取本地文件，请直接粘贴内容</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
