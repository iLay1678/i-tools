"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloudDownload,
  Copy,
  LogIn,
  Loader2,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StatusResponse {
  status: "LoginSuccess" | "ScanSuccess" | "LoginFailed" | "QRCodeExpired" | "WaitLogin";
  access_token: string;
  refresh_token: string;
}

export default function AlipanTvToken() {
  const [hasGenerated, setHasGenerated] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [hasRefreshToken, setHasRefreshToken] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [currentSid, setCurrentSid] = useState("");
  const [currentHost, setCurrentHost] = useState("");

  const checkTimer = useRef<NodeJS.Timeout | null>(null);

  const getCurrentHost = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return "";
  };

  async function generateAuthUrl() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/alipan-tv-token/generate_qr", {
        method: "POST",
      });
      const data = await response.json();
      setCurrentSid(data.sid);
      setAuthUrl(`https://www.alipan.com/o/oauth/authorize?sid=${data.sid}`);
    } catch {
      toast.error("初始化失败，请检查网络");
    } finally {
      setIsLoading(false);
    }
  }

  function closeNotice() {
    setIsNoticeOpen(false);
  }

  async function checkStatus(sid: string) {
    try {
      const response = await fetch(`/api/alipan-tv-token/check_status/${sid}`);
      const data: StatusResponse = await response.json();
      if (data.status === "LoginSuccess") {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setHasAccessToken(!!data.access_token);
        setHasRefreshToken(!!data.refresh_token);
        setAuthorizing(false);
        toast.success("登录成功");
      } else if (data.status === "ScanSuccess") {
        checkTimer.current = setTimeout(() => checkStatus(sid), 2000);
      } else if (data.status === "LoginFailed") {
        setAuthorizing(false);
        toast.error("登录失败，请刷新页面重试");
      } else if (data.status === "QRCodeExpired") {
        setAuthorizing(false);
        toast.error("链接过期，请刷新页面重试");
      } else {
        // WaitLogin
        checkTimer.current = setTimeout(() => checkStatus(sid), 2000);
      }
    } catch (error) {
      console.error("检查状态时出错：", error);
      toast.error("发生错误，请稍后重试");
    }
  }

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${name} 已复制`);
    } catch {
      toast.error("复制失败");
    }
  };

  const handleAuth = (url: string) => {
    setAuthorizing(true);
    window.open(url, "_blank");

    if (currentSid) {
      if (checkTimer.current) {
        clearTimeout(checkTimer.current);
      }
      checkTimer.current = setTimeout(() => checkStatus(currentSid), 1000);
    }
  };

  useEffect(() => {
    setCurrentHost(getCurrentHost());
    setIsNoticeOpen(true);
    if (!hasGenerated) {
      generateAuthUrl();
      setHasGenerated(true);
    }

    return () => {
      if (checkTimer.current) {
        clearTimeout(checkTimer.current);
      }
    };
  }, [hasGenerated]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-600 shadow-lg">
          <CloudDownload className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">阿里云盘TV Token</h1>
          <p className="text-muted-foreground">
            获取阿里云盘TV端的授权令牌，解锁高速下载
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Tokens */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">访问令牌</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={!hasAccessToken}
                onClick={() => copyToClipboard(accessToken, "访问令牌")}
              >
                <Copy className="h-3 w-3" />
                复制
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={accessToken}
                readOnly
                rows={4}
                placeholder="授权成功后，访问令牌将显示在这里..."
                className="font-mono resize-none bg-muted/50 text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">刷新令牌</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                disabled={!hasRefreshToken}
                onClick={() => copyToClipboard(refreshToken, "刷新令牌")}
              >
                <Copy className="h-3 w-3" />
                复制
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={refreshToken}
                readOnly
                rows={3}
                placeholder="刷新令牌将显示在这里..."
                className="font-mono resize-none bg-muted/50 text-xs"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Auth Action */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LogIn className="h-4 w-4" />
                授权操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasAccessToken && !hasRefreshToken && (
                 <div className="py-8">
                     {isLoading ? (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>正在获取授权链接...</p>
                        </div>
                     ) : (
                        <Button
                            size="lg"
                            className="w-full gap-2 text-lg h-14"
                            onClick={() => handleAuth(authUrl)}
                            disabled={authorizing}
                        >
                            {authorizing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    授权中...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    开始授权登录
                                </>
                            )}
                        </Button>
                     )}
                 </div>
              )}
               {(hasAccessToken || hasRefreshToken) && (
                   <div className="py-8 flex flex-col items-center gap-4 text-emerald-600 dark:text-emerald-400">
                       <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                           <CloudDownload className="h-8 w-8" />
                       </div>
                       <p className="font-medium">已成功获取令牌</p>
                   </div>
               )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">API 路由</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <span className="text-sm font-medium">OAuth 令牌链接：</span>
              <div className="p-3 bg-muted rounded-md break-all text-xs font-mono">
                {currentHost}/api/oauth/alipan/token
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
               <h4 className="font-medium text-sm">功能说明</h4>
               <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>本工具帮助获取阿里云盘TV版的刷新令牌</li>
                <li>TV接口可绕过三方应用权益包的速率限制</li>
                <li>需要SVIP会员才能享受高速下载</li>
               </ul>
            </div>
            <div className="space-y-2">
               <h4 className="font-medium text-sm">使用步骤</h4>
               <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                 <li>点击"开始授权登录"按钮</li>
                <li>在弹出的页面中使用阿里云盘APP扫码</li>
                <li>授权成功后令牌会自动显示</li>
                <li>复制令牌到对应的播放软件中使用</li>
               </ul>
            </div>
          </div>
          <Alert className="bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
             <Info className="h-4 w-4" />
             <AlertTitle>温馨提示</AlertTitle>
             <AlertDescription>
               TV接口能绕过三方应用权益包的速率限制，但需要SVIP会员才能享受高速下载。
             </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>使用说明</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
             本工具能帮助你一键获取「阿里云盘TV版」的刷新令牌，完全免费。
             <br /><br />
             <strong>注意：</strong> TV接口能绕过三方应用权益包的速率限制，但前提你得是SVIP。
          </DialogDescription>
          <DialogFooter className="flex-col sm:flex-row gap-2">
             <Button
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              asChild
            >
              <a href="https://www.alipan.com/cpx/member?userCode=MjAyNTk2" target="_blank" rel="noopener noreferrer">
                 <ExternalLink className="h-4 w-4" />
                 开通会员
              </a>
            </Button>
            <Button onClick={closeNotice}>
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
