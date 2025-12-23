"use client";

import React, { useState, useCallback } from "react";
import { Scissors, Copy, Eraser, FileText, CheckCircle, Trash2, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TextFormatterPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [removeSpaces, setRemoveSpaces] = useState(true);
  const [removeLineBreaks, setRemoveLineBreaks] = useState(true);
  const [removeExtraWhitespace, setRemoveExtraWhitespace] = useState(true);

  const [stats, setStats] = useState({
    originalChars: 0,
    originalLines: 0,
    formattedChars: 0,
    formattedLines: 0,
    spacesRemoved: 0,
    lineBreaksRemoved: 0,
  });

  const calculateStats = useCallback((original: string, formatted: string) => {
    const originalChars = original.length;
    const originalLines = original.split("\n").length;
    const formattedChars = formatted.length;
    const formattedLines = formatted.split("\n").length;

    const originalSpaces = (original.match(/\s/g) || []).length;
    const formattedSpaces = (formatted.match(/\s/g) || []).length;
    const spacesRemoved = originalSpaces - formattedSpaces;

    const lineBreaksRemoved = Math.max(0, originalLines - formattedLines);

    setStats({
      originalChars,
      originalLines,
      formattedChars,
      formattedLines,
      spacesRemoved,
      lineBreaksRemoved,
    });
  }, []);

  const formatText = useCallback(() => {
    if (!inputText.trim()) {
      toast.warning("请输入需要格式化的文本");
      return;
    }

    let formatted = inputText;

    if (removeLineBreaks) {
      formatted = formatted.replace(/\r?\n/g, "");
    }

    if (removeSpaces) {
      formatted = formatted.replace(/\s+/g, "");
    } else if (removeExtraWhitespace) {
      formatted = formatted.replace(/\s+/g, " ").trim();
    }

    setOutputText(formatted);
    calculateStats(inputText, formatted);
    toast.success("文本格式化完成");
  }, [
    inputText,
    removeSpaces,
    removeLineBreaks,
    removeExtraWhitespace,
    calculateStats,
  ]);

  const copyResult = useCallback(async () => {
    if (!outputText) {
      toast.warning("没有可复制的内容");
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  }, [outputText]);

  const clearAll = useCallback(() => {
    setInputText("");
    setOutputText("");
    setStats({
      originalChars: 0,
      originalLines: 0,
      formattedChars: 0,
      formattedLines: 0,
      spacesRemoved: 0,
      lineBreaksRemoved: 0,
    });
  }, []);

  const quickClean = useCallback(() => {
    if (!inputText.trim()) {
      toast.warning("请输入需要格式化的文本");
      return;
    }

    const formatted = inputText
      .replace(/\r?\n/g, "")
      .replace(/\t/g, "")
      .replace(/\s+/g, "")
      .trim();

    setOutputText(formatted);
    calculateStats(inputText, formatted);
    toast.success("快速清理完成");
  }, [inputText, calculateStats]);

  const handleInputChange = useCallback((value: string) => {
    setInputText(value);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-rose-600 shadow-lg">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文字格式化工具</h1>
          <p className="text-muted-foreground">
            去除复制文本的格式、空格和换行，还原纯净文字内容
          </p>
        </div>
      </div>

      {/* Options Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">格式化选项</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="removeSpaces"
                checked={removeSpaces}
                onCheckedChange={setRemoveSpaces}
              />
              <Label htmlFor="removeSpaces">移除所有空格</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="removeLineBreaks"
                checked={removeLineBreaks}
                onCheckedChange={setRemoveLineBreaks}
              />
              <Label htmlFor="removeLineBreaks">移除换行符</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="removeExtraWhitespace"
                checked={removeExtraWhitespace}
                onCheckedChange={setRemoveExtraWhitespace}
                disabled={removeSpaces}
              />
              <Label htmlFor="removeExtraWhitespace" className={removeSpaces ? "text-muted-foreground" : ""}>
                移除多余空白
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Button onClick={formatText} disabled={!inputText.trim()} className="gap-2">
            <Paintbrush className="h-4 w-4" />
            格式化文本
          </Button>
          <Button
            variant="secondary"
            onClick={quickClean}
            disabled={!inputText.trim()}
            className="gap-2"
          >
            <Scissors className="h-4 w-4" />
            快速清理
          </Button>
          <Button
            variant="outline"
            onClick={copyResult}
            disabled={!outputText}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            复制结果
          </Button>
          <Button
            variant="ghost"
            onClick={clearAll}
            className="gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <Eraser className="h-4 w-4" />
            清空
          </Button>
        </CardContent>
      </Card>

      {/* Stats Panel */}
      {(inputText || outputText) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                原始字符数
              </div>
              <div className="text-2xl font-bold">{stats.originalChars}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                格式化后
              </div>
              <div className="text-2xl font-bold text-emerald-500">{stats.formattedChars}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Trash2 className="h-3 w-3" />
                移除空格
              </div>
              <div className="text-2xl font-bold text-cyan-500">{stats.spacesRemoved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Scissors className="h-3 w-3" />
                移除换行
              </div>
              <div className="text-2xl font-bold text-violet-500">{stats.lineBreaksRemoved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>输入文本</span>
              {inputText.trim() && (
                <Badge variant="secondary">
                  {stats.originalChars} 字符
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请粘贴需要格式化的文本..."
              className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>格式化结果</span>
              {outputText && (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                    {stats.formattedChars} 字符
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyResult}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 bg-muted/30">
            <Textarea
              value={outputText}
              readOnly
              placeholder="格式化后的纯文本将显示在这里..."
              className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4 bg-transparent"
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
              <h4 className="font-semibold text-sm">主要功能</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li><strong>去除格式：</strong>清除文本中的各种格式信息</li>
                <li><strong>移除空格：</strong>删除文字间的所有空格字符</li>
                <li><strong>移除换行：</strong>去除文本中的换行符，合并为单行</li>
                <li><strong>统计分析：</strong>显示处理前后的字符数变化</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">使用场景</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>处理从Word、PDF复制的文本</li>
                <li>清理网页复制的带格式文本</li>
                <li>去除邮件内容中的多余换行</li>
                <li>整理聊天记录或文档片段</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
