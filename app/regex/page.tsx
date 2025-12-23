"use client";

import { useState, useEffect } from "react";
import { Code, AlertCircle, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function RegexPage() {
  const [pattern, setPattern] = useState("([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})");
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false
  });
  const [text, setText] = useState("My email is example@mail.com and work@company.org.");
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!pattern) {
        setMatches([]);
        setError(null);
        return;
      }
      
      const flagStr = (flags.global ? 'g' : '') + (flags.ignoreCase ? 'i' : '') + (flags.multiline ? 'm' : '');
      const regex = new RegExp(pattern, flagStr);
      const allMatches = [];
      let match;
      
      if (flags.global) {
        while ((match = regex.exec(text)) !== null) {
          allMatches.push(match);
          if (match.index === regex.lastIndex) regex.lastIndex++; // Prevent infinite loop for zero-width matches
        }
      } else {
        match = regex.exec(text);
        if (match) allMatches.push(match);
      }
      
      setMatches(allMatches);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 shadow-lg">
          <Code className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">正则表达式测试</h1>
          <p className="text-muted-foreground">测试和调试正则表达式，支持实时匹配预览</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
             <CardTitle className="text-base">配置正则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
               <div className="flex-1 relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</div>
                 <Input 
                   value={pattern} 
                   onChange={(e) => setPattern(e.target.value)}
                   className={cn("pl-6 pr-10 font-mono", error && "border-destructive focus-visible:ring-destructive")}
                   placeholder="输入正则表达式模式..."
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">/</div>
               </div>
               <div className="flex items-center gap-4 px-2">
                  <FlagToggle label="g" active={flags.global} onToggle={(v) => setFlags({...flags, global: v})} title="全局匹配" />
                  <FlagToggle label="i" active={flags.ignoreCase} onToggle={(v) => setFlags({...flags, ignoreCase: v})} title="忽略大小写" />
                  <FlagToggle label="m" active={flags.multiline} onToggle={(v) => setFlags({...flags, multiline: v})} title="多行模式" />
               </div>
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
           <Card>
              <CardHeader>
                 <CardTitle className="text-base">测试文本</CardTitle>
              </CardHeader>
              <CardContent>
                 <Textarea 
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   placeholder="请在此输入需要匹配的文本..."
                   className="min-h-50 font-mono leading-relaxed"
                 />
              </CardContent>
           </Card>

           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-base">匹配结果 ({matches.length})</CardTitle>
                 {matches.length > 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </CardHeader>
              <CardContent className="space-y-3 max-h-50 overflow-y-auto">
                 {matches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm italic">
                       暂无匹配结果
                    </div>
                 ) : (
                    matches.map((m, i) => (
                       <div key={i} className="p-3 rounded-md bg-muted/50 border space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                             <span>Match {i + 1}</span>
                             <span>Index: {m.index}</span>
                          </div>
                          <div className="font-mono text-sm break-all">
                             {m[0]}
                          </div>
                          {m.length > 1 && (
                             <div className="pt-2 border-t mt-2 space-y-1">
                                {m.slice(1).map((group: string, gi: number) => (
                                   <div key={gi} className="flex gap-2 text-xs">
                                      <span className="text-muted-foreground font-mono">Group {gi + 1}:</span>
                                      <span className="font-mono text-primary">{group || "(empty)"}</span>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    ))
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function FlagToggle({ label, active, onToggle, title }: { label: string; active: boolean; onToggle: (v: boolean) => void; title: string }) {
  return (
    <div className="flex flex-col items-center gap-1" title={title}>
       <span className="text-[10px] font-bold text-muted-foreground font-mono">{label}</span>
       <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}
