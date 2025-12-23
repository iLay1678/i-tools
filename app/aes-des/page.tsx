"use client";

import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Unlock, Copy } from "lucide-react";
import { toast } from "sonner";

const ALGORITHMS = [
  { value: "AES", label: "AES" },
  { value: "DES", label: "DES" },
  { value: "TripleDES", label: "TripleDES" },
  { value: "Rabbit", label: "Rabbit" },
  { value: "RC4", label: "RC4" },
];

export default function AesDesPage() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [algorithm, setAlgorithm] = useState("AES");
  const [output, setOutput] = useState("");

  const handleProcess = (mode: "encrypt" | "decrypt") => {
    if (!input) return;
    if (!key) {
        toast.error("请输入密钥");
        return;
    }

    try {
        let result = "";
        const algo = (CryptoJS as any)[algorithm];

        if (mode === "encrypt") {
            result = algo.encrypt(input, key).toString();
            toast.success("加密成功");
        } else {
            const bytes = algo.decrypt(input, key);
            result = bytes.toString(CryptoJS.enc.Utf8);
            if (!result) throw new Error("解密失败（可能是密钥错误）");
            toast.success("解密成功");
        }
        setOutput(result);
    } catch (e: any) {
        toast.error("处理失败: " + e.message);
        setOutput("");
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-rose-600 shadow-lg">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">对称加密/解密</h1>
          <p className="text-muted-foreground">支持 AES, DES, RC4 等常用对称加密算法</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8">
            <CardHeader>
                <CardTitle>文本内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>输入文本 (明文或密文)</Label>
                    <Textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="请输入..."
                        className="min-h-37.5 font-mono"
                    />
                </div>
                
                <div className="flex gap-4">
                    <Button onClick={() => handleProcess("encrypt")} className="flex-1 gap-2">
                        <Lock className="h-4 w-4" /> 加密
                    </Button>
                    <Button onClick={() => handleProcess("decrypt")} variant="secondary" className="flex-1 gap-2">
                        <Unlock className="h-4 w-4" /> 解密
                    </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <Label>处理结果</Label>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
                            <Copy className="h-4 w-4 mr-2" /> 复制
                        </Button>
                    </div>
                    <Textarea 
                        readOnly
                        value={output}
                        placeholder="结果将显示在这里..."
                        className="min-h-37.5 font-mono bg-muted/30"
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="md:col-span-4 h-fit">
            <CardHeader>
                <CardTitle>配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>算法</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ALGORITHMS.map(a => (
                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>密钥 (Passphrase)</Label>
                    <Input 
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="请输入加密/解密密钥"
                    />
                    <p className="text-xs text-muted-foreground">
                        安全性提示：所有计算均在本地浏览器执行，密钥不会发送到服务器。
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
