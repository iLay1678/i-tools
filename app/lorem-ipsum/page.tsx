"use client";

import { useState, useEffect } from "react";
import { Type, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const LOREM_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi.
Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam feugiat lorem non metus. Vestibulum dapibus nunc ac augue. Curabitur vestibulum aliquam leo. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.`;

export default function LoremIpsumPage() {
  const [paragraphs, setParagraphs] = useState(3);
  const [generated, setGenerated] = useState("");

  const generate = () => {
    const allParagraphs = LOREM_TEXT.split('\n');
    let result: string[] = [];
    
    // Simple logic: repeat paragraphs if requested count is larger than source
    for (let i = 0; i < paragraphs; i++) {
      result.push(allParagraphs[i % allParagraphs.length]);
    }
    
    setGenerated(result.join('\n\n'));
  };

  useEffect(() => {
    generate();
  }, [paragraphs]);

  const copyToClipboard = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-zinc-500 to-stone-600 shadow-lg">
          <Type className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lorem Ipsum 生成器</h1>
          <p className="text-muted-foreground">生成用于排版的拉丁文占位符文本</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>段落数量</Label>
                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{paragraphs}</span>
              </div>
              <Slider
                value={[paragraphs]}
                onValueChange={(v) => {
                    setParagraphs(v[0]);
                    // Auto regenerate on slider change for better UX? 
                    // Or let user click? Let's auto-generate in useEffect if we wanted, 
                    // but direct call is easier here to avoid loop issues.
                    // Actually, let's just update state and let user click generate, 
                    // or use an effect. Effect is cleaner.
                }}
                min={1}
                max={20}
                step={1}
                className="py-2"
              />
            </div>
            <Button onClick={generate} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              重新生成
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-base">生成结果</CardTitle>
             <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                复制
             </Button>
          </CardHeader>
          <CardContent>
             <div className="min-h-[300px] p-4 rounded-md bg-muted/30 whitespace-pre-wrap font-serif text-lg leading-relaxed text-muted-foreground">
                {generated}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
