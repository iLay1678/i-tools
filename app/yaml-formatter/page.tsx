"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import yaml from "js-yaml";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, Copy, Check, RotateCcw, ArrowRight, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

export default function YamlFormatterPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const obj = yaml.load(input);
      const formatted = yaml.dump(obj, { indent: 2 });
      setOutput(formatted);
      setIsValid(true);
      setErrorMsg("");
      toast.success("YAML 格式化成功");
    } catch (e: any) {
      setIsValid(false);
      setErrorMsg(e.message);
      toast.error("YAML 解析失败");
    }
  };

  const handleValidation = () => {
    if (!input.trim()) return;
    try {
      yaml.load(input);
      setIsValid(true);
      setErrorMsg("");
      toast.success("YAML 格式正确");
    } catch (e: any) {
      setIsValid(false);
      setErrorMsg(e.message);
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
          <FileJson className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">YAML 格式化</h1>
          <p className="text-muted-foreground">格式化、验证和美化 YAML 数据</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">输入</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative h-125">
             <Editor
                height="100%"
                defaultLanguage="yaml"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={input}
                onChange={(value) => setInput(value || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on"
                }}
             />
             {errorMsg && (
                <div className="absolute bottom-0 left-0 right-0 bg-destructive/10 text-destructive text-xs p-2 border-t border-destructive/20 backdrop-blur-sm">
                    {errorMsg}
                </div>
             )}
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
                结果
                {isValid === true && (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                         <Check className="h-3 w-3 mr-1" /> 格式正确
                    </Badge>
                )}
                {isValid === false && (
                    <Badge variant="destructive">
                         <XCircle className="h-3 w-3 mr-1" /> 格式错误
                    </Badge>
                )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-muted/30 h-125">
             <Editor
                height="100%"
                defaultLanguage="yaml"
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

      <div className="flex justify-center gap-4">
        <Button size="lg" onClick={handleValidation} variant="secondary">
          仅验证
        </Button>
        <Button size="lg" onClick={handleFormat}>
          格式化 YAML <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
