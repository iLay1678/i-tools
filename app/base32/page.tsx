"use client";

import { useState } from "react";
import { Binary, Copy, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// RFC 4648 Base32 alphabet
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ALPHABET_MAP = ALPHABET.split('').reduce((map, char, index) => {
  map[char] = index;
  return map;
}, {} as { [key: string]: number });

export default function Base32Page() {
  const [input, setInput] = useState("");

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const encode = () => {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        let bits = 0;
        let value = 0;
        let output = "";

        for (let i = 0; i < data.length; i++) {
            value = (value << 8) | data[i];
            bits += 8;
            while (bits >= 5) {
                output += ALPHABET[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
        }
        if (bits > 0) {
            output += ALPHABET[(value << (5 - bits)) & 31];
        }
        
        // Padding
        while (output.length % 8 !== 0) {
            output += "=";
        }

        setInput(output);
        toast.success("已编码为 Base32");
    } catch {
        toast.error("编码失败");
    }
  };

  const decode = () => {
    try {
        let val = input.toUpperCase().replace(/=+$/, "");
        let bits = 0;
        let value = 0;
        let index = 0;
        const output = new Uint8Array((val.length * 5) / 8 | 0);

        for (let i = 0; i < val.length; i++) {
            if (!(val[i] in ALPHABET_MAP)) throw new Error("Invalid character");
            value = (value << 5) | ALPHABET_MAP[val[i]];
            bits += 5;
            if (bits >= 8) {
                output[index++] = (value >>> (bits - 8)) & 0xFF;
                bits -= 8;
            }
        }
        
        const decoder = new TextDecoder();
        setInput(decoder.decode(output));
        toast.success("已解码为文本");
    } catch {
        toast.error("解码失败：无效的 Base32 字符串");
    }
  };

  const clearAll = () => setInput("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600 shadow-lg">
          <Binary className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Base32 编解码</h1>
          <p className="text-muted-foreground">RFC 4648 标准 Base32 文本转换</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">输入/输出文本</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(input)} disabled={!input}>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={!input} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                清空
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="请输入需要编解码的内容..."
              className="min-h-62.5 font-mono text-base resize-y"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={encode} size="lg" className="flex-1 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            编码 (Encode)
          </Button>
          <Button onClick={decode} size="lg" variant="outline" className="flex-1 gap-2">
            <ArrowUpDown className="h-4 w-4" />
            解码 (Decode)
          </Button>
        </div>
      </div>
      
       {/* Info Card */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> Base32 说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Base32 使用 32 个字符的集合（A-Z 和 2-7）来表示二进制数据。它常用于无需区分大小写的文件系统或人工输入的场景。</p>
            <p>本工具遵循 RFC 4648 标准。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
