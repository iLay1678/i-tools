"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowLeftRight, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function TimestampPage() {
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState<string>("");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [currentTimestamp, setCurrentTimestamp] = useState("");

  useEffect(() => {
    // Initialize date time with current time
    setDateTime(dayjs().format("YYYY-MM-DDTHH:mm:ss"));
  }, []);

  useEffect(() => {
    const updateCurrent = () => {
      const now = Date.now();
      setCurrentTimestamp(
        unit === "seconds" ? Math.floor(now / 1000).toString() : now.toString()
      );
    };
    updateCurrent();
    const timer = setInterval(updateCurrent, 1000);
    return () => clearInterval(timer);
  }, [unit]);

  const handleUnitChange = (newUnit: "seconds" | "milliseconds") => {
    if (timestamp && !isNaN(Number(timestamp))) {
      const ts = Number(timestamp);
      if (unit === "seconds" && newUnit === "milliseconds") {
        setTimestamp((ts * 1000).toString());
      } else if (unit === "milliseconds" && newUnit === "seconds") {
        setTimestamp(Math.floor(ts / 1000).toString());
      }
    }
    setUnit(newUnit);
  };

  const timestampToDate = () => {
    if (!timestamp) {
      toast.warning("请输入时间戳");
      return;
    }
    const ts = parseInt(timestamp);
    if (isNaN(ts)) {
      toast.error("无效的时间戳");
      return;
    }
    const date = unit === "seconds" ? dayjs.unix(ts) : dayjs(ts);
    if (!date.isValid()) {
      toast.error("无效的时间戳");
      return;
    }
    setDateTime(date.format("YYYY-MM-DDTHH:mm:ss"));
    toast.success("转换成功");
  };

  const dateToTimestamp = () => {
    if (!dateTime) {
      toast.warning("请选择日期时间");
      return;
    }
    const date = dayjs(dateTime);
    const ts = unit === "seconds" ? date.unix() : date.valueOf();
    setTimestamp(ts.toString());
    toast.success("转换成功");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const setNow = () => {
    const now = dayjs();
    setDateTime(now.format("YYYY-MM-DDTHH:mm:ss"));
    const ts = unit === "seconds" ? now.unix() : now.valueOf();
    setTimestamp(ts.toString());
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">时间戳转换</h1>
          <p className="text-muted-foreground">
            Unix 时间戳与日期时间互相转换
          </p>
        </div>
      </div>

      {/* Current Timestamp */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4" />
            当前时间戳
          </CardTitle>
          <Tabs
            value={unit}
            onValueChange={(v) => handleUnitChange(v as "seconds" | "milliseconds")}
            className="w-[180px]"
          >
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="seconds" className="text-xs">秒(s)</TabsTrigger>
              <TabsTrigger value="milliseconds" className="text-xs">毫秒(ms)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="font-mono text-3xl font-bold text-primary tracking-wider">
              {currentTimestamp}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(currentTimestamp)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timestamp to Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">时间戳 → 日期时间</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder={`输入时间戳 (${unit === "seconds" ? "秒" : "毫秒"})`}
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="pr-20 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setTimestamp(currentTimestamp)}
                >
                  使用当前
                </Button>
              </div>
            </div>
            <Button onClick={timestampToDate} className="w-full gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              转换为日期时间
            </Button>
          </CardContent>
        </Card>

        {/* Date to Timestamp */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">日期时间 → 时间戳</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="datetime-local"
                  step="1"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <Button onClick={dateToTimestamp} className="w-full gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              转换为时间戳
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">转换结果</CardTitle>
          <Button variant="ghost" size="sm" onClick={setNow} className="gap-2 h-8">
            <RefreshCw className="h-3.5 w-3.5" />
            设为当前时间
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                时间戳 ({unit === "seconds" ? "秒" : "毫秒"})
              </p>
              <div className="font-mono text-lg font-semibold truncate">
                {timestamp || "-"}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                日期时间
              </p>
              <div className="font-mono text-lg font-semibold truncate">
                {dateTime ? dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss") : "-"}
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
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>Unix 时间戳是从 1970-01-01 00:00:00 UTC 开始的秒数</li>
                <li>支持秒级和毫秒级时间戳转换</li>
                <li>JavaScript 通常使用毫秒级时间戳</li>
              </ul>
            </div>
            <div className="space-y-2">
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>后端语言（如 PHP、Python）通常使用秒级时间戳</li>
                <li>点击"使用当前"可快速填入当前时间戳</li>
                <li>支持复制当前实时时间戳</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
