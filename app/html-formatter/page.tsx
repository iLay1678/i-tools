"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { html_beautify } from "js-beautify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode, Copy, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function HtmlFormatterPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [wrapLineLength, setWrapLineLength] = useState("80");

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const formatted = html_beautify(input, {
        indent_size: parseInt(indentSize),
        wrap_line_length: parseInt(wrapLineLength),
        preserve_newlines: true,
        indent_inner_html: true,
      });
      setOutput(formatted);
      toast.success("HTML 格式化成功");
    } catch {
      toast.error("HTML 格式化失败");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600 shadow-lg">
          <FileCode className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HTML 格式化</h1>
          <p className="text-muted-foreground">美化和清理 HTML 代码</p>
        </div>
      </div>

      {/* Options */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-6 items-end">
            <div className="space-y-2">
                <Label>缩进大小</Label>
                <Select value={indentSize} onValueChange={setIndentSize}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2">2 空格</SelectItem>
                        <SelectItem value="4">4 空格</SelectItem>
                        <SelectItem value="8">8 空格</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label>换行宽度</Label>
                <Select value={wrapLineLength} onValueChange={setWrapLineLength}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">不换行</SelectItem>
                        <SelectItem value="80">80 字符</SelectItem>
                        <SelectItem value="120">120 字符</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleFormat} className="gap-2">
                格式化 <ArrowRight className="h-4 w-4" />
            </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">输入 HTML</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 h-125">
             <Editor
                height="100%"
                defaultLanguage="html"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={input}
                onChange={(value) => setInput(value || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on"
                }}
             />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">结果</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-muted/30 h-125">
             <Editor
                height="100%"
                defaultLanguage="html"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={output}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on"
                }}
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
