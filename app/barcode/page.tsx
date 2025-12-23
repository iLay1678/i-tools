"use client";

import React, { useState } from "react";
import Barcode from "react-barcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode as BarcodeIcon, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BarcodePage() {
  const [value, setValue] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);

  const handleDownload = () => {
    const svg = document.querySelector("#barcode-svg svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `barcode-${value}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("条形码已下载");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-zinc-700 to-slate-800 shadow-lg">
          <BarcodeIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">条形码生成</h1>
          <p className="text-muted-foreground">生成 EAN, UPC, CODE128 等多种格式条形码</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 flex flex-col items-center justify-center min-h-125 p-8">
            <div id="barcode-svg" className="p-8 bg-white rounded-xl shadow-xs border border-slate-100 overflow-x-auto max-w-full">
               {value ? (
                   <Barcode 
                      value={value}
                      format={format as any}
                      width={width}
                      height={height}
                      displayValue={displayValue}
                      background="#ffffff"
                      lineColor="#000000"
                   />
               ) : (
                   <div className="text-muted-foreground text-sm">请输入内容以生成条形码</div>
               )}
            </div>
            
            <div className="mt-8 flex gap-4">
                <Button onClick={handleDownload} disabled={!value}>
                    <Download className="h-4 w-4 mr-2" />
                    下载 PNG
                </Button>
            </div>
        </Card>

        <Card className="md:col-span-4 h-fit">
            <CardHeader>
                <CardTitle>配置选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>条码内容</Label>
                    <Input 
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="例如：123456789"
                    />
                </div>

                <div className="space-y-2">
                    <Label>格式</Label>
                    <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CODE128">CODE128 (默认)</SelectItem>
                            <SelectItem value="CODE39">CODE39</SelectItem>
                            <SelectItem value="EAN13">EAN13</SelectItem>
                            <SelectItem value="UPC">UPC</SelectItem>
                            <SelectItem value="ITF14">ITF14</SelectItem>
                            <SelectItem value="MSI">MSI</SelectItem>
                            <SelectItem value="pharmacode">Pharmacode</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>宽度: {width}</Label>
                        <Input 
                            type="range"
                            min="1"
                            max="4"
                            step="0.5"
                            value={width}
                            onChange={(e) => setWidth(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>高度: {height}</Label>
                        <Input 
                            type="range"
                            min="30"
                            max="200"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input 
                        type="checkbox" 
                        id="displayValue" 
                        checked={displayValue}
                        onChange={(e) => setDisplayValue(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        aria-label="显示文字"
                    />
                    <Label htmlFor="displayValue" className="cursor-pointer">显示文字</Label>
                </div>

                <Button variant="outline" onClick={() => setValue("")} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" /> 重置
                </Button>
            </CardContent>
        </Card>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
          💡 注意：某些格式（如 EAN13）对输入内容的长度和校验位有特殊要求，如果不符合规范可能无法显示。
      </div>
    </div>
  );
}
