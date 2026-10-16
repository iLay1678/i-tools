"use client";

import { useMemo, useRef, useState } from "react";
import { QrCode, Download, Copy } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  buildSmsPayload,
  buildVCardPayload,
  buildWifiPayload,
  escapeWifiValue,
  type VCardPayloadInput,
  type WifiEncryption,
} from "@/lib/qrcode-payload";
import {
  ControlsCard,
  HELP,
  type ControlsCardProps,
  type Level,
  type Mode,
} from "./constants";

export default function QrcodeWifiPage() {
  const [mode, setMode] = useState<Mode>("wifi");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<WifiEncryption>("WPA");
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [size, setSize] = useState("220");
  const [level, setLevel] = useState<Level>("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const svgRef = useRef<HTMLDivElement>(null);

  const vcard: VCardPayloadInput = { name, phone, email, company, title, url, note };
  const vcardSetters: Record<keyof VCardPayloadInput, (value: string) => void> = {
    name: setName,
    phone: setPhone,
    email: setEmail,
    company: setCompany,
    title: setTitle,
    url: setUrl,
    note: setNote,
  };

  const payload = useMemo(() => {
    if (mode === "wifi") {
      if (!ssid.trim()) return "";
      return buildWifiPayload({ ssid, password, encryption, hidden }).text;
    }
    if (mode === "vcard") {
      if (!name.trim() && !phone.trim()) return "";
      return buildVCardPayload({ name, phone, email, company, title, url, note });
    }
    if (!smsPhone.trim()) return "";
    return buildSmsPayload({ phone: smsPhone, message: smsMessage });
  }, [mode, ssid, password, encryption, hidden, name, phone, email, company, title, url, note, smsPhone, smsMessage]);

  const wifiEscaped =
    mode === "wifi" && (escapeWifiValue(ssid) !== ssid || escapeWifiValue(password) !== password);

  const requiredHint =
    mode === "wifi" && !ssid.trim()
      ? "请输入 WiFi 名称（SSID）"
      : mode === "sms" && !smsPhone.trim()
        ? "请输入短信接收手机号"
        : "";

  const downloadPng = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error("未找到二维码");
      return;
    }
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("二维码下载成功");
  };

  const downloadSvg = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) {
      toast.error("未找到二维码");
      return;
    }
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("SVG 下载已开始");
  };

  const copyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const controlsProps: ControlsCardProps = {
    mode,
    onModeChange: setMode,
    ssid,
    onSsidChange: setSsid,
    password,
    onPasswordChange: setPassword,
    encryption,
    onEncryptionChange: setEncryption,
    hidden,
    onHiddenChange: setHidden,
    vcard,
    vcardSetters,
    wifiEscaped,
    smsPhone,
    onSmsPhoneChange: setSmsPhone,
    smsMessage,
    onSmsMessageChange: setSmsMessage,
    size,
    onSizeChange: setSize,
    level,
    onLevelChange: setLevel,
    fgColor,
    onFgColorChange: setFgColor,
    bgColor,
    onBgColorChange: setBgColor,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg">
          <QrCode className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WiFi / 名片 / 短信二维码</h1>
          <p className="text-muted-foreground">扫码直连 WiFi、保存联系人、发送短信</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <ControlsCard {...controlsProps} />

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">实时预览</CardTitle>
            </CardHeader>
            <CardContent>
              {requiredHint && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>缺少必填项</AlertTitle>
                  <AlertDescription>{requiredHint}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col items-center justify-center min-h-72 bg-muted/20 rounded-lg p-8 border border-dashed">
                {payload ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={payload}
                      size={Number(size)}
                      level={level}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      includeMargin
                    />
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>填写信息后二维码将在此显示</p>
                  </div>
                )}
              </div>
              {/* 供 SVG 下载的隐藏渲染 */}
              <div ref={svgRef} className="hidden" aria-hidden>
                {payload && (
                  <QRCodeSVG value={payload} size={Number(size)} level={level} fgColor={fgColor} bgColor={bgColor} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">载荷与下载</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                readOnly
                value={payload}
                placeholder="载荷内容将显示在这里..."
                className="min-h-20 font-mono text-xs resize-none bg-muted/30"
              />
              <div className="flex gap-2">
                <Button onClick={downloadPng} className="flex-1 gap-2" disabled={!payload}>
                  <Download className="h-4 w-4" />
                  PNG
                </Button>
                <Button onClick={downloadSvg} variant="outline" className="flex-1 gap-2" disabled={!payload}>
                  <Download className="h-4 w-4" />
                  SVG
                </Button>
                <Button onClick={copyPayload} variant="outline" size="icon" disabled={!payload}>
                  <Copy className="h-4 w-4" />
                </Button>
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
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {HELP.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
