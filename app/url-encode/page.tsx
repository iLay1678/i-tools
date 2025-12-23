"use client";

import { useState } from "react";
import { Link, ArrowLeftRight, Copy, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function UrlEncodePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleEncode = () => {
    if (!input) {
      toast.warning("请输入要编码的内容");
      return;
    }
    try {
      const encoded = encodeURIComponent(input);
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
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
      toast.success("解码成功");
    } catch {
      toast.error("解码失败，请检查输入是否为有效的 URL 编码字符串");
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
          <Link className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">URL 编解码</h1>
          <p className="text-muted-foreground">
            URL 参数编码与解码，处理特殊字符
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "encode" | "decode")}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">编码</TabsTrigger>
              <TabsTrigger value="decode">解码</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleConvert} className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            {mode === "encode" ? "编码" : "解码"}
          </Button>
          <Button variant="outline" onClick={swapInputOutput} className="gap-2">
            <ArrowLeftRight className="h-4 w-4 rotate-90" />
            交换
          </Button>
          <Button variant="ghost" onClick={clearAll} className="gap-2">
            <Eraser className="h-4 w-4" />
            清空
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {mode === "encode" ? "原始文本" : "URL 编码字符串"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "请输入要编码的文本，如：你好 世界"
                  : "请输入要解码的 URL 编码字符串，如：%E4%BD%A0%E5%A5%BD"
              }
              className="min-h-[300px] font-mono text-sm resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {mode === "encode" ? "URL 编码结果" : "解码结果"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              复制
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="min-h-[300px] font-mono text-sm bg-muted/50 resize-none"
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
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>URL 编码用于处理 URL 中的特殊字符和非 ASCII 字符</li>
                <li>空格会被编码为 %20</li>
                <li>中文字符会被编码为 UTF-8 格式的百分号编码</li>
              </ul>
            </div>
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>使用 encodeURIComponent 进行编码</li>
                <li>保留字符如 - _ . ! ~ * ' ( ) 不会被编码</li>
                <li>常用于构建 URL 查询参数</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
