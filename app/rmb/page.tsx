"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { toRmbUppercase } from "@/lib/rmb";

const EXAMPLES = ["0.5", "10000", "1000000.07", "-1234.56"];

export default function RmbPage() {
  const [input, setInput] = useState("");
  const result = useMemo(() => (input.trim() ? toRmbUppercase(input) : null), [input]);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
          <CircleDollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">人民币大写金额</h1>
          <p className="text-muted-foreground">数字金额转规范中文大写，报销与合同填写更省心</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">金额输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入金额，如 1000000.07（最多两位小数）"
            className="font-mono text-lg"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((item) => (
              <Button key={item} variant="secondary" size="sm" onClick={() => setInput(item)}>
                示例 {item}
              </Button>
            ))}
          </div>
          {result && !result.ok && (
            <Alert variant="destructive">
              <AlertTitle>输入有误</AlertTitle>
              <AlertDescription>{result.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">转换结果</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(result?.ok ? result.uppercase : "")}
            disabled={!result?.ok}
          >
            <Copy className="h-4 w-4 mr-2" />
            复制
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-1">
            <p className="text-xs text-muted-foreground">中文大写</p>
            <div className="text-2xl font-semibold break-all">{result?.ok ? result.uppercase : "-"}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs text-muted-foreground">千分位小写</p>
              <div className="font-mono text-lg font-semibold break-all">
                {result?.ok ? result.grouped : "-"}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs text-muted-foreground">规范化数字</p>
              <div className="font-mono text-lg font-semibold break-all">
                {result?.ok ? result.normalized : "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. 支持千分位与最多两位小数；超过两位小数会提示，且不会自动四舍五入。</p>
          <p>2. 无角分时末尾加「整」；有分无角补「零」；十位为 1 写作「壹拾」（银行规范）。</p>
          <p>3. 支持负数（前缀「负」）；金额上限 999999999999.99。</p>
        </CardContent>
      </Card>
    </div>
  );
}
