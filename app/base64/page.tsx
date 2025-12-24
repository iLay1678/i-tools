"use client";

import { useState } from "react";
import { Lock, ArrowRightLeft, Copy, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";


export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleEncode = () => {
    if (!input) {
      toast.warning("请输入要编码的内容");
      return;
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      toast.success("编码成功");
    } catch {
      toast.error("编码失败");
    }
  };

  const handleDecode = () => {
    if (!input) {
      toast.warning("请输入要解码的内容");
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      toast.success("解码成功");
    } catch {
      toast.error("解码失败，请检查输入是否为有效的 Base64 字符串");
    }
  };

  const handleConvert = () => {
    if (mode === "encode") {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const copyToClipboard = async () => {
    if (!output) {
      toast.warning("没有可复制的内容");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  const swapInputOutput = () => {
    setInput(output);
    setOutput("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Base64 编解码</h1>
          <p className="text-muted-foreground">
            Base64 编码与解码转换工具，支持中文
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-4 rounded-lg border">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
          <TabsList>
            <TabsTrigger value="encode">编码</TabsTrigger>
            <TabsTrigger value="decode">解码</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Button onClick={handleConvert} className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            {mode === "encode" ? "编码" : "解码"}
          </Button>
          <Button variant="outline" onClick={swapInputOutput} className="gap-2">
            <ArrowRightLeft className="h-4 w-4 rotate-90" />
            交换
          </Button>
          <Button variant="ghost" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive">
            <Eraser className="h-4 w-4" />
            清空
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {mode === "encode" ? "原始文本" : "Base64 字符串"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-75">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "请输入要编码的文本..."
                    : "请输入要解码的 Base64 字符串..."
                }
                className="h-full min-h-75 font-mono resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-medium">
                {mode === "encode" ? "Base64 结果" : "解码结果"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={copyToClipboard}
              >
                <Copy className="h-3 w-3" />
                复制
              </Button>
            </CardHeader>
            <CardContent className="flex-1 min-h-75">
              <Textarea
                value={output}
                readOnly
                placeholder="转换结果将显示在这里..."
                className="h-full min-h-75 font-mono resize-none bg-muted/50"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>Base64 是一种基于 64 个可打印字符来表示二进制数据的编码方式</li>
                <li>常用于在 URL、Cookie 中传输少量二进制数据</li>
                <li>本工具支持中文编码和解码</li>
              </ul>
            </div>
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>编码后的数据比原始数据大约 33%</li>
                <li>Base64 不是加密算法，仅是一种编码方式</li>
                <li>点击"交换"可将输出结果作为新的输入</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
