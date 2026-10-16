// 从 page.tsx 抽出的类型、选项常量、表单字段描述、说明文案与控制面板展示组件（不含业务算法）。
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VCardPayloadInput, WifiEncryption } from "@/lib/qrcode-payload";

export type Mode = "wifi" | "vcard" | "sms";

export type Level = "L" | "M" | "Q" | "H";

export const SIZES: string[] = ["160", "220", "300"];

export const LEVELS: Array<[Level, string]> = [
  ["L", "L（7%）"],
  ["M", "M（15%）"],
  ["Q", "Q（25%）"],
  ["H", "H（30%）"],
];

export const ENCRYPTIONS: Array<[WifiEncryption, string]> = [
  ["WPA", "WPA / WPA2"],
  ["WEP", "WEP"],
  ["nopass", "无密码"],
];

export interface VCardField {
  key: keyof VCardPayloadInput;
  label: string;
  span?: boolean;
  textarea?: boolean;
}

export const VCARD_FIELDS: VCardField[] = [
  { key: "name", label: "姓名", span: true },
  { key: "phone", label: "电话" },
  { key: "email", label: "邮箱" },
  { key: "company", label: "公司" },
  { key: "title", label: "职位" },
  { key: "url", label: "网址", span: true },
  { key: "note", label: "备注", span: true, textarea: true },
];

export const HELP: string[] = [
  "WiFi 载荷遵循标准格式，会对反斜杠、分号、逗号、冒号、双引号做转义；无密码时使用 T:nopass 并省略 P。",
  "名片使用 vCard 3.0（CRLF 换行）；短信使用 SMSTO:号码:内容 格式。",
  "支持中文与 emoji（UTF-8）；内容过长可能导致二维码无法生成，请适当精简。",
];

export interface ControlsCardProps {
  mode: Mode;
  onModeChange: (value: Mode) => void;
  ssid: string;
  onSsidChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  encryption: WifiEncryption;
  onEncryptionChange: (value: WifiEncryption) => void;
  hidden: boolean;
  onHiddenChange: (value: boolean) => void;
  vcard: VCardPayloadInput;
  vcardSetters: Record<keyof VCardPayloadInput, (value: string) => void>;
  wifiEscaped: boolean;
  smsPhone: string;
  onSmsPhoneChange: (value: string) => void;
  smsMessage: string;
  onSmsMessageChange: (value: string) => void;
  size: string;
  onSizeChange: (value: string) => void;
  level: Level;
  onLevelChange: (value: Level) => void;
  fgColor: string;
  onFgColorChange: (value: string) => void;
  bgColor: string;
  onBgColorChange: (value: string) => void;
}

/** 左侧控制面板：模式切换与全部表单字段（纯展示，业务逻辑仍留在 page 层）。 */
export function ControlsCard(props: ControlsCardProps) {
  const {
    mode,
    onModeChange,
    ssid,
    onSsidChange,
    password,
    onPasswordChange,
    encryption,
    onEncryptionChange,
    hidden,
    onHiddenChange,
    vcard,
    vcardSetters,
    wifiEscaped,
    smsPhone,
    onSmsPhoneChange,
    smsMessage,
    onSmsMessageChange,
    size,
    onSizeChange,
    level,
    onLevelChange,
    fgColor,
    onFgColorChange,
    bgColor,
    onBgColorChange,
  } = props;

  return (
    <Card>
      <CardHeader className="pb-2">
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as Mode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wifi">WiFi</TabsTrigger>
            <TabsTrigger value="vcard">名片</TabsTrigger>
            <TabsTrigger value="sms">短信</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "wifi" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ssid">WiFi 名称（SSID）</Label>
              <Input id="ssid" value={ssid} onChange={(e) => onSsidChange(e.target.value)} placeholder="如 my-network" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="无密码可留空"
                disabled={encryption === "nopass"}
              />
            </div>
            <div className="space-y-2">
              <Label>加密方式</Label>
              <Select value={encryption} onValueChange={(v) => onEncryptionChange(v as WifiEncryption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCRYPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="hidden" className="cursor-pointer">
                隐藏网络
              </Label>
              <Switch id="hidden" checked={hidden} onCheckedChange={onHiddenChange} />
            </div>
            {wifiEscaped && <p className="text-xs text-muted-foreground">密码/名称含特殊字符，已自动转义。</p>}
          </>
        )}

        {mode === "vcard" && (
          <div className="grid grid-cols-2 gap-4">
            {VCARD_FIELDS.map((field) => (
              <div key={field.key} className={field.span ? "col-span-2 space-y-2" : "space-y-2"}>
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.textarea ? (
                  <Textarea
                    id={field.key}
                    value={vcard[field.key]}
                    onChange={(e) => vcardSetters[field.key](e.target.value)}
                    className="min-h-20"
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={vcard[field.key]}
                    onChange={(e) => vcardSetters[field.key](e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {mode === "sms" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="smsPhone">手机号</Label>
              <Input
                id="smsPhone"
                value={smsPhone}
                onChange={(e) => onSmsPhoneChange(e.target.value)}
                placeholder="如 13800138000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smsMessage">短信内容</Label>
              <Textarea
                id="smsMessage"
                value={smsMessage}
                onChange={(e) => onSmsMessageChange(e.target.value)}
                className="min-h-25"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>尺寸（px）</Label>
            <Select value={size} onValueChange={onSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>纠错等级</Label>
            <Select value={level} onValueChange={(v) => onLevelChange(v as Level)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>前景色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={fgColor}
                onChange={(e) => onFgColorChange(e.target.value)}
                className="h-9 w-full p-1 cursor-pointer"
              />
              <Input value={fgColor} onChange={(e) => onFgColorChange(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>背景色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={bgColor}
                onChange={(e) => onBgColorChange(e.target.value)}
                className="h-9 w-full p-1 cursor-pointer"
              />
              <Input value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="font-mono" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
