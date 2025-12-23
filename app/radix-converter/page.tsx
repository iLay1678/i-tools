"use client";

import { useState } from "react";
import { Calculator, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RadixConverterPage() {
  const [values, setValues] = useState({
    bin: "",
    oct: "",
    dec: "",
    hex: ""
  });

  const handleUpdate = (val: string, radix: number) => {
    if (val === "") {
      setValues({ bin: "", oct: "", dec: "", hex: "" });
      return;
    }

    try {
      const decimal = parseInt(val, radix);
      if (isNaN(decimal)) return;

      setValues({
        bin: decimal.toString(2),
        oct: decimal.toString(8),
        dec: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase()
      });
    } catch {
      // Ignore invalid input
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const clearAll = () => setValues({ bin: "", oct: "", dec: "", hex: "" });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 shadow-lg">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">进制转换器</h1>
          <p className="text-muted-foreground">
            二、八、十、十六进制数值相互转换
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">转换面板</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              清空
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {/* Decimal */}
              <div className="space-y-2">
                <Label htmlFor="dec">十进制 (Decimal)</Label>
                <div className="flex gap-2">
                  <Input
                    id="dec"
                    placeholder="输入十进制数值..."
                    value={values.dec}
                    onChange={(e) => handleUpdate(e.target.value, 10)}
                    className="font-mono text-lg"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.dec)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Hexadecimal */}
              <div className="space-y-2">
                <Label htmlFor="hex">十六进制 (Hexadecimal)</Label>
                <div className="flex gap-2">
                  <Input
                    id="hex"
                    placeholder="输入十六进制数值..."
                    value={values.hex}
                    onChange={(e) => handleUpdate(e.target.value, 16)}
                    className="font-mono text-lg"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.hex)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Binary */}
              <div className="space-y-2">
                <Label htmlFor="bin">二进制 (Binary)</Label>
                <div className="flex gap-2">
                  <Input
                    id="bin"
                    placeholder="输入二进制数值..."
                    value={values.bin}
                    onChange={(e) => handleUpdate(e.target.value, 2)}
                    className="font-mono text-lg"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.bin)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Octal */}
              <div className="space-y-2">
                <Label htmlFor="oct">八进制 (Octal)</Label>
                <div className="flex gap-2">
                  <Input
                    id="oct"
                    placeholder="输入八进制数值..."
                    value={values.oct}
                    onChange={(e) => handleUpdate(e.target.value, 8)}
                    className="font-mono text-lg"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(values.oct)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 进制转换规则
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
            <li><strong>二进制 (Binary):</strong> 基数为2，由数字0和1组成。</li>
            <li><strong>八进制 (Octal):</strong> 基数为8，由数字0到7组成。</li>
            <li><strong>十进制 (Decimal):</strong> 基数为10，是我们日常生活中最常用的计数方式。</li>
            <li><strong>十六进制 (Hexadecimal):</strong> 基数为16，由0-9和A-F（代表10-15）组成。</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
