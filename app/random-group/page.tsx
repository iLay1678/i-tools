"use client";

import { useState } from "react";
import { Users, Shuffle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RandomGroupPage() {
  const [namesText, setNamesText] = useState("");
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<string[][]>([]);

  const handleShuffle = () => {
    const names = namesText
      .split(/[,\n，]+/)
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (names.length === 0) {
      toast.error("请输入成员名单");
      return;
    }

    if (groupCount <= 0) {
      toast.error("分组数量必须大于 0");
      return;
    }

    // Shuffle names
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    
    // Create groups
    const newGroups: string[][] = Array.from({ length: groupCount }, () => []);
    shuffled.forEach((name, index) => {
      newGroups[index % groupCount].push(name);
    });

    setGroups(newGroups.filter(g => g.length > 0));
    toast.success("随机分组完成");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const formatGroupsText = () => {
    return groups
      .map((group, index) => `小组 ${index + 1}:
${group.join(", ")}`)
      .join("\n\n");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">随机分组工具</h1>
          <p className="text-muted-foreground">输入成员名单，公平地进行随机分组</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">名单与配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>成员名单 (支持换行或逗号分隔)</Label>
              <Textarea
                placeholder="张三&#10;李四&#10;王五&#10;赵六..."
                className="min-h-50 font-mono"
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>要分成的组数</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)}
                  className="w-24"
                />
                <Button onClick={handleShuffle} className="flex-1 gap-2">
                  <Shuffle className="h-4 w-4" />
                  立即随机分组
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">分组结果</CardTitle>
            {groups.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formatGroupsText())}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制全部
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-125">
            {groups.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12 italic">
                <Shuffle className="h-12 w-12 mb-2 opacity-10" />
                <p>点击“立即随机分组”查看结果</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {groups.map((group, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 border border-muted-foreground/10 space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-primary">第 {index + 1} 组</span>
                      <span className="text-xs text-muted-foreground">{group.length} 人</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.map((name, ni) => (
                        <span key={ni} className="px-2 py-1 bg-background rounded border text-sm">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
