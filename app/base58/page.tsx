"use client";

import { useState } from "react";
import { Binary, Copy, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Base58 alphabet (Bitcoin style)
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ALPHABET_MAP = ALPHABET.split('').reduce((map, char, index) => {
  map[char] = index;
  return map;
}, {} as { [key: string]: number });

export default function Base58Page() {
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

  // Helper: Text -> Bytes
  const textToBytes = (text: string) => {
    const encoder = new TextEncoder();
    return encoder.encode(text);
  };

  // Helper: Bytes -> Text
  const bytesToText = (bytes: Uint8Array) => {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  };

  // Encode
  const encode = () => {
    if (!input) return;
    const bytes = textToBytes(input);
    if (bytes.length === 0) return "";
    
    let digits = [0];
    for (let i = 0; i < bytes.length; i++) {
        for (let j = 0; j < digits.length; j++) digits[j] <<= 8;
        digits[0] += bytes[i];
        let carry = 0;
        for (let j = 0; j < digits.length; ++j) {
            digits[j] += carry;
            carry = (digits[j] / 58) | 0;
            digits[j] %= 58;
        }
        while (carry) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }
    
    // Deal with leading zeros
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) digits.push(0);
    
    const result = digits.reverse().map(d => ALPHABET[d]).join("");
    setInput(result);
    toast.success("已编码为 Base58");
  };

  // Decode
  const decode = () => {
    if (!input) return;
    const bytes = [0];
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (!(c in ALPHABET_MAP)) {
            toast.error("无效的 Base58 字符");
            return;
        }
        for (let j = 0; j < bytes.length; j++) bytes[j] *= 58;
        bytes[0] += ALPHABET_MAP[c];
        let carry = 0;
        for (let j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }
        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    
    // Deal with leading zeros (represented by '1' in Base58 Bitcoin)
    for (let i = 0; i < input.length && input[i] === '1'; i++) bytes.push(0);

    const result = bytesToText(new Uint8Array(bytes.reverse()));
    setInput(result);
    toast.success("已解码为文本");
  };

  const clearAll = () => setInput("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
          <Binary className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Base58 编解码</h1>
          <p className="text-muted-foreground">比特币风格 Base58 文本转换</p>
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
              className="min-h-[250px] font-mono text-base resize-y"
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
            <span className="text-xl">💡</span> Base58 说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Base58 是一种基于文本的二进制编码格式。它类似于 Base64，但去除了容易混淆的字符（0, O, I, l）以及非字母数字字符（+, /），使其更适合人工识别和复制。</p>
            <p>本工具使用比特币标准的字母表：<code>123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
