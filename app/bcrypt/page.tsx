"use client";

import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, XCircle, Copy, Hash } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

export default function BcryptPage() {
  const [plainText, setPlainText] = useState("");
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashResult, setHashResult] = useState("");
  
  const [verifyText, setVerifyText] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const handleGenerate = async () => {
    if (!plainText) return;
    try {
      const hash = await bcrypt.hash(plainText, saltRounds);
      setHashResult(hash);
      toast.success("哈希生成成功");
    } catch {
      toast.error("生成失败");
    }
  };

  const handleVerify = async () => {
    if (!verifyText || !verifyHash) return;
    try {
      const match = await bcrypt.compare(verifyText, verifyHash);
      setIsMatch(match);
      if (match) {
        toast.success("验证成功：匹配");
      } else {
        toast.error("验证失败：不匹配");
      }
    } catch {
      setIsMatch(false);
      toast.error("验证过程出错，请检查哈希格式");
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-zinc-700 shadow-lg">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bcrypt 哈希生成与验证</h1>
          <p className="text-muted-foreground">生成安全的 Bcrypt 密码哈希或验证明文与哈希是否匹配</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                生成哈希
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>明文密码</Label>
                <Input 
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder="请输入要加密的文本"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between">
                    <Label>Salt Rounds (强度): {saltRounds}</Label>
                    <span className="text-xs text-muted-foreground">越高越慢</span>
                </div>
                <Slider
                    value={[saltRounds]}
                    onValueChange={(v) => setSaltRounds(v[0])}
                    min={4}
                    max={16}
                    step={1}
                />
            </div>

            <Button onClick={handleGenerate} disabled={!plainText} className="w-full">
                生成哈希
            </Button>

            {hashResult && (
                <div className="mt-4 p-3 bg-muted rounded-md break-all font-mono text-sm relative group">
                    {hashResult}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(hashResult)}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                验证哈希
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>明文密码</Label>
                <Input 
                    value={verifyText}
                    onChange={(e) => setVerifyText(e.target.value)}
                    placeholder="请输入明文"
                />
            </div>

            <div className="space-y-2">
                <Label>Bcrypt 哈希值</Label>
                <Input 
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    placeholder="$2a$10$..."
                />
            </div>

            <Button onClick={handleVerify} disabled={!verifyText || !verifyHash} variant="secondary" className="w-full">
                验证匹配
            </Button>

            {isMatch !== null && (
                <div className={`mt-4 p-4 rounded-md flex items-center justify-center gap-2 font-bold ${isMatch ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                    {isMatch ? (
                        <>
                            <CheckCircle className="h-5 w-5" /> 验证通过：匹配
                        </>
                    ) : (
                        <>
                            <XCircle className="h-5 w-5" /> 验证失败：不匹配
                        </>
                    )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
