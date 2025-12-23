"use client";

import { useState, useCallback } from "react";
import { Settings, RefreshCw, Copy, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StringConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  customChars: string;
  batchCount: number;
}

const defaultConfig: StringConfig = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeSimilar: false,
  customChars: "",
  batchCount: 1,
};

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const SIMILAR_CHARS = "0O1lI|";

export default function RandomStringGenerator() {
  const [config, setConfig] = useState<StringConfig>(defaultConfig);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);
  const [currentString, setCurrentString] = useState("");

  const handleConfigChange = (field: keyof StringConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const getCharacterSet = useCallback(() => {
    let chars = "";

    if (config.customChars) {
      chars = config.customChars;
    } else {
      if (config.includeUppercase) chars += UPPERCASE;
      if (config.includeLowercase) chars += LOWERCASE;
      if (config.includeNumbers) chars += NUMBERS;
      if (config.includeSymbols) chars += SYMBOLS;
    }

    if (config.excludeSimilar && !config.customChars) {
      chars = chars
        .split("")
        .filter((char) => !SIMILAR_CHARS.includes(char))
        .join("");
    }

    return chars;
  }, [config]);

  const generateRandomString = useCallback(
    (length: number, charset: string) => {
      if (!charset) return "";

      let result = "";
      const charactersLength = charset.length;

      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result;
    },
    []
  );

  const generateStrings = useCallback(() => {
    const charset = getCharacterSet();

    if (!charset) {
      toast.error("请至少选择一种字符类型");
      return;
    }

    const newStrings = [];
    for (let i = 0; i < config.batchCount; i++) {
      const randomStr = generateRandomString(config.length, charset);
      newStrings.push(randomStr);
    }

    setGeneratedStrings(newStrings);
    setCurrentString(newStrings[0] || "");
    toast.success(`成功生成 ${newStrings.length} 个随机字符串`);
  }, [config, getCharacterSet, generateRandomString]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("已复制到剪贴板");
      })
      .catch(() => {
        toast.error("复制失败");
      });
  };

  const copyAllStrings = () => {
    const allStrings = generatedStrings.join("\n");
    copyToClipboard(allStrings);
  };

  const getStrengthInfo = () => {
    const charset = getCharacterSet();
    const entropy = Math.log2(Math.pow(charset.length, config.length));

    let strength = "弱";
    let color = "bg-red-500 hover:bg-red-600";

    if (entropy >= 60) {
      strength = "极强";
      color = "bg-emerald-500 hover:bg-emerald-600";
    } else if (entropy >= 40) {
      strength = "强";
      color = "bg-cyan-500 hover:bg-cyan-600";
    } else if (entropy >= 25) {
      strength = "中等";
      color = "bg-amber-500 hover:bg-amber-600";
    }

    return { strength, entropy: entropy.toFixed(1), color };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">随机字符串生成器</h1>
          <p className="text-muted-foreground">
            生成安全可靠的随机字符串，支持多种字符集配置
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                基础设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">字符串长度</Label>
                  <div className="relative">
                    <Input
                      id="length"
                      type="number"
                      min={1}
                      max={1000}
                      value={config.length}
                      onChange={(e) =>
                        handleConfigChange("length", parseInt(e.target.value) || 1)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">位</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchCount">生成数量</Label>
                  <div className="relative">
                    <Input
                      id="batchCount"
                      type="number"
                      min={1}
                      max={100}
                      value={config.batchCount}
                      onChange={(e) =>
                        handleConfigChange("batchCount", parseInt(e.target.value) || 1)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">个</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">字符集选择</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={config.includeUppercase}
                    onCheckedChange={(checked) =>
                      handleConfigChange("includeUppercase", checked)
                    }
                  />
                  <Label htmlFor="uppercase">大写字母 (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={config.includeLowercase}
                    onCheckedChange={(checked) =>
                      handleConfigChange("includeLowercase", checked)
                    }
                  />
                  <Label htmlFor="lowercase">小写字母 (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={config.includeNumbers}
                    onCheckedChange={(checked) =>
                      handleConfigChange("includeNumbers", checked)
                    }
                  />
                  <Label htmlFor="numbers">数字 (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={config.includeSymbols}
                    onCheckedChange={(checked) =>
                      handleConfigChange("includeSymbols", checked)
                    }
                  />
                  <Label htmlFor="symbols">特殊符号</Label>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Checkbox
                    id="excludeSimilar"
                    checked={config.excludeSimilar}
                    onCheckedChange={(checked) =>
                      handleConfigChange("excludeSimilar", checked)
                    }
                  />
                  <Label htmlFor="excludeSimilar">排除相似字符 (0O1lI|)</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customChars">自定义字符集</Label>
                <Input
                  id="customChars"
                  value={config.customChars}
                  onChange={(e) =>
                    handleConfigChange("customChars", e.target.value)
                  }
                  placeholder="输入自定义字符集（将覆盖上述选择）"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Generate & Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                安全强度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">字符集大小</div>
                  <div className="text-xl font-bold">{getCharacterSet().length}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">安全熵</div>
                  <div className="text-xl font-bold">{strengthInfo.entropy}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">强度等级</div>
                  <Badge className={strengthInfo.color}>{strengthInfo.strength}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">生成控制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={generateStrings}
                className="w-full h-12 text-lg gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                生成随机字符串
              </Button>

              {generatedStrings.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(currentString)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    复制当前
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyAllStrings}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    复制全部
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedStrings.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">生成结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {config.batchCount === 1 ? (
                    <div className="relative">
                      <Input
                        value={currentString}
                        readOnly
                        className="font-mono text-lg pr-12"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => copyToClipboard(currentString)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Textarea
                      value={generatedStrings.join("\n")}
                      readOnly
                      className="font-mono min-h-50"
                    />
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    生成时间: {new Date().toLocaleTimeString()}
                  </div>
                </div>
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
                <li>支持多种字符集组合配置</li>
                <li>可排除容易混淆的相似字符</li>
                <li>支持自定义字符集</li>
                <li>批量生成多个字符串</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">安全建议</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>密码长度建议至少12位以上</li>
                <li>重要账户建议使用16位以上密码</li>
                <li>包含多种字符类型提高安全性</li>
                <li>定期更换重要账户密码</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">应用场景</h4>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>生成安全密码</li>
                <li>创建API密钥</li>
                <li>生成验证码</li>
                <li>创建随机标识符</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
            💡 提示：生成的字符串完全在本地浏览器中创建，不会发送到任何服务器。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
