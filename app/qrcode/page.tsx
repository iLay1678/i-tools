"use client";

import { useState } from "react";
import { QrCode, Download, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

interface QRConfig {
  size: number;
  icon: string;
  iconSize: number;
  fgColor: string;
  bgColor: string;
  includeMargin: boolean;
  level: "L" | "M" | "Q" | "H";
}

export default function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [config, setConfig] = useState<QRConfig>({
    size: 200,
    icon: "",
    iconSize: 40,
    fgColor: "#000000",
    bgColor: "#ffffff",
    includeMargin: true,
    level: "M",
  });

  const handleConfigChange = (field: keyof QRConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      try {
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("二维码下载成功");
      } catch {
        toast.error("下载失败");
      }
    } else {
      toast.error("未找到二维码");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">二维码生成器</h1>
          <p className="text-muted-foreground">
            快速生成自定义二维码，支持多种样式配置
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">内容设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="text">文本内容</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="请输入要生成二维码的文本内容，如：网址、文本、微信号等..."
                  maxLength={2953}
                  className="min-h-25"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                样式配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">二维码大小 (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    value={config.size}
                    onChange={(e) =>
                      handleConfigChange(
                        "size",
                        parseInt(e.target.value) || 200
                      )
                    }
                    min={80}
                    max={500}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iconSize">图标大小 (px)</Label>
                  <Input
                    id="iconSize"
                    type="number"
                    value={config.iconSize}
                    onChange={(e) =>
                      handleConfigChange(
                        "iconSize",
                        parseInt(e.target.value) || 40
                      )
                    }
                    min={20}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">中心图标地址 (可选)</Label>
                <Input
                  id="icon"
                  value={config.icon}
                  onChange={(e) => handleConfigChange("icon", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fgColor">二维码颜色</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fgColor"
                      type="color"
                      value={config.fgColor}
                      onChange={(e) =>
                        handleConfigChange("fgColor", e.target.value)
                      }
                      className="h-9 w-full p-1 cursor-pointer"
                    />
                    <Input 
                      value={config.fgColor} 
                      onChange={(e) => handleConfigChange("fgColor", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgColor">背景颜色</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={config.bgColor}
                      onChange={(e) =>
                        handleConfigChange("bgColor", e.target.value)
                      }
                      className="h-9 w-full p-1 cursor-pointer"
                    />
                    <Input 
                      value={config.bgColor} 
                      onChange={(e) => handleConfigChange("bgColor", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>纠错等级</Label>
                  <Select
                    value={config.level}
                    onValueChange={(value: "L" | "M" | "Q" | "H") =>
                      handleConfigChange("level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L - 低 (7%)</SelectItem>
                      <SelectItem value="M">M - 中 (15%)</SelectItem>
                      <SelectItem value="Q">Q - 较高 (25%)</SelectItem>
                      <SelectItem value="H">H - 高 (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeMargin"
                      checked={config.includeMargin}
                      onCheckedChange={(checked) =>
                        handleConfigChange("includeMargin", checked)
                      }
                    />
                    <Label htmlFor="includeMargin">显示边框</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                实时预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center min-h-80 bg-muted/30 rounded-lg p-8 border border-dashed">
                {text ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <QRCodeCanvas
                        id="qr-code-canvas"
                        value={text}
                        size={config.size}
                        fgColor={config.fgColor}
                        bgColor={config.bgColor}
                        level={config.level}
                        includeMargin={config.includeMargin}
                        imageSettings={
                          config.icon
                            ? {
                                src: config.icon,
                                height: config.iconSize,
                                width: config.iconSize,
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      大小: {config.size}×{config.size}px
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>请在左侧输入内容后查看预览</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {text && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">下载选项</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={downloadQRCode}
                  className="w-full h-12 text-lg gap-2"
                >
                  <Download className="h-5 w-5" />
                  下载为 PNG
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">功能特点</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>支持文本、网址等多种内容</li>
                <li>自定义二维码颜色和背景色</li>
                <li>支持中心图标</li>
                <li>多种纠错等级可选</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">使用技巧</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>纠错等级越高容错性越强</li>
                <li>中心图标建议使用正方形</li>
                <li>深色二维码配浅色背景效果更佳</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">应用场景</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>网站链接快速分享</li>
                <li>联系方式信息传递</li>
                <li>活动邀请码生成</li>
                <li>产品信息展示</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
