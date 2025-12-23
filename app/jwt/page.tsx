"use client";

import { useState } from "react";
import { KeySquare, Copy, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<{
    header: any;
    payload: any;
    error: string | null;
  }>({
    header: null,
    payload: null,
    error: null,
  });

  const base64UrlDecode = (str: string) => {
    try {
      // Replace non-url compatible chars with base64 standard chars
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with =
      while (str.length % 4) {
        str += '=';
      }
      return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch {
      throw new Error("Invalid base64 encoding");
    }
  };

  const decodeJwt = (input: string) => {
    setToken(input);
    if (!input.trim()) {
      setDecoded({ header: null, payload: null, error: null });
      return;
    }

    const parts = input.split('.');
    if (parts.length !== 3) {
      setDecoded({ header: null, payload: null, error: "无效的 JWT 格式（必须包含三个由点分隔的部分）" });
      return;
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      setDecoded({ header, payload, error: null });
    } catch {
      setDecoded({ header: null, payload: null, error: "解码失败：请检查输入是否为有效的 JWT" });
    }
  };

  const copyToClipboard = async (data: any) => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("已复制 JSON 内容");
    } catch {
      toast.error("复制失败");
    }
  };

  const clearAll = () => {
    setToken("");
    setDecoded({ header: null, payload: null, error: null });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 shadow-lg">
          <KeySquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">JWT 解码器</h1>
          <p className="text-muted-foreground">
            解析 JSON Web Token 的 Header 和 Payload 内容
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="lg:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-purple-600">Encoded (输入 Token)</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="请在此粘贴 JWT Token..."
              className="min-h-100 font-mono text-sm break-all resize-none bg-muted/30"
              value={token}
              onChange={(e) => decodeJwt(e.target.value)}
            />
            {decoded.error && (
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{decoded.error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section - Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-blue-600">Header (头部)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(decoded.header)} disabled={!decoded.header}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto min-h-25">
              <pre className="text-sm font-mono text-blue-400">
                {decoded.header ? JSON.stringify(decoded.header, null, 2) : "// 等待输入..."}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Output Section - Payload */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-emerald-600">Payload (负载)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(decoded.payload)} disabled={!decoded.payload}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto min-h-50">
              <pre className="text-sm font-mono text-emerald-400">
                {decoded.payload ? JSON.stringify(decoded.payload, null, 2) : "// 等待输入..."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Note */}
      <Card className="border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-900 dark:text-emerald-400">安全提示</p>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80">
                解码过程完全在您的浏览器本地进行，Token 不会被发送到任何服务器。请放心使用。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
