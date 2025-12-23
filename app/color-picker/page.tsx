"use client";

import { useState, useEffect } from "react";
import { Palette, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ColorPickerPage() {
  const [color, setColor] = useState("#4F46E5");
  const [formats, setFormats] = useState({
    hex: "#4F46E5",
    rgb: "rgb(79, 70, 229)",
    hsl: "hsl(243, 75%, 59%)"
  });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  useEffect(() => {
    const rgb = hexToRgb(color);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setFormats({
        hex: color.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      });
    }
  }, [color]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`已复制: ${text}`);
  };

  const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColor(randomHex.toUpperCase());
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-rose-600 shadow-lg">
          <Palette className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">颜色选择器</h1>
          <p className="text-muted-foreground">HEX、RGB、HSL 颜色格式互转</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-base">选择颜色</CardTitle>
             <Button variant="ghost" size="icon" onClick={randomColor}>
                <RefreshCw className="h-4 w-4" />
             </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className="w-full h-48 rounded-xl shadow-inner border border-white/20 transition-colors duration-200 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
               <input 
                 type="color" 
                 value={color} 
                 onChange={(e) => setColor(e.target.value.toUpperCase())}
                 className="opacity-0 w-full h-full cursor-pointer"
               />
               <span 
                 className="pointer-events-none font-mono font-bold text-2xl drop-shadow-md"
                 style={{ color: (hexToRgb(color)?.r || 0) * 0.299 + (hexToRgb(color)?.g || 0) * 0.587 + (hexToRgb(color)?.b || 0) * 0.114 > 186 ? 'black' : 'white' }}
               >
                 {color}
               </span>
            </div>
            
            <div className="space-y-4">
               <Label>手动输入 HEX</Label>
               <div className="flex gap-2">
                  <Input 
                    value={color} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-F]{0,6}$/i.test(val)) setColor(val);
                    }}
                    className="font-mono"
                    maxLength={7}
                  />
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="text-base">数值转换</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormatItem label="HEX" value={formats.hex} onCopy={() => copyToClipboard(formats.hex)} />
             <FormatItem label="RGB" value={formats.rgb} onCopy={() => copyToClipboard(formats.rgb)} />
             <FormatItem label="HSL" value={formats.hsl} onCopy={() => copyToClipboard(formats.hsl)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormatItem({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="space-y-2">
       <Label className="text-xs text-muted-foreground">{label}</Label>
       <div className="flex gap-2">
          <Input readOnly value={value} className="font-mono bg-muted/30" />
          <Button variant="outline" size="icon" onClick={onCopy}>
             <Copy className="h-4 w-4" />
          </Button>
       </div>
    </div>
  );
}
