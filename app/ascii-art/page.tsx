"use client";

import React, { useState, useEffect } from "react";
import figlet from "figlet";
// @ts-ignore
import standardFont from "figlet/importable-fonts/Standard.js";
// @ts-ignore
import ghostFont from "figlet/importable-fonts/Ghost.js";
// @ts-ignore
import slantFont from "figlet/importable-fonts/Slant.js";
// @ts-ignore
import bubbleFont from "figlet/importable-fonts/Bubble.js";
// @ts-ignore
import bannerFont from "figlet/importable-fonts/Banner.js";
// @ts-ignore
import bigFont from "figlet/importable-fonts/Big.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Register fonts
figlet.parseFont("Standard", standardFont);
figlet.parseFont("Ghost", ghostFont);
figlet.parseFont("Slant", slantFont);
figlet.parseFont("Bubble", bubbleFont);
figlet.parseFont("Banner", bannerFont);
figlet.parseFont("Big", bigFont);

const FONTS = ["Standard", "Ghost", "Slant", "Bubble", "Banner", "Big"];

export default function AsciiArtPage() {
  const [text, setText] = useState("i-Tools");
  const [font, setFont] = useState("Standard");
  const [output, setOutput] = useState("");

  useEffect(() => {
    figlet.text(
      text,
      {
        font: font as any,
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      },
      function (err, data) {
        if (err) {
          console.log("Something went wrong...");
          console.dir(err);
          return;
        }
        setOutput(data || "");
      }
    );
  }, [text, font]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-green-700 shadow-lg">
          <Terminal className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ASCII 艺术生成</h1>
          <p className="text-muted-foreground">将文本转换为复古的字符画风格</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>输入文本</Label>
                        <Input 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder="Type something..."
                            maxLength={20}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>字体风格</Label>
                        <Select value={font} onValueChange={setFont}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FONTS.map(f => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>预览结果</CardTitle>
                <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="h-4 w-4 mr-2" />
                    复制
                </Button>
            </CardHeader>
            <CardContent>
                <div className="relative rounded-lg bg-black p-4 overflow-x-auto">
                    <pre className="text-green-500 font-mono text-sm leading-none whitespace-pre select-all">
                        {output || "Generating..."}
                    </pre>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
