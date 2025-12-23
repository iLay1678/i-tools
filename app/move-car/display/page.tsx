"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { toast } from "sonner";
import { Car, Phone, Bell, Info } from "lucide-react";

export default function MoveCarDisplay() {
  const [plateNumber, setPlateNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [newEnergy, setNewEnergy] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPlateNumber(urlParams.get("plateNumber") || "");
    setPhoneNumber(urlParams.get("phoneNumber") || "");
    setToken(urlParams.get("token") || "");
    setUid(urlParams.get("uid") || "");
    setNewEnergy(urlParams.get("new") === "true");
  }, []);

  const notifyOwner = () => {
    const currentTime = new Date().getTime();
    const lastNotifyTimeKey = "lastNotifyTime" + plateNumber;
    const lastNotifyTime = localStorage.getItem(lastNotifyTimeKey);
    const timeDifference = lastNotifyTime
      ? (currentTime - parseInt(lastNotifyTime)) / 1000
      : 0;

    if (lastNotifyTime && timeDifference < 60) {
      toast.warning("您已发送过通知，请1分钟后再次尝试。");
      return;
    }

    const promise = fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appToken: token,
        content: "您好，有人需要您挪车，请及时处理。",
        contentType: 1,
        uids: [uid],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 1000) {
          localStorage.setItem(lastNotifyTimeKey, currentTime.toString());
          return "通知已发送！";
        } else {
          throw new Error("通知发送失败");
        }
      });
      
    toast.promise(promise, {
      loading: '正在发送通知...',
      success: (data) => data,
      error: '通知发送失败，请稍后重试',
    });
  };

  const callNumber = () => {
    window.location.href = "tel:" + phoneNumber;
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pt-4 px-2">
      {/* 车牌展示区域 */}
      <div className="flex justify-center py-2">
        <div
          className={`relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border-[3px] shadow-xl ${
            newEnergy
              ? "border-black/80 bg-linear-to-b from-[#F0F3F5] to-[#42C063] text-black"
              : "border-white bg-[#003399] text-white"
          }`}
        >
           {/* 装饰性反光效果 */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-50" />
          
          {/* 车牌边框内饰线 (仅蓝牌显示) */}
          {!newEnergy && (
             <div className="absolute inset-1 rounded-md border border-white/50" />
          )}

          <div className="relative z-10 flex items-center gap-1 font-mono text-5xl font-bold tracking-widest">
            <span>{plateNumber.slice(0, 2)}</span>
            {newEnergy ? (
                 <span className="mx-1 h-2 w-2 rounded-full bg-current opacity-20" /> 
            ) : (
                 <span className="mx-2 h-2 w-2 rounded-full bg-current opacity-80" />
            )}
            <span>{plateNumber.slice(2)}</span>
          </div>
          
           {/* 新能源标志水印 (仅绿牌显示) */}
           {newEnergy && (
               <div className="absolute -bottom-6 -right-6 rotate-12 opacity-10">
                   <Car className="h-24 w-24" />
               </div>
           )}
        </div>
      </div>

        {/* 车辆信息 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              车辆信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">临时停靠</div>
              <div className="col-span-2 font-medium">请多关照</div>
              
              <div className="text-muted-foreground">车牌号码</div>
              <div className="col-span-2 font-medium font-mono">{plateNumber}</div>
              
              <div className="text-muted-foreground">联系电话</div>
              <div className="col-span-2 font-medium font-mono">{phoneNumber}</div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card className="border-t-4 border-t-primary/20">
            <CardHeader>
                <CardTitle className="text-center">联系车主</CardTitle>
            </CardHeader>
          <CardContent className="space-y-3">
            {uid && token && (
              <Button
                size="lg"
                className={`w-full gap-2 text-lg h-14 ${
                    newEnergy 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
                } shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
                onClick={notifyOwner}
              >
                <Bell className="h-5 w-5" />
                微信通知车主
              </Button>
            )}

            <Button
              size="lg"
              variant={uid && token ? "outline" : "default"}
              className={`w-full gap-2 text-lg h-14 ${!(uid && token) ? (newEnergy 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]") : ""}`}
              onClick={callNumber}
            >
              <Phone className="h-5 w-5" />
              一键拨打电话
            </Button>
          </CardContent>
        </Card>

        {/* 温馨提示 */}
        <div className="px-4 py-2 bg-muted/50 rounded-lg text-xs text-center text-muted-foreground">
           💡 温馨提示：请文明用车，合理停放。如需挪车，请耐心等待车主回应。
        </div>
      </div>
  );
}
