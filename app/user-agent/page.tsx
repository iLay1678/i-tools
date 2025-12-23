"use client";

import { useState, useEffect } from "react";
import { Monitor, Globe, Cpu, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UAPage() {
  const [ua, setUa] = useState("");
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const currentUA = navigator.userAgent;
    setUa(currentUA);
    parseUA(currentUA);
  }, []);

  const parseUA = (userAgent: string) => {
    if (!userAgent) return;
    
    const browser = {
      name: "未知浏览器",
      version: ""
    };
    
    const os = {
      name: "未知操作系统",
      version: ""
    };

    // Simple Browser Detection
    if (userAgent.indexOf("Edg") > -1) { browser.name = "Edge"; }
    else if (userAgent.indexOf("Chrome") > -1) { browser.name = "Chrome"; }
    else if (userAgent.indexOf("Firefox") > -1) { browser.name = "Firefox"; }
    else if (userAgent.indexOf("Safari") > -1) { browser.name = "Safari"; }
    
    // Simple OS Detection
    if (userAgent.indexOf("Windows") > -1) { os.name = "Windows"; }
    else if (userAgent.indexOf("Mac OS") > -1) { os.name = "macOS"; }
    else if (userAgent.indexOf("Android") > -1) { os.name = "Android"; }
    else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) { os.name = "iOS"; }
    else if (userAgent.indexOf("Linux") > -1) { os.name = "Linux"; }

    setInfo({ browser, os });
  };

  const resetToMine = () => {
    const currentUA = navigator.userAgent;
    setUa(currentUA);
    parseUA(currentUA);
    toast.success("已重置为当前浏览器 UA");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-slate-600 to-slate-800 shadow-lg">
          <Monitor className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User-Agent 解析</h1>
          <p className="text-muted-foreground">解析浏览器 User-Agent 字符串详细信息</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">UA 字符串</CardTitle>
            <Button variant="outline" size="sm" onClick={resetToMine}>使用我的 UA</Button>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={ua} 
              onChange={(e) => {
                setUa(e.target.value);
                parseUA(e.target.value);
              }}
              className="font-mono min-h-25"
              placeholder="请在此粘贴 User-Agent 字符串..."
            />
          </CardContent>
        </Card>

        {info && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  浏览器信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">内核/名称</span>
                    <span className="font-bold">{info.browser.name}</span>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-orange-500" />
                  操作系统
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">系统名称</span>
                    <span className="font-bold">{info.os.name}</span>
                 </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              什么是 User-Agent？
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            User-Agent (UA) 是一个包含在 HTTP 请求头中的字符串，它向服务器标识用户所使用的操作系统、浏览器及其版本、渲染引擎等信息。服务器可以根据不同的 UA 返回适配的页面内容。
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
