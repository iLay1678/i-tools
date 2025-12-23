"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import { Car, MessageSquare, QrCode, Info, Copy, Zap, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";


const formSchema = z.object({
  plateNumber: z.string().min(1, "请输入车牌号"),
  phoneNumber: z
    .string()
    .min(1, "请输入联系电话")
    .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  token: z.string(),
  uid: z.string(),
  newEnergy: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MoveCar() {
  const [generatedUrl, setGeneratedUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNumber: "",
      phoneNumber: "",
      token: "",
      uid: "",
      newEnergy: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    const url = new URL(window.location.href + "/display");
    url.searchParams.append("plateNumber", values.plateNumber);
    url.searchParams.append("phoneNumber", values.phoneNumber);
    if (values.token) url.searchParams.append("token", values.token);
    if (values.uid) url.searchParams.append("uid", values.uid);
    if (values.newEnergy) url.searchParams.append("new", "true");
    setGeneratedUrl(url.toString());
    toast.success("码牌生成成功");
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success("链接已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const resetForm = () => {
    form.reset();
    setGeneratedUrl("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 shadow-lg">
          <Car className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">挪车码牌生成器</h1>
          <p className="text-muted-foreground">
            生成专属挪车码牌，让他人轻松联系您，支持微信推送通知
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Car className="h-4 w-4" />
                    车辆信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>车牌号</FormLabel>
                        <FormControl>
                          <Input placeholder="如：京A12345" {...field} className="text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>联系电话</FormLabel>
                        <FormControl>
                          <Input placeholder="如：13800138000" {...field} className="text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newEnergy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-emerald-500" />
                            新能源车辆
                          </FormLabel>
                          <FormDescription>
                            勾选此项将在码牌上显示新能源标识
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    微信推送设置（可选）
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4" />
                    <AlertTitle>提示</AlertTitle>
                    <AlertDescription>
                      配置微信推送后，当有人扫码时您将收到通知
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Token
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>WxPusher的应用Token</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="应用Token" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="uid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            UID
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>用户的UID</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="用户UID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    需要微信推送？
                    <a
                      href="https://wxpusher.zjiecode.com/docs/#/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      查看配置文档 →
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1 gap-2">
                  <QrCode className="h-4 w-4" />
                  生成挪车码牌
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={resetForm} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right: Preview */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4" />
                {generatedUrl ? "生成成功" : "预览区域"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {generatedUrl ? (
                <div className="space-y-6">
                  <Alert variant="default" className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>码牌生成成功！</AlertTitle>
                    <AlertDescription>
                      扫描二维码或点击链接查看码牌
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-sm border mx-auto">
                    <QRCodeSVG value={generatedUrl} size={200} />
                    <span className="text-sm text-muted-foreground">扫码查看码牌</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">码牌链接：</span>
                    <div className="p-3 bg-muted rounded-md break-all text-xs font-mono">
                      {generatedUrl}
                    </div>
                    <Button onClick={copyUrl} className="w-full gap-2" variant="secondary">
                      <Copy className="h-4 w-4" />
                      复制链接
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
                  <QrCode className="h-16 w-16 opacity-20" />
                  <p>填写完信息后，二维码将在这里显示</p>
                </div>
              )}
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
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">功能特点</h4>
              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                <li>快速生成专属挪车码牌</li>
                <li>支持新能源车辆标识</li>
                <li>可选微信推送功能</li>
                <li>移动端友好的码牌展示</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">使用步骤</h4>
              <ol className="list-decimal pl-4 text-xs text-muted-foreground space-y-1">
                <li>填写车牌号和联系电话</li>
                <li>选择是否为新能源车辆</li>
                <li>可选配置微信推送</li>
                <li>点击生成按钮获取码牌</li>
                <li>将二维码放置在车内</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">微信推送配置</h4>
              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                <li>访问 WxPusher 官网注册应用</li>
                <li>获取应用 Token 和用户 UID</li>
                <li>关注微信公众号绑定账号</li>
                <li>配置后可收到扫码通知</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
